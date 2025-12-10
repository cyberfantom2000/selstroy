import uvicorn
from fastapi import FastAPI

import backend.creator
from common import settings

# TODO

if __name__ == '__main__':
    app = FastAPI(debug=settings.debug, version=settings.version)

    backend.creator.register(app)

    uvicorn.run(app, host=settings.host, port=settings.port)
