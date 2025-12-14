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

    async def create(self, session, new_model: SQLModel) -> SQLModel:
        """
        Create new item and return it
        :param session: opened database session
        :param new_model: item prototype to create
        :return: created item
        """
        return await self.repo.create(session, self.model, model=new_model)

    async def update(self, session, update_model: SQLModel) -> SQLModel:
        """
        Update existing item.
        :param session: opened database session
        :param update_model: item prototype to update. Field id is required, another fields used to update
        :return: updated item

        :raise EntityNotFound: if update_model.id not exists
        """
        updatable = await self.get_by_id(session, update_model.id)
        return await self.repo.update(session, updatable, model=update_model)

    async def delete(self, session, model_id: uuid.UUID) -> SQLModel:
        """
        Delete existing item.
        :param session: opened database session
        :param model_id: Existing model id
        :return: deleted item. This item no longer exists in the repository.

        :raise EntityNotFound: if model_id not exists
        """
        item = await self.get_by_id(session, model_id)
        await self.repo.delete(session, item)
        return item

    async def get_by_id(self, session, uid: uuid.UUID) -> SQLModel:
        """ Get item by id
        :param session: opened database session
        :param uid: item id
        :return: item from repository

        :raise EntityNotFound: if item with uid does not exist
        """
        items = await self.get(session=session, filters={'id': uid})
        if not items:
            raise EntityNotFound(self.model)
        return items[0]

    async def get(self, *args,
                  session,
                  filters: dict | None = None,
                  limit: int = None,
                  offset: int = None,
                  fields: list[str] = None) -> list[SQLModel] | list[dict]:
        """
        Get item or fields
        :param args: positional arguments are not available
        :param session: opened database session
        :param filters: dict with filters. key - is a model attribute as string, value - item or collection for compare
        :param limit: count of request items
        :param offset: offset relative to the first element in the query
        :param fields: fields for get of mode_type
        :return: return model collection if fields argument is None else return collection of dict with model fields
        """
        filters = self._drop_extra_filters(filters)
        self._transform_id_filters(filters)

        if fields:
            attrs = [getattr(self.model, field) for field in fields]
            result = await self.repo.get_fields(session, self.model, *attrs, filters=filters, offset=offset, limit=limit)
            return self._zip_query_result(fields, result)
        else:
            a = await self.repo.get_items(session, self.model, filters=filters, offset=offset, limit=limit)
            return a

    async def commit(self, session) -> None:
        """ Low level operation. Commit session transactions
        :session: opened database session
        """
        await self.repo.commit(session)

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

    def _drop_extra_filters(self, filters: dict) -> dict:
        if filters:
            return {k: v for k, v in filters.items() if k in self.model.model_fields}
        else:
            return filters