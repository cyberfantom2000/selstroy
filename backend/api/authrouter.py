from fastapi import Request, APIRouter, Response
from pydantic import BaseModel

from common import settings

from ..auth.auth import AuthSystem
from ..repository.models.common import UserCreate, UserPublic

REFRESH_TOKEN_COOKIE = 'refresh_token'
CSRF_TOKEN_COOKIE = 'csrf_token'


class AuthorizeRequest(BaseModel):
    username: str
    password: str
    code_challenge: str
    state: str


class AuthorizeResponse(BaseModel):
    code: str
    state: str


class TokenRequest(BaseModel):
    code: str
    verifier: str
    state: str


class TokenResponse(BaseModel):
    token_type: str
    access_token: str
    expires_in: int


class RevokeRequest(BaseModel):
    token: str
    all: bool


class RevokeResponse(BaseModel):
    revoked: bool


class AuthRouter:
    def __init__(self, auth_system: AuthSystem, *args, **kwargs):
        self.router = APIRouter(*args, **kwargs)
        self.auth_system = auth_system

        self.router.add_api_route('/registration', self.registration, methods = ['POST'], response_model=UserPublic)
        self.router.add_api_route('/code', self.code, methods = ['POST'], response_model=AuthorizeResponse)
        self.router.add_api_route('/token', self.token, methods = ['POST'], response_model=TokenResponse)
        self.router.add_api_route('/refresh', self.refresh, methods = ['POST'], response_model=TokenResponse)
        self.router.add_api_route('/revoke', self.revoke, methods = ['POST'], response_model=RevokeResponse)

        self.refresh_path = self.router.prefix + '/refresh'
        self.auth_type = 'bearer'

    async def registration(self, request: Request, user: UserCreate):
        """ Registrate a new user"""
        return await self.auth_system.registration(request.state.db_session, user)


    async def code(self, request: Request, data: AuthorizeRequest):
        """ Request auth code """
        code, state = await self.auth_system.authorize(request.state.db_session,
                                                       username=data.username,
                                                       password=data.password,
                                                       code_challenge=data.code_challenge,
                                                       state=data.state)
        return AuthorizeResponse(code=code, state=state)

    async def token(self, request: Request, data: TokenRequest, response: Response):
        """ Request token family """
        token_family = await self.auth_system.token(request.state.db_session,
                                                    code=data.code,
                                                    code_verifier=data.code_verifier,
                                                    state=data.state)

        self._add_refresh_cookie(token_family.refresh, response)
        self._add_csrf_cookie(token_family.csrf, response)

        return TokenResponse(token_type=self.auth_type,
                             access_token=token_family.access_token,
                             expires_in=token_family.access_expires_in_secs)

    async def refresh(self, request: Request, response: Response):
        """ Request for refresh token family """
        csrf_cookie = request.cookies.get(CSRF_TOKEN_COOKIE)
        csrf_header = request.headers.get('X-CSRF-Token')

        refresh_token = request.cookies.get(REFRESH_TOKEN_COOKIE)

        token_family = await self.auth_system.refresh(request.state.db_session,
                                                      token=refresh_token,
                                                      csrf_cookie=csrf_cookie,
                                                      csrf_header=csrf_header)

        self._add_refresh_cookie(token_family.refresh, response)
        self._add_csrf_cookie(token_family.csrf, response)

        return TokenResponse(token_type=self.auth_type,
                             access_token=token_family.access_token,
                             expires_in=token_family.access_expires_in_secs)

    async def revoke(self, request: Request, data: RevokeRequest, response: Response):
        """ Request for revoke one or all tokens """
        if data.all:
            await self.auth_system.revoke_all(request.state.db_session, data.token)
        else:
            await self.auth_system.revoke_one(request.state.db_session, data.token)

        response.delete_cookie(key=REFRESH_TOKEN_COOKIE, path=self.refresh_path)
        response.delete_cookie(key=CSRF_TOKEN_COOKIE, path=self.refresh_path)

        return RevokeResponse(revoked=True)

    def _add_refresh_cookie(self, token: str, response: Response):
        response.set_cookie(key=REFRESH_TOKEN_COOKIE,
                            value=token,
                            httponly=True,
                            path=self.refresh_path,
                            samesite='strict',
                            secure=not settings.debug)

    def _add_csrf_cookie(self, token: str, response: Response):
        response.set_cookie(key=CSRF_TOKEN_COOKIE,
                            value=token,
                            httponly=False,
                            path=self.refresh_path,
                            samesite='strict',
                            secure=not settings.debug)

    def __str__(self):
        """ To debug output """
        return f'Name: {self.__class__.__name__}'