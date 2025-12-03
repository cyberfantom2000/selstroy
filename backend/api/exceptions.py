from fastapi import HTTPException, status

from common import get_logger, settings

from ..repository.exceptions import EntityNotFound

log = get_logger(settings, 'backend')

class HttpExceptionMapper:
    """ Mapper class to handle all exceptions to HHTPException """
    def __init__(self, app):
        @app.exception_handler(EntityNotFound)
        async def not_found(request, exc):
            """ Handle database EntityNotFound exception"""
            log.info(f'Map http exception {exc.__name__} to 404 Not Found')
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
