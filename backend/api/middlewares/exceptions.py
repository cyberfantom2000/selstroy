from fastapi import HTTPException, status

from common import get_logger, settings

from backend.repository.exceptions import EntityNotFound
from backend.feedback.exceptions import SmtpError


log = get_logger(settings, 'exception mapper')


class HttpExceptionMapper:
    """ Mapper class to handle all exceptions to HHTPException """
    def __init__(self, app):
        @app.exception_handler(EntityNotFound)
        async def not_found(request, exc):
            """ Handle database EntityNotFound exception"""
            log.info(f'Map exception {exc.__class__.__name__} to 404 Not Found')
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))

        @app.exception_handler(SmtpError)
        async def smtp_error(request, exc):
            """ Handle SMTP exception """
            log.info(f'Map exception {exc.__class__.__name__} to 503 Service Unavailable')
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc))
