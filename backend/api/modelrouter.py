import uuid
from typing import Union, Any
from fastapi import APIRouter, Query, Request
from fastapi.responses import JSONResponse
from dataclasses import dataclass


@dataclass
class ModelCollection:
    """ Collection of model types """
    public: object
    update: object
    create: object
    id_type: uuid.UUID = uuid.UUID


def create_model_router(manager, model_collections: ModelCollection, *args, **kwargs):
    """ Model router factory
    :param manager: model manager working with the repository
    :param model_collections: model collections. Used for router typing and automatic validation
    :param args: additional args. Will be passed to fast api router
    :param kwargs: additional kwargs. Will be passed to fast api router
    """
    class ModelRouter:
        """ CRUD model router """
        def __init__(self, manager, *args, **kwargs):
            self.router = APIRouter(*args, **kwargs)
            self.manager = manager

            self.router.add_api_route('', self.list, methods=['GET'],
                                      response_model=Union[list[model_collections.public], list[dict[str, Any]]])
            self.router.add_api_route('/query', self.query, methods=['POST'],
                                      response_model=Union[list[model_collections.public], list[dict[str, Any]]])
            self.router.add_api_route('', self.create, methods=['POST'], response_model=model_collections.public)
            self.router.add_api_route('', self.update, methods=['PATCH'], response_model=model_collections.public)
            self.router.add_api_route('/{uid}', self.delete, methods=['DELETE'], response_class=JSONResponse)

        async def list(self, request: Request, limit: int = 100, offset: int = 0,
                       fields: str = Query(default=None, description='Comma separated fields')):
            requested_fields = fields.split(',') if fields else None
            return await self.manager.get(session=request.state.db_session, limit=limit, offset=offset, fields=requested_fields)

        async def query(self, request: Request, filters: dict, fields: str = Query(default=None, description='Comma separated fields')):
            requested_fields = fields.split(',') if fields else None
            return await self.manager.get(session=request.state.db_session, fields=requested_fields, filters=filters)

        async def create(self, request: Request, new_el: model_collections.create):
            return await self.manager.create(session=request.state.db_session, new_model=new_el)

        async def update(self, request: Request, update: model_collections.update):
            return await self.manager.update(session=request.state.db_session, update_model=update)

        async def delete(self, request: Request, uid: model_collections.id_type):
            await self.manager.delete(session=request.state.db_session, model_id=uid)
            return JSONResponse(status_code=200, content='Success deleted')

        def __str__(self):
            """ To debug output """
            return f'Name: {self.__class__.__name__}, Manager: {self.manager.__class__.__name__}, Model: {self.manager.model.__name__}'

    return ModelRouter(manager, *args, **kwargs)
