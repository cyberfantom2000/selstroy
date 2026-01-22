from fastapi import Request, APIRouter
from fastapi.responses import HTMLResponse

from .templates import templates


class MainViewRouter:
    def __init__(self, *args, **kwargs):
        self.router = APIRouter(*args, **kwargs)

        self.router.add_api_route('/', self.index)
        self.router.add_api_route('/projects', self.projects)
        self.router.add_api_route('/promo', self.promo)

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

    async def promo(self, request: Request) -> HTMLResponse:
        return templates.TemplateResponse(
            request=request,
            name='pages/promo.html',
        )