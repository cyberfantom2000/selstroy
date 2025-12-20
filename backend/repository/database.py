import asyncio

from sqlmodel import SQLModel, select, and_, or_
from typing import Iterable


def _is_collection(obj):
    return isinstance(obj, Iterable) and not isinstance(obj, str) and not isinstance(obj, SQLModel)


class AsyncRepository:
    """ Class for async CRUD operations with database """
    async def get_items(self, session, model_type, *, filters=None, limit=None, offset=None) -> list[SQLModel]:
        """
        Get item collection
        :param session: Opened session for database interaction
        :param model_type: model type for get. Must be inherited from SQLModel
        :param filters: dict with filters. key - is a model attribute as string, value - item or collection for compare
        :param limit: count of request item from DB
        :param offset: offset relative to the first element in the query
        :return: collection of model items less than or equal to the limit
        """
        conditions = self._to_model_conditions(model_type, filters)
        return await self.get(model_type, session=session, conditions=conditions, limit=limit, offset=offset)

    async def get_fields(self, session, model_type, *fields, filters=None, limit=None, offset=None):
        """
        Get model fields collection
        :param session: Opened session for database interaction
        :param model_type: model type for get. Must be inherited from SQLModel
        :param fields: fields for get of mode_type
        :param filters: dict with filters. key - is a model attribute as string, value - item or collection for compare
        :param limit: count of request item from DB
        :param offset: offset relative to the first element in the query
        :return: collection of dict with model fields. Result size less than or equal to the limit
        """
        conditions = self._to_model_conditions(model_type, filters)
        return await self.get(*fields, session=session, conditions=conditions, limit=limit, offset=offset)

    async def create(self, session, model_type, model=None, **kwargs) -> SQLModel:
        """
        Create item. Use 'model' arg to create new item from prototype. Use kwargs if you want to create
        item from key-value arguments. The model arg has a higher priority.
        :param session: Opened session for database interaction
        :param model_type: model type for create. Must be inherited from SQLModel
        :param model: model prototype. Fields this model used for create item
        :param kwargs: key-value model params used for create item
        :return: new created item
        """
        new = model if model else model_type(**kwargs)
        created = await self.create_all(session, model_type, [new])
        return created[0]

    async def create_all(self, session, model_type, elements) -> list[SQLModel]:
        """
        Create item collection.
        :param session: Opened session for database interaction
        :param model_type: model type for create. Must be inherited from SQLModel
        :param elements: collection of a model prototype. Fields of elements used for create items
        :return: collection of created model items
        """
        new_items = [model_type.model_validate(el) for el in elements]
        await self.add_and_commit(session, new_items)
        return await self.refresh(session, new_items)

    async def update(self, session, updatable, model=None, **kwargs) -> SQLModel:
        """
        Update existing item. Use model arg if you want to update new item from prototype. Use kwargs if you want
        to update item from key-value arguments. The model arg has a higher priority.
        :param session: Opened session for database interaction
        :param updatable: Updatable item. Must be inherited from SQLModel and exist in database
        :param model: model prototype. Fields this model used for update item
        :param kwargs: key-value model params used for update item
        :return: updated item
        """
        if model is None:
            model = updatable.__class__(**kwargs)

        await self.update_all(session, [updatable], [model])
        return updatable

    async def update_all(self, session, updatable_items, updates) -> list[SQLModel]:
        """
        Update item collection. Collection 'updatable_items' will be matched to collection 'updates' to apply updates
        :param session: Opened session for database interaction
        :param updatable_items: Collection of items for update.
        :param updates: collection of prototypes for updating.
        :return: collection of updated items
        """
        for item, update in zip(updatable_items, updates):
            exclude_fields = set(update.model_fields.keys()) - set(item.model_fields.keys())
            exclude_fields.add('id')
            data = update.model_dump(exclude_unset=True, exclude_none=True, exclude=exclude_fields)
            for key, val in data.items():
                setattr(item, key, val)

        await self.add_and_commit(session, updatable_items)
        return await self.refresh(session, updatable_items)

    async def delete(self, session, to_delete) -> None:
        """
        Delete existing item from database.
        :param session: Opened session for database interaction
        :param to_delete: item to delete. Must be inherited from SQLModel or list[SQLModel]
        :return: None
        """
        deleting = to_delete if _is_collection(to_delete) else [to_delete]
        await self._delete(session, deleting)

    @staticmethod
    async def refresh(session, items) -> list[SQLModel]:
        """ Refresh items data
        :session: Opened session for database interaction
        :items: collection of items to update
        """
        to_refresh = items if _is_collection(items) else [items]
        await asyncio.gather(*[session.refresh(el) for el in to_refresh])
        return items

    @staticmethod
    async def add_and_commit(session, data) -> None:
        """
        Facade for create/update item into database and commit changed
        :param session: opened database session
        :param data: element for create/update
        :return: None
        """
        await AsyncRepository.add(session, data)
        await AsyncRepository.commit(session)

    @staticmethod
    async def get(*args, session, conditions: list, limit: int, offset: int) -> list[SQLModel]:
        """
        Facade for get item/items from database.
        :param args: parameters for pass to select() instruction
        :param conditions: collection of conditions used in 'where' instruction. All conditions concat from and_()
        :param limit: count of request item from database
        :param offset: offset relative to the first element in the query
        :param session: Opened session for database interaction
        :return: collection of items
        """
        try:
            statement = select(*args)

            if limit:
                statement = statement.limit(limit)
            if offset:
                statement = statement.offset(offset)
            if conditions:
                statement = statement.where(and_(*conditions))

            res = await session.exec(statement)
            return list(res)
        except Exception as e:
            await session.rollback()
            raise e

    @staticmethod
    async def _delete(session, items) -> None:
        """
        Facade for delete elements from database
        :param session: opened database session
        :param items: elements for delete
        :return: None
        """
        try:
            await asyncio.gather(*[session.delete(el) for el in items])
            await session.commit()
        except Exception as e:
            await session.rollback()
            raise e

    @staticmethod
    async def add(session, data) -> None:
        """
        Facade for add element to sql query
        :param session: opened database session
        :param data: element or element collection
        :return: None
        """
        try:
            if _is_collection(data):
                session.add_all(data)
            else:
                session.add(data)
        except Exception as e:
            await session.rollback()
            raise e

    @staticmethod
    async def commit(session) -> None:
        """
        Commit session changed
        :param session: opened database session
        :return: None
        """
        try:
            await session.commit()
        except Exception as e:
            await session.rollback()
            raise e

    @staticmethod
    def _to_model_conditions(model_type, filters: dict) -> list:
        """
        Convert filters to list of model conditions. 'filters' keys must be equal of 'model' fields
        :param model_type: model type for create conditions. Must be inherited from SQLModel
        :param filters: dict with filters. key - is a model attribute as string, value - item or collection for compare
        :return: list of conditions. Empty list if filters is empty
        """
        if filters:
            result = []
            for key, val in filters.items():
                if _is_collection(val):
                    result.append(or_(*[getattr(model_type, key) == el for el in val]))
                else:
                    result.append(getattr(model_type, key) == val)
            return result
        else:
            return []
