from uuid import UUID

from backend.repository.managers import ModelManager
from backend.repository.models.apartment import Apartment
from .models import ApartmentFilters, ProjectDescriptor


class Searcher:
    def __init__(self, project_manager: ModelManager, apartment_manager: ModelManager):
        self.project_manager = project_manager
        self.apartment_manager = apartment_manager

    async def apartments_filters(self, session, project_ids: list[UUID]) -> ApartmentFilters:
        """ Get available apartment filters
        :param session: opened database session
        :param project_ids: list of project UUIDs. if projects is empty then enumerating all projects
        :return: accumulated available filters
        """
        filters = {'is_draft': False, 'id': project_ids}
        projects = await self.project_manager.get(session=session, filters=filters)
        if projects is None:
            projects = []

        accumulated_filters = ApartmentFilters()
        founded_projects  = {}
        for project in projects:
            founded_projects[project.id] = project.title
            accumulated_filters.types.extend([apartment.type for apartment in project.apartments])
            accumulated_filters.release_dates.append(project.release_date)

            if project.sale_status is not None:
                accumulated_filters.sale_statuses.append(project.sale_status)

            costs = set()
            for apartment in project.apartments:
                costs.update({item.cost for item in apartment.items})
            if costs:
                accumulated_filters.cost_min = min(costs) if accumulated_filters.cost_min is None else min(min(costs), accumulated_filters.cost_min)
                accumulated_filters.cost_max = max(costs) if accumulated_filters.cost_max is None else max(max(costs), accumulated_filters.cost_max)

            accumulated_filters.square_min = project.square_min if accumulated_filters.square_min is None else min(project.square_min, accumulated_filters.square_min)
            accumulated_filters.square_max = project.square_max if accumulated_filters.square_max is None else max(project.square_max, accumulated_filters.square_max)

        accumulated_filters.projects = [ProjectDescriptor(id=k, title=v) for k, v in founded_projects.items()]
        accumulated_filters.types = list(set(accumulated_filters.types))
        accumulated_filters.release_dates = list(set(accumulated_filters.release_dates))
        accumulated_filters.sale_statuses = list(set(accumulated_filters.sale_statuses))

        return accumulated_filters

    async def apartments(self, session, filters: ApartmentFilters) -> list[Apartment]:
        """ Get apartments by filters
        :param session: opened database session
        :param filters: apartments filters
        :return: list of matched apartments
        """
        normalized_filters = self._normalize_apartments_filters(filters)
        apartments = await self.apartment_manager.get(session=session, filters=normalized_filters)

        result = []
        for apartment in apartments:
            if apartment.is_draft or apartment.project.is_draft:
                continue

            if filters.release_dates and  apartment.project.release_date not in filters.release_dates:
                continue

            if filters.sale_statuses and apartment.project.sale_status not in filters.sale_statuses:
                continue

            if filters.square_min is not None and apartment.square < filters.square_min:
                continue

            if filters.square_max is not None and apartment.square > filters.square_max:
                continue

            costs = [el.cost for el in apartment.items]
            if costs:
                if filters.cost_min is not None and max(costs) < filters.cost_min:
                    continue

                if filters.cost_max is not None and min(costs) > filters.cost_max:
                    continue

            result.append(apartment)

        return result

    @staticmethod
    def _normalize_apartments_filters(filters: ApartmentFilters) -> dict:
        """ Convert ApartmentFilters to normalized dict.
        Normalizes only some parameters
        """
        normalized_filters = {}

        if filters.types and isinstance(filters.types, list):
            normalized_filters['type'] = filters.types

        if filters.projects and isinstance(filters.projects, list):
            normalized_filters['project_id'] = [project.id for project in filters.projects]

        return normalized_filters
