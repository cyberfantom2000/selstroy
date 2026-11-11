from uuid import UUID

from backend.repository.managers import ModelManager
from backend.repository.models.apartment import Apartment
from .models import ApartmentFilters


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
        for project in projects:
            published_apartments = [apartment for apartment in (project.apartments or []) if not apartment.is_draft]

            accumulated_filters.types.extend([apartment.type for apartment in published_apartments])
            accumulated_filters.release_dates.append(project.release_date)

            if project.sale_status is not None:
                accumulated_filters.sale_statuses.append(project.sale_status)

            costs = {item.cost for apartment in published_apartments for item in (apartment.items or [])}
            if costs:
                accumulated_filters.cost_min = min(costs) if accumulated_filters.cost_min is None else min(min(costs), accumulated_filters.cost_min)
                accumulated_filters.cost_max = max(costs) if accumulated_filters.cost_max is None else max(max(costs), accumulated_filters.cost_max)

            if project.square_min is not None:
                accumulated_filters.square_min = project.square_min if accumulated_filters.square_min is None else min(project.square_min, accumulated_filters.square_min)

            if project.square_max is not None:
                accumulated_filters.square_max = project.square_max if accumulated_filters.square_max is None else max(project.square_max, accumulated_filters.square_max)

        accumulated_filters.projects = [project.id for project in projects]
        accumulated_filters.types = sorted(set(accumulated_filters.types))
        accumulated_filters.release_dates = sorted(set(accumulated_filters.release_dates))
        accumulated_filters.sale_statuses = sorted(set(accumulated_filters.sale_statuses))

        return accumulated_filters

    async def apartments(self, session, filters: ApartmentFilters) -> list[Apartment]:
        """ Get apartments by filters
        :param session: opened database session
        :param filters: apartments filters
        :return: list of matched apartments with sold-out apartments placed at the end
        """
        normalized_filters = self._normalize_apartments_filters(filters)
        apartments = await self.apartment_manager.get(session=session, filters=normalized_filters)
        if apartments is None:
            apartments = []

        has_cost_filter = filters.cost_min is not None or filters.cost_max is not None

        result = []
        for apartment in apartments:
            project = apartment.project
            if apartment.is_draft or project is None or project.is_draft:
                continue

            if filters.release_dates and project.release_date not in filters.release_dates:
                continue

            if filters.sale_statuses and project.sale_status not in filters.sale_statuses:
                continue

            if filters.square_min is not None and apartment.square < filters.square_min:
                continue

            if filters.square_max is not None and apartment.square > filters.square_max:
                continue

            costs = [item.cost for item in (apartment.items or [])]
            if costs:
                if filters.cost_min is not None and max(costs) < filters.cost_min:
                    continue

                if filters.cost_max is not None and min(costs) > filters.cost_max:
                    continue
            elif has_cost_filter:
                continue

            result.append(apartment)

        # Available apartments first, sold-out ones at the end
        result.sort(key=lambda item: not item.items)
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
            normalized_filters['project_id'] = filters.projects

        return normalized_filters
