from fastapi import Request, APIRouter
from fastapi.responses import HTMLResponse

from .templates import templates


class MainViewRouter:
    def __init__(self, *args, **kwargs):
        self.router = APIRouter(*args, **kwargs)

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
        return templates.TemplateResponse( 
            request=request,
            name='pages/project.html',
        )

    async def apartment(self, slug: str, request: Request) -> HTMLResponse:
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
        )