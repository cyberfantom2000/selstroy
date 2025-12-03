from sqlalchemy.ext.asyncio import create_async_engine

from common import settings, get_logger

from .api import create_model_router, ModelCollection, HttpExceptionMapper
from .repository.models.project import *
from .repository.models.apartment import *
from .repository.managers import ModelManager
from .repository.models.project.project import ProjectUpdate
from .repository.repository import AsyncRepository

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

    elements = [(ModelManager(repo, ApartImage),
                 ModelCollection(public=ApartImagePublic, create=ApartImageCreate, update=ApartImageUpdate),
                 {'prefix': '/api/apartment/image', 'tags': ['Apartment Image']}),
                (ModelManager(repo, ApartElement),
                 ModelCollection(public=ApartElementPublic, create=ApartElementCreate, update=ApartElementUpdate),
                 {'prefix': '/api/apartment/element', 'tags': ['Apartment Element']}),
                (ModelManager(repo, Apartment),
                 ModelCollection(public=ApartmentPublic, create=ApartmentCreate, update=ApartmentUpdate),
                 {'prefix': '/api/apartment', 'tags': ['Apartment']}),

                (ModelManager(repo, ShortDescription),
                 ModelCollection(public=ShortDescriptionPublic, create=ShortDescriptionCreate, update=ShortDescriptionUpdate),
                 {'prefix': '/api/project/shortdescr', 'tags': ['Project Short Description']}),
                (ModelManager(repo, Description),
                 ModelCollection(public=DescriptionPublic, create=DescriptionCreate, update=DescriptionUpdate),
                 {'prefix': '/api/project/descr', 'tags': ['Project Description']}),
                (ModelManager(repo, Project),
                 ModelCollection(public=ProjectPublic, create=ProjectCreate, update=ProjectUpdate),
                 {'prefix': '/api/project', 'tags': ['Project']}),
                ]

    routers = [create_model_router(manager, collection, **kwargs) for manager, collection, kwargs in elements]

    _ = HttpExceptionMapper(app)

    for r in routers:
        log.debug(f"""Router registration. 
            name: {r.__name__}, 
            manager: {r.manager.__name__}, 
            model: {r.manager.model.__name__}""")
        app.include_router(r.router)
