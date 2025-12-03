import uuid
from sqlmodel import SQLModel

from typing import Iterable

from ..exceptions import EntityNotFound


class ModelManager:
    """ Class for work with AsyncRepository """
    def __init__(self, model_type, repo):
        """
        Initialize
        :param model_type: model type for db operations. Must be inherited from SQLModel
        :param repo: AsyncRepository object
        """
        self.repo = repo
        self.model = model_type

    async def create(self, new_model: SQLModel) -> SQLModel:
        """
        Create new item and return it
        :param new_model: item prototype to create
        :return: created item
        """
        return await self.repo.create(self.model, model_data=new_model)

    async def update(self, update_model: SQLModel) -> SQLModel:
        """
        Update existing item.
        :param update_model: item prototype to update. Field id is required, another fields used to update
        :return: updated item

        :raise EntityNotFound: if update_model.id not exists
        """
        updatable = await self._get_item_by_id(update_model.id)
        if updatable is None:
            raise EntityNotFound(self.model)
        return await self.repo.update(updatable, obj=update_model)

    async def delete(self, model_id: uuid.UUID) -> SQLModel:
        """
        Delete existing item.
        :param model_id: Existing model id
        :return: deleted item. This item no longer exists in the repository.

        :raise EntityNotFound: if model_id not exists
        """
        item = await self._get_item_by_id(model_id)
        if item is None:
            raise EntityNotFound(self.model)
        await self.repo.delete(item)
        return item

    async def get(self, *args,
                  filters: dict | None = None,
                  limit: int = None,
                  offset: int = None,
                  fields: list[str] = None) -> list[SQLModel] | list[dict]:
        """
        Get item or fields
        :param args: positional arguments are not available
        :param filters: dict with filters. key - is a model attribute as string, value - item or collection for compare
        :param limit: count of request items
        :param offset: offset relative to the first element in the query
        :param fields: fields for get of mode_type
        :return: return model collection if fields argument is None else return collection of dict with model fields
        """
        self._transform_id_filters(filters)

        if fields:
            attrs = [getattr(self.model, field) for field in fields]
            result = await self.repo.get_fields(self.model, *attrs, filters=filters, offset=offset, limit=limit)
            return self._zip_query_result(fields, result)
        else:
            return await self.repo.get_items(self.model, filters=filters, offset=offset, limit=limit)

    async def _get_item_by_id(self, uid: uuid.UUID) -> SQLModel:
        """
        Get item by id
        :param uid: item uid
        :return: item from repository
        """
        items = await self.repo.get_items(self.model, filters={'id': uid})
        return None if not items else items[0]

    @staticmethod
    def _zip_query_result(fields: list[str], query_result: list) -> list:
        """
        Match fields with query result values
        :param fields: requested fields
        :param query_result: database query result
        :return: collection of dict with field-value result
        """
        if len(fields) == 1:
            return [dict(zip(fields, [value])) for value in query_result]
        else:
            return [dict(zip(fields, values)) for values in query_result]

    @staticmethod
    def _transform_id_filters(filters: dict | None) -> None:
        """
        Transform id field from string (or list of string) to uuid.UUID (or list of uuid.UUID).
        Attention: id field from filters would be update
        If filters is None or empty do nothing.
        If filters[id] is none then del this field.
        :param filters: dict for transform
        """
        if not filters:
            return

        if 'id' in filters:
            if not filters['id']:
                del filters['id']
            else:
                if not isinstance(filters['id'], str) and isinstance(filters['id'], Iterable):
                    filters['id'] = [uuid.UUID(str(el)) for el in filters['id']]
                else:
                    filters['id'] = uuid.UUID(str(filters['id']))
