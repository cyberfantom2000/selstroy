import uuid
from typing import Union, Any
from fastapi import APIRouter, Query
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
            self.router.add_api_route('/{_id}', self.delete, methods=['DELETE'], response_class=JSONResponse)

        async def list(self, limit: int = 100, offset: int = 0,
                       fields: str = Query(default=None, description='Comma separated fields')):
            requested_fields = fields.split(',') if fields else None
            return self.manager.get(limit=limit, offset=offset, fields=requested_fields)

        async def query(self, filters: dict, fields: str = Query(default=None, description='Comma separated fields')):
            requested_fields = fields.split(',') if fields else None
            return self.manager.get(fields=requested_fields, filters=filters)

        async def create(self, new_el: model_collections.create):
            return self.manager.create(new_el)

        async def update(self, update: model_collections.update):
            return self.manager.update(update)

        async def delete(self, _id: model_collections.id_type):
            self.manager.delete(_id)
            return JSONResponse(status_code=200, content='Success deleted')

    return ModelRouter(manager, *args, **kwargs)
