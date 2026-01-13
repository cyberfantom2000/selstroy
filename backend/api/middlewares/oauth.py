from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from fastapi import Request, HTTPException, status


class OAuthMiddleware(BaseHTTPMiddleware):
    """ Middleware for oauth handling.
    While dispatching a request, it waits for an open DB session in the request.state.db_session
    """
    def __init__(self, app, auth_system, allowed_routes: list[str] = None):
        """ Initializer
        :param app: fastapi application
        :param allowed_routes: handled routes
        """
        BaseHTTPMiddleware.__init__(self, app)
        self.auth_system = auth_system
        self.routes = allowed_routes if allowed_routes is not None else []

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint):
        """ Route handler. If request path in routes then extract user from token payload """
        if any(request.url.path.startswith(route) for route in self.routes):
            auth = request.headers.get('authorization')
            if not auth:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)

            scheme, _, token = auth.partition(' ')

            if scheme.lower() != 'bearer' or not token:
                raise HTTPException( status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid authorization header')

            request.state.user = await self.auth_system.get_user_by_token(request.state.db_session, token)
            return await call_next(request)
        else:
            return await call_next(request)
