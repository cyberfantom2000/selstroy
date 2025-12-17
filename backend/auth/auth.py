import base64
import hashlib
from uuid import UUID
from dataclasses import dataclass
from datetime import datetime, UTC, timedelta

from common import settings
from ..repository.models.common import User, UserCreate
from ..repository.models.auth import RefreshToken
from .exceptions import *


@dataclass
class CodeData:
    user_id: UUID
    privilege: str
    challenge: str
    state: str
    used: bool


@dataclass
class TokenFamily:
    access: str
    refresh: str
    csrf: str


@dataclass
class UserBlock:
    attempts: int
    blocked_until: datetime | None


class AuthSystem:
    def __init__(self, token_manager, repo, hasher, context):
        self.token_manager = token_manager
        self.repo = repo
        self.hasher = hasher
        self.context = context
        self.codes = {} # TODO to redis
        self.login_attempts = {} # TODO to redis

    async def authorize(self, session, username: str, password: str, code_challenge: str, state: str) -> tuple[str, str]:
        blocked = await self._user_is_blocked(username)
        if blocked:
            raise TooManyAttempts(blocked.blocked_until)

        user = await self.repo.get_user(session, login=username)
        if not user or self.context.verify(password, user.password_hash):
            await self._fail_attempt(username)
            raise InvalidCredentials()

        await self._reset_attempts(username)

        code = self.token_manager.generate_simple_token()
        self.codes[code] = CodeData(user_id=user.id, privilege=user.privilege, challenge=code_challenge, state=state, used=False)
        return code, state

    async def token(self, session, code: str, code_verifier: str, state: str) -> TokenFamily:
        code_data = self.codes.get(code)
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
        # TODO check username and password security and correctness(spacing and other)
        users_ids = await self.repo.get_user(session=session, login=new_user.login)
        if users_ids:
            raise RegistrationError()

        user = User.model_validate(new_user)
        user.password_hash = self.hasher.hash(new_user.password)
        return await self.repo.create_user(User, new_model=user)


    async def _user_is_blocked(self, username: str) -> UserBlock | None:
        block = self.login_attempts.get(username)
        if block and block.blcoked_until and block.blocked_until > datetime.now(UTC):
            return block
        else:
            return None

    async def _fail_attempt(self, username: str):
        if username not in self.login_attempts:
            self.login_attempts[username] = UserBlock(attempts=0, blocked_until=None)

        block = self.login_attempts[username]
        block.attempts += 1
        if block.attempts >= settings.login_attempts_before_block:
            block.blocked_until = datetime.now(UTC) + timedelta(minutes=settings.login_block_time_minutes)
            block.attempts = 0

    async def _reset_attempts(self, username: str):
        self.login_attempts.pop(username)

    @staticmethod
    def _verify_pkce(verifier: str, challenge: str) -> bool:
        digest = hashlib.sha256(verifier.encode()).digest()
        url = base64.urlsafe_b64encode(digest).rstrip(b'=').decode()
        return url == challenge