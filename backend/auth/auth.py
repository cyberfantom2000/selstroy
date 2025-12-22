import base64
import hashlib
from uuid import UUID
from datetime import datetime, UTC, timedelta
from pydantic import BaseModel

from common import settings
from ..repository.models.common import User, UserCreate
from ..repository.models.auth import RefreshToken
from .exceptions import *


class CodeData(BaseModel):
    user_id: UUID | None = None
    privilege: str | None = None
    challenge: str | None = None
    state: str | None = None
    used: bool | None = None


class TokenFamily(BaseModel):
    access: str
    refresh: str
    csrf: str


class UserBlock(BaseModel):
    attempts: int = 0
    blocked_until: datetime | None = None


class AuthSystem:
    def __init__(self, token_manager, repo, redis, hasher, context):
        self.token_manager = token_manager
        self.repo = repo
        self.hasher = hasher
        self.context = context
        self.redis = redis

    async def authorize(self, session, username: str, password: str, code_challenge: str, state: str) -> tuple[str, str]:
        blocked = await self._user_is_blocked(username)
        if blocked:
            raise TooManyAttempts(blocked.blocked_until)

        user = await self.repo.get_user(session, login=username)
        if not user or not self.context.verify(password, user.password_hash):
            await self._fail_attempt(username)
            raise InvalidCredentials()

        await self._reset_attempts(username)

        code = self.token_manager.generate_simple_token()
        code_data = CodeData(user_id=user.id, privilege=user.privilege, challenge=code_challenge, state=state, used=False)
        await self.redis.add_dict(topic=code, data=code_data.model_dump(), ttl_secs=settings.code_ttl_secs)

        return code, state

    async def token(self, session, code: str, code_verifier: str, state: str) -> TokenFamily:
        code_data = self._model_or_none(CodeData, await self.redis.get_dict(topic=code))
        if not code_data or code_data.used or code_data.state != state:
            raise InvalidCode()

        if not self._verify_pkce(code_verifier, code_data.challenge):
            raise PkceFailed()

        code_data.used = True

        access = self.token_manager.create_access_token(str(code_data.user_id), {'privilege': code_data.privilege})
        refresh = self.token_manager.generate_refresh_token()
        csrf = self.token_manager.generate_refresh_token()

        await self.repo.create_token(session, RefreshToken(token=refresh, csrf=csrf, user_id=code_data.user_id))
        return TokenFamily(access=access, refresh=refresh, csrf=csrf)

    async def refresh(self, session, token: str) -> TokenFamily:
        rec = await self.repo.get(filters={'token': token})
        if not rec:
            raise RefreshFailed()

        rec.revoked = True
        await self.repo.update_token(rec)

        access = self.token_manager.create_access_token(str(rec.user.id), {'privilege': rec.user.privilege})
        refresh = self.token_manager.generate_refresh_token()
        csrf = self.token_manager.generate_refresh_token()
        await self.repo.create_token(session, RefreshToken(token=refresh, csrf=csrf, user_id=rec.user.id))
        return TokenFamily(access=access, refresh=refresh, csrf=csrf)

    async def revoke_one(self, session, token: str) -> None:
        rec = await self.repo.get_token(session, token)
        if rec:
            rec.revoked = True
            await self.repo.update_token(session, rec)

    async def revoke_all(self, session, token) -> None:
        rec = await self.repo.get_token(session, token)
        if rec:
            for token in rec.user.tokens:
                token.revoked = True
            await self.repo.update_token(session, rec) # TODO проверить что токены обновятся

    async def registration(self, session, new_user: User | UserCreate) -> User:
        users_ids = await self.repo.get_user(session=session, login=new_user.login)
        if users_ids:
            raise LoginAlreadyUsed()

        if not self._login_is_valid(new_user.login) or not self._password_is_valid(new_user.password):
            raise RegistrationError()

        user = User.model_validate(new_user)
        user.password_hash = self.hasher.hash(new_user.password)
        return await self.repo.create_user(session=session, new_user=user)

    async def _user_is_blocked(self, username: str) -> UserBlock | None:
        block = self._model_or_none(UserBlock, await self.redis.get_dict(topic=f'login-blocks:{username}'))
        if block and block.blocked_until and block.blocked_until > datetime.now(UTC):
            return block
        else:
            return None

    async def _fail_attempt(self, username: str) -> None:
        block = self._model_or_none(UserBlock, await self.redis.get_dict(topic=f'login-blocks:{username}'))
        if block is None:
            block = UserBlock()

        block.attempts += 1
        if block.attempts >= settings.login_attempts_before_block:
            block.blocked_until = datetime.now(UTC) + timedelta(minutes=settings.login_block_time_minutes)
            block.attempts = 0

        await self.redis.add_dict(topic=f'login-blocks:{username}', data=block.model_dump())

    async def _reset_attempts(self, username: str) -> None:
        await self.redis.delete_dict(topic=f'login-blocks:{username}')

    @staticmethod
    def _verify_pkce(verifier: str, challenge: str) -> bool:
        digest = hashlib.sha256(verifier.encode()).digest()
        url = base64.urlsafe_b64encode(digest).rstrip(b'=').decode()
        return url == challenge

    @staticmethod
    def _login_is_valid(login: str) -> bool:
        return bool(' ' not in login and 3 < len(login) < 64)

    @staticmethod
    def _password_is_valid(password: str) -> bool:
        return bool(6 < len(password) < 100  and
                    (not password.islower() and not password.isupper()) and
                    any(str(d) in password for d in (0, 1, 2, 3, 4, 5, 6, 7, 8, 9)))

    @staticmethod
    def _model_or_none(model_type, kwargs) -> BaseModel | None:
        """ Create model from kwargs. If kwargs is not dict return None
        :param model_type: type of model for create
        :param kwargs: model fields with values
        """
        if isinstance(kwargs, dict):
            return model_type(**kwargs)
        else:
            return None
