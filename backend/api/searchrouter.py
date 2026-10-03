from fastapi import APIRouter, Request

from ..search import  ApartmentFiltersRequest, ApartmentFilters, SearchApartmentsResult
from ..search import  Searcher


class SearchRouter:
    def __init__(self, searcher: Searcher, *args, **kwargs):
        self.router = APIRouter(*args, **kwargs)
        self.searcher = searcher

        self.router.add_api_route('/apartments/filters', self.apartments_filters, methods=['POST'])
        self.router.add_api_route('/apartments', self.apartments, methods=['POST'])

    async def apartments_filters(self, request: Request, filters_request: ApartmentFiltersRequest) -> ApartmentFilters:
        """ Get available filters for projects"""
        return await self.searcher.apartments_filters(request.state.db_session, filters_request.projects)

    async def apartments(self, request: Request, filters: ApartmentFilters) -> SearchApartmentsResult:
        """ Get apartments by filters"""
        apartments = await self.searcher.apartments(request.state.db_session, filters)
        return SearchApartmentsResult(apartments=apartments)

    def __str__(self):
        """ To debug output """
        return f'Name: {self.__class__.__name__}'
