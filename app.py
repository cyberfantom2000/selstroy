import uvicorn
from fastapi import FastAPI

import backend.creator
from common import settings
from common.lifespan import Lifespan

if __name__ == '__main__':
    lifespan = Lifespan()

    app = FastAPI(debug=settings.debug, version=settings.api_version, lifespan=lifespan)

    backend.creator.register(app, lifespan)

    uvicorn.run(app, host=settings.host, port=settings.port)
