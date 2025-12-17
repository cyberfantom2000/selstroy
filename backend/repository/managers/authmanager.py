from uuid import UUID
from sqlmodel import SQLModel

from ..models.auth import RefreshToken
from ..models.common.user import User
from .base import ModelManager


class AuthModelManager:
    """ Class for work with AsyncRepository """
    def __init__(self, repo):
        """
        Initializer
        :param repo: AsyncRepository object
        """
        self.user_manager = ModelManager(User, repo)
        self.token_manager = ModelManager(RefreshToken, repo)

    async def get_user(self, session, uid: UUID = None, login: str = None) -> SQLModel | None:
        """ Get user by UID or login. If uid != None try return record by id otherwise try return model by login
        :param session: opened database session
        :param uid: user ID
        :param login: user login
        :return founded User or None
        """
        filters = {'id': uid} if uid else {'login': login}
        items = await self.user_manager.get(session=session, filters=filters)
        return items[0] if items else None

    async def create_user(self, session, new_user: User) -> SQLModel:
        """ Create new user and return it
        :param session: opened database session
        :param new_user: user to create
        :return created User
        """
        return await self.user_manager.create(session=session, new_model=new_user)

    async def get_token(self, session, token: str) -> SQLModel | None:
        """ Get token record by token string
        :param session: opened database session
        :param token: token string
        :return found RefreshToken or None
        """
        items = await self.token_manager.get(session=session, filters={'token': token})
        return items[0] if items else None

    async def create_token(self, session, token: RefreshToken) -> SQLModel:
        """ Create new token and return it
        :param session: opened database session
        :param token: token to create
        :return created token
        """
        return await self.token_manager.create(session=session, new_model=token)

    async def update_token(self, session, token: RefreshToken) -> SQLModel:
        """ Update existing RefreshToken
         :param session: opened database session
         :param token: token to update
         :return updated token
         """
        return await self.token_manager.update(session=session, update_model=token)
