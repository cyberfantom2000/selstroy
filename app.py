import uvicorn
from fastapi import FastAPI

import backend.creator
from common import settings
from common.lifespan import Lifespan

# TODO
# 1. Добавить лимит на регистрацию с одного ip адреса
# 2. Работа со скоупами доступа. Через миддлеваре?
# 3. Поправить апи авторизации


if __name__ == '__main__':
    lifespan = Lifespan()

    app = FastAPI(debug=settings.debug, version=settings.api_version, lifespan=lifespan)

    backend.creator.register(app, lifespan)

    uvicorn.run(app, host=settings.host, port=settings.port)
