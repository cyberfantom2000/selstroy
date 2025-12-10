from sqlalchemy.ext.asyncio import create_async_engine
from pathlib import Path

from sqlalchemy.sql.base import elements

from common import settings, get_logger

from .api import create_model_router, ModelCollection, HttpExceptionMapper, FileRouter
from .repository.models.project import *
from .repository.models.apartment import *
from .repository.managers import *
from .repository.models.promotion import *
from .repository.models.common import *
from .repository.repository import AsyncRepository
from .repository.localstorage import LocalStorage

log = get_logger(settings, 'backend')

def register(app) -> None:
    """ Register backend
    :param app: fast api application
    """
    log.info(f'Registering backend')

    log.debug(f'Creating async engine. url: {settings.db_url}, echo: {settings.debug}')
    engine = create_async_engine(settings.db_url, echo=settings.debug, future=True)

    log.info(f'Creating async repository')
    repo = AsyncRepository(engine)

    elements = [(ApartImageManager(ApartImage, repo),
                 ModelCollection(public=ApartImagePublic, create=ApartImageCreate, update=ApartImageUpdate),
                 {'prefix': '/api/apartment/image', 'tags': ['Apartment Image']}),
                (ModelManager(ApartElement, repo),
                 ModelCollection(public=ApartElementPublic, create=ApartElementCreate, update=ApartElementUpdate),
                 {'prefix': '/api/apartment/element', 'tags': ['Apartment Element']}),
                (ApartmentManager(Apartment, repo),
                 ModelCollection(public=ApartmentPublic, create=ApartmentCreate, update=ApartmentUpdate),
                 {'prefix': '/api/apartment', 'tags': ['Apartment']}),
                (ProjectShortDescriptionManager(ProjectShortDescription, repo),
                 ModelCollection(public=ProjectShortDescriptionPublic, create=ProjectShortDescriptionCreate, update=ProjectShortDescriptionUpdate),
                 {'prefix': '/api/project/shortdescr', 'tags': ['Project Short Description']}),
                (ProjectDetailsManager(ProjectDetails, repo),
                 ModelCollection(public=ProjectDetailsPublic, create=ProjectDetailsCreate, update=ProjectDetailsUpdate),
                 {'prefix': '/api/project/details', 'tags': ['Project Details']}),
                (ProjectManager(Project, repo),
                 ModelCollection(public=ProjectPublic, create=ProjectCreate, update=ProjectUpdate),
                 {'prefix': '/api/project', 'tags': ['Project']}),
                (PromotionManager(Promotion, repo),
                 ModelCollection(public=PromotionPublic, create=PromotionCreate, update=PromotionUpdate),
                 {'prefix': '/api/promotion', 'tags': ['Promotion']}),
                ]

    routers = [create_model_router(manager, collection, **kwargs) for manager, collection, kwargs in elements]

    local_storage = LocalStorage(Path(settings.upload_dir))
    file_manager = ModelManager(repo, File)
    routers.append(FileRouter(local_storage, file_manager, prefix='/api/file', tags=['File']))

    _ = HttpExceptionMapper(app)

    for r in routers:
        log.debug(f"""Router registration. {r}""")
        app.include_router(r.router)
