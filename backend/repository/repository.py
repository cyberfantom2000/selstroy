import asyncio

from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.ext.asyncio.engine import AsyncEngine
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel, select, and_, or_
from typing import Iterable


def _is_collection(obj):
    return isinstance(obj, Iterable) and not isinstance(obj, str)


class AsyncRepository:
    """ Class for async CRUD operations with database """
    def __init__(self, async_engine):
        self.async_engine = async_engine

    async def get_items(self, model_type, *, filters=None, limit=None, offset=None) -> list[SQLModel]:
        """
        Get item collection
        :param model_type: model type for get. Must be inherited from SQLModel
        :param filters: dict with filters. key - is a model attribute as string, value - item or collection for compare
        :param limit: count of request item from DB
        :param offset: offset relative to the first element in the query
        :return: collection of model items less than or equal to the limit
        """
        conditions = self._to_model_conditions(model_type, filters)
        session = await self._make_session()
        return await self._get(model_type, conditions=conditions, session=session, limit=limit, offset=offset)

    async def get_fields(self, model_type, *fields, filters=None, limit=None, offset=None):
        """
        Get model fields collection
        :param model_type: model type for get. Must be inherited from SQLModel
        :param fields: fields for get of mode_type
        :param filters: dict with filters. key - is a model attribute as string, value - item or collection for compare
        :param limit: count of request item from DB
        :param offset: offset relative to the first element in the query
        :return: collection of dict with model fields. Result size less than or equal to the limit
        """
        conditions = self._to_model_conditions(model_type, filters)
        session = await self._make_session()
        return await self._get(*fields, conditions=conditions, session=session, limit=limit, offset=offset)

    async def create(self, model_type, model=None, **kwargs) -> SQLModel:
        """
        Create item. Use 'model' arg to create new item from prototype. Use kwargs if you want to create
        item from key-value arguments. The model arg has a higher priority.
        :param model_type: model type for create. Must be inherited from SQLModel
        :param model: model prototype. Fields this model used for create item
        :param kwargs: key-value model params used for create item
        :return: new created item
        """
        new = model_type.model_validate(model) if model else model_type(**kwargs)
        await self.create_all(model_type, [new])
        return new

    async def create_all(self, model_type, elements) -> list[SQLModel]:
        """
        Create item collection.
        :param model_type: model type for create. Must be inherited from SQLModel
        :param elements: collection of a model prototype. Fields of elements used for create items
        :return: collection of created model items
        """
        new_items = [model_type.model_validate(el) for el in elements]
        session = await self._make_session()
        await self._add_and_commit(new_items, session)

        await asyncio.gather(*[session.refresh(el) for el in new_items])

        return new_items

    async def update(self, updatable, model=None, **kwargs) -> SQLModel:
        """
        Update existing item. Use model arg if you want to update new item from prototype. Use kwargs if you want
        to update item from key-value arguments. The model arg has a higher priority.
        :param updatable: Updatable item. Must be inherited from SQLModel and exist in database
        :param model: model prototype. Fields this model used for update item
        :param kwargs: key-value model params used for update item
        :return: updated item
        """
        if model is None:
            model = updatable.__class__(**kwargs)

        await self.update_all([updatable], [model])
        return updatable

    async def update_all(self, updatable_items, updates) -> list[SQLModel]:
        """
        Update item collection. Collection 'updatable_items' will be matched to collection 'updates' to apply updates
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

        session = await self._make_session()
        await self._add_and_commit(updatable_items, session)

        await asyncio.gather(*[session.refresh(el) for el in updatable_items])

        return updatable_items

    async def delete(self, to_delete) -> None:
        """
        Delete existing item from database.
        :param to_delete: item to delete. Must be inherited from SQLModel
        :return: None
        """
        session = await self._make_session()
        await self._delete(to_delete if _is_collection(to_delete) else [to_delete], session)

    async def _make_session(self) -> AsyncSession:
        """ Generator for create async session """
        async_session = sessionmaker(self.async_engine, class_=AsyncEngine, expire_on_commit=False)
        async with async_session() as session:
            yield session

    @staticmethod
    async def _get(*args, conditions: list, session, limit: int, offset: int) -> list[SQLModel]:
        """
        Facade for get item/items from database.
        :param args: parameters for pass to select() instruction
        :param conditions: collection of conditions used in 'where' instruction. All conditions concat from and_()
        :param session: Opened session for database interaction
        :param limit: count of request item from database
        :param offset: offset relative to the first element in the query
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

            res = await session.exec(statement).all()
            return list(res)
        except Exception as e:
            await session.rollback()
            raise e

    @staticmethod
    async def _add_and_commit(data, session) -> None:
        """
        Facade for create/update item into database and commit changed
        :param data: element for create/update
        :param session: opened database session
        :return: None
        """
        await AsyncRepository._add(data, session)
        await AsyncRepository._commit(session)

    @staticmethod
    async def _delete(models, session) -> None:
        """
        Facade for delete elements from database
        :param models: elements for delete
        :param session: opened database session
        :return: None
        """
        try:
            await asyncio.gather(*[session.delte(el) for el in models])
            await session.commit()
        except Exception as e:
            await session.rollback()
            raise e

    @staticmethod
    async def _add(data, session) -> None:
        """
        Facade for add element to sql query
        :param data: element or element collection
        :param session: opened database session
        :return: None
        """
        try:
            if _is_collection(data):
                await session.add_all(data)
            else:
                await session.add(data)
        except Exception as e:
            await session.rollback()
            raise e

    @staticmethod
    async def _commit(session) -> None:
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
