from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from fastapi import Request


class DatabaseSessionMiddleware(BaseHTTPMiddleware):
    """ Middleware for handling database session """
    def __init__(self, app, session, allowed_routes: list[str] = None):
        """ Initializer
        :param app: fastapi application
        :param session: database session class
        :param allowed_routes: handled routes
        """
        BaseHTTPMiddleware.__init__(self, app)
        self.session = session
        self.routes = allowed_routes if allowed_routes is not None else []

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint):
        """ Route handler. If request path in routes then opening database session else do nothing """
        if any(route.startswith(request.url.path) for route in self.routes):
            async with self.session() as session:
                request.state.db_session = session
                return await call_next(request)
        else:
            return await call_next(request)
