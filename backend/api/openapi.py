from fastapi.openapi.utils import get_openapi

from common import settings


def custom_openapi(app, exclude_auth_routes: list[str]):
    """  """
    def generator() -> dict:
        if app.openapi_schema:
            return app.openapi_schema

        openapi_schema = get_openapi(title=settings.api_title,
                                     version=settings.api_version,
                                     description=settings.api_description,
                                     routes=app.routes)

        openapi_schema['components']['securitySchemes'] = {
            'BearerAuth': {
                'type': 'http',
                'scheme': 'bearer',
                'bearerFormat': 'JWT',
                'description': 'Insert access token here',
            }
        }

        for path, methods in openapi_schema['paths'].items():
            if path not in exclude_auth_routes and path.startswith('/api/'):
                for method, method_descr in methods.items():
                    if method.upper() in ['POST', 'PUT', 'PATCH', 'DELETE']:
                        method_descr['security'] = [{'BearerAuth': []}]

        return openapi_schema

    return generator
