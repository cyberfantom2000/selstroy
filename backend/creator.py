from sqlalchemy.ext.asyncio import create_async_engine

from common import settings, get_logger

from .api import create_model_router, ModelCollection, HttpExceptionMapper, FileRouter
from .repository.models.project import *
from .repository.models.apartment import *
from .repository.managers import *
from .repository.models.promotion import *
from .repository.models.common import *
from .repository.repository import AsyncRepository
from .repository.localstorage import LocalStorage

log = get_logger(settings.logger_name, 'backend')

def register(app) -> None:
    """ Register backend
    :param app: fast api application
    """
    log.info(f'Registering backend')

    log.debug(f'Creating async engine. url: {settings.db_url}, echo: {settings.debug}')
    engine = create_async_engine(settings.db_url, echo=settings.debug)

    log.info(f'Creating async repository')
    repo = AsyncRepository(engine)

    elements = [(ApartImageManager(repo, ApartImage),
                 ModelCollection(public=ApartImagePublic, create=ApartImageCreate, update=ApartImageUpdate),
                 {'prefix': '/api/apartment/image', 'tags': ['Apartment Image']}),
                (ModelManager(repo, ApartElement),
                 ModelCollection(public=ApartElementPublic, create=ApartElementCreate, update=ApartElementUpdate),
                 {'prefix': '/api/apartment/element', 'tags': ['Apartment Element']}),
                (ApartmentManager(repo, Apartment),
                 ModelCollection(public=ApartmentPublic, create=ApartmentCreate, update=ApartmentUpdate),
                 {'prefix': '/api/apartment', 'tags': ['Apartment']}),
                (ProjectShortDescriptionManager(repo, ProjectShortDescription),
                 ModelCollection(public=ProjectShortDescriptionPublic, create=ProjectShortDescriptionCreate, update=ProjectShortDescriptionUpdate),
                 {'prefix': '/api/project/shortdescr', 'tags': ['Project Short Description']}),
                (ProjectDetailsManager(repo, ProjectDetails),
                 ModelCollection(public=ProjectDetailsPublic, create=ProjectDetailsCreate, update=ProjectDetailsUpdate),
                 {'prefix': '/api/project/details', 'tags': ['Project Details']}),
                (ProjectManager(repo, Project),
                 ModelCollection(public=ProjectPublic, create=ProjectCreate, update=ProjectUpdate),
                 {'prefix': '/api/project', 'tags': ['Project']}),
                (PromotionManager(repo, Promotion),
                 ModelCollection(public=PromotionPublic, create=PromotionCreate, update=PromotionUpdate),
                 {'prefix': '/api/promotion', 'tags': ['Promotion']}),
                ]

    routers = [create_model_router(manager, collection, **kwargs) for manager, collection, kwargs in elements]

    local_storage = LocalStorage(settings.upload_dir)
    file_manager = ModelManager(repo, File)
    routers.append(FileRouter(local_storage, file_manager, prefix='/api/file', tags=['File']))

    _ = HttpExceptionMapper(app)

    for r in routers:
        log.debug(f"""Router registration. 
            name: {r.__name__}, 
            manager: {r.manager.__name__}, 
            model: {r.manager.model.__name__}""")
        app.include_router(r.router)
