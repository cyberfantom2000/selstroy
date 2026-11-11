from fastapi import Request, APIRouter
from fastapi.responses import HTMLResponse

from ..repository.managers import ModelManager
from .templates import templates


class MainViewRouter:
    def __init__(self,
                 project_manager: ModelManager | None = None,
                 apartment_manager: ModelManager | None = None,
                 *args, **kwargs):
        self.router = APIRouter(*args, **kwargs)
        self.project_manager = project_manager
        self.apartment_manager = apartment_manager

        self.router.add_api_route('/', self.index, include_in_schema=False)
        self.router.add_api_route('/projects', self.projects, include_in_schema=False)
        self.router.add_api_route('/projects/{slug}', self.project, include_in_schema=False)
        self.router.add_api_route('/apartments/{slug}', self.apartment, include_in_schema=False)
        self.router.add_api_route('/promo', self.promo, include_in_schema=False)
        self.router.add_api_route('/gallery', self.gallery, include_in_schema=False)
        self.router.add_api_route('/contacts', self.contacts, include_in_schema=False)
        self.router.add_api_route('/about', self.about, include_in_schema=False)
        self.router.add_api_route('/renovation', self.renovation, include_in_schema=False)
        self.router.add_api_route('/admin', self.admin, include_in_schema=False)
        self.router.add_api_route('/{fullpath:path}', self.not_found, include_in_schema=False)

    async def index(self, request: Request) -> HTMLResponse:
        return templates.TemplateResponse(
            request=request,
            name='pages/index.html',
        )

    async def projects(self, request: Request) -> HTMLResponse:
        return templates.TemplateResponse(
            request=request,
            name='pages/projects.html',
        )

    async def project(self, slug: str, request: Request) -> HTMLResponse:
        if not await self._published_entity_exists(request, self.project_manager, slug):
            return await self.not_found(request)

        return templates.TemplateResponse(
            request=request,
            name='pages/project.html',
        )

    async def apartment(self, slug: str, request: Request) -> HTMLResponse:
        if not await self._published_entity_exists(request, self.apartment_manager, slug):
            return await self.not_found(request)

        return templates.TemplateResponse(
            request=request,
            name='pages/apartment.html',
        )

    async def promo(self, request: Request) -> HTMLResponse:
        return templates.TemplateResponse(
            request=request,
            name='pages/promo.html',
        )

    async def gallery(self, request: Request) -> HTMLResponse:
        return templates.TemplateResponse(
            request=request,
            name='pages/gallery.html',
        )

    async def contacts(self, request: Request) -> HTMLResponse:
        return templates.TemplateResponse(
            request=request,
            name='pages/contacts.html',
        )

    async def about(self, request: Request) -> HTMLResponse:
        return templates.TemplateResponse(
            request=request,
            name='pages/about.html',
        )

    async def renovation(self, request: Request) -> HTMLResponse:
        return templates.TemplateResponse(
            request=request,
            name='pages/renovation.html',
        )

    async def admin(self, request: Request) -> HTMLResponse:
        return templates.TemplateResponse(
            request=request,
            name='pages/admin/admin.html'
        )

    async def not_found(self, request: Request) -> HTMLResponse:
        return templates.TemplateResponse(
            request=request,
            name='pages/404.html',
            status_code=404,
        )

    @staticmethod
    async def _published_entity_exists(request: Request, manager: ModelManager | None, slug: str) -> bool:
        """ Check that a published entity with the given slug exists.
        Skip the check when the manager or the database session is unavailable.
        """
        if manager is None:
            return True

        session = getattr(request.state, 'db_session', None)
        if session is None:
            return True

        items = await manager.get(session=session, filters={'slug': slug, 'is_draft': False},
                                  fields=['id'], limit=1)
        return bool(items)
