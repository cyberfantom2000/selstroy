from fastapi import APIRouter, Request

from ..repository.managers import SiteSettingsManager
from ..repository.models.settings import SiteSettingsPublic, SiteSettingsUpdate


class SiteSettingsRouter:
    def __init__(self, manager: SiteSettingsManager, *args, **kwargs):
        self.router = APIRouter(*args, **kwargs)
        self.manager = manager

        self.router.add_api_route('', self.get, methods=['GET'], response_model=SiteSettingsPublic)
        self.router.add_api_route('', self.update, methods=['PATCH'], response_model=SiteSettingsPublic)

    async def get(self, request: Request):
        return await self.manager.current(session=request.state.db_session)

    async def update(self, request: Request, update: SiteSettingsUpdate):
        return await self.manager.update(session=request.state.db_session, update_model=update)

    def __str__(self):
        return f'Name: {self.__class__.__name__}, Manager: {self.manager.__class__.__name__}'
