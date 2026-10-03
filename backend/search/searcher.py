from uuid import UUID

from backend.repository.managers import ModelManager
from repository.models.apartment import Apartment
from repository.models.apartment.apartment import ApartmentBase
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
            accumulated_filters.types.append(project.type)
            accumulated_filters.release_years.append(project.release_date.year)
            accumulated_filters.sale_statuses.append(project.sale_status)
            accumulated_filters.cost_from = project.cost_from if accumulated_filters.cost_from is None else min(project.cost_from, accumulated_filters.cost_from)
            accumulated_filters.cost_to = project.cost_to if accumulated_filters.cost_to is None else max(project.cost_to, accumulated_filters.cost_to)
            accumulated_filters.square_from = project.square_min if accumulated_filters.square_from is None else min(project.square_min, accumulated_filters.square_from)
            accumulated_filters.square_to = project.square_max if accumulated_filters.square_to is None else max(project.square_max, accumulated_filters.square_to)

        accumulated_filters.projects = [ProjectDescriptor(id=k, title=v) for k, v in founded_projects.items()]
        accumulated_filters.types = list(set(accumulated_filters.types))
        accumulated_filters.release_years = list(set(accumulated_filters.release_years))
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

            if apartment.release_data.year not in filters.release_years:
                continue

            if filters.square_from is not None and apartment.square >= filters.square_from:
                continue

            if filters.square_to is not None and apartment.square <= filters.square_to:
                continue

            costs = [el.cost for el in apartment.items]

            if filters.cost_from is not None and max(costs) >= filters.cost_from:
                continue

            if filters.cost_to is not None and min(costs) <= filters.cost_to:
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

        if filters.sale_statuses and isinstance(filters.sale_statuses, list):
            normalized_filters['sale_status'] = filters.sale_statuses

        if filters.projects and isinstance(filters.projects, list):
            normalized_filters['project_id'] = [project.id for project in filters.projects]

        return normalized_filters
