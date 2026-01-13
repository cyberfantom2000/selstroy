from sqlalchemy.ext.asyncio import create_async_engine
from pathlib import Path

from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.orm import sessionmaker

from redis.asyncio import Redis
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from common import settings, get_logger, DatabaseDSN

from .api import create_model_router, ModelCollection, FileRouter, AuthRouter
from .api.middlewares import HttpExceptionMapper, DatabaseSessionMiddleware, OAuthMiddleware
from .api.openapi import custom_openapi
from .auth import AuthSystem, Hasher, TokenManager, AuthSecrets, TokenConfig
from .auth.secrets import SECRET_KEY
from .tasks import ClearTokenTask
from .repository.models.project import *
from .repository.models.apartment import *
from .repository.managers import *
from .repository.models.promotion import *
from .repository.models.common import *
from .repository.database import AsyncRepository
from .repository.localstorage import LocalStorage
from .repository.redis import RedisLocal, RedisRemote, RedisFacade


log = get_logger(settings, 'BackendCreator')

def register(app, lifespan) -> None:
    """ Register backend
    :param app: fast api application
    :param lifespan: application lifespan
    """
    log.info(f'registering backend')

    log.info(f'creating async repository')
    repo = AsyncRepository()

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

    log.info('creating local storage')
    local_storage = LocalStorage(Path(settings.upload_dir))
    file_manager = ModelManager(File, repo)
    routers.append(FileRouter(local_storage, file_manager, prefix='/api/file', tags=['File']))

    log.info('crating auth system')
    hasher = Hasher()
    token_secrets = AuthSecrets(algorithm=settings.token_algorithm, key=SECRET_KEY)
    token_config = TokenConfig(access_ttl_minutes=settings.access_token_ttl_minutes,
                               refresh_ttl_days=settings.refresh_token_ttl_days)
    token_manager = TokenManager(secrets=token_secrets, config=token_config)
    auth_model_manager = AuthModelManager(repo=repo)
    redis_local = RedisLocal(capacity=settings.redis_local_capacity)
    redis_client = Redis(host=settings.redis_host, port=settings.redis_port, decode_responses=True)
    redis_remote = RedisRemote(client=redis_client)
    redis_facade = RedisFacade(local=redis_local, remote=redis_remote)
    auth_system = AuthSystem(token_manager=token_manager, repo=auth_model_manager, redis=redis_facade, hasher=hasher)
    auth_router = AuthRouter(auth_system=auth_system, prefix='/api/auth', tags=['Authorization'])
    routers.append(auth_router)

    for r in routers:
        log.debug(f'''register router: {r}''')
        app.include_router(r.router)

    db_dsn = DatabaseDSN(settings)
    log.debug(f'creating async engine. url: {db_dsn}, echo: {settings.debug}')
    async_engine = create_async_engine(db_dsn.to_url(), echo=settings.debug, future=True)
    async_session = sessionmaker(bind=async_engine, class_=AsyncSession, expire_on_commit=False)

    db_allowed_routes = [router.router.prefix for router in routers]
    log.info('adding session middleware')
    app.add_middleware(DatabaseSessionMiddleware, session=async_session, allowed_routes=db_allowed_routes)

    oauth_allowed_routes = [router.router.prefix for router in routers if router != auth_router]
    log.info('adding oauth middleware')
    app.add_middleware(OAuthMiddleware, auth_system=auth_system, allowed_routes=oauth_allowed_routes)

    log.info('creating http exception mapper')
    _ = HttpExceptionMapper(app)

    exclude_auth_routes = [route.path for route in auth_router.router.routes]
    log.info('customize openapi schema')
    app.openapi = custom_openapi(app, exclude_auth_routes)

    log.info('creating scheduler')
    scheduler = AsyncIOScheduler()

    log.info('adding clearing expired refresh tokens task')
    clear_token_task = ClearTokenTask(async_session, repo, settings.refresh_token_ttl_days_after_expired)
    scheduler.add_job(clear_token_task.execute, trigger='interval', days=1, id='refresh_token_cleaning')

    lifespan.add_starting_task(scheduler.start)
    lifespan.add_shutdown_task(scheduler.shutdown)