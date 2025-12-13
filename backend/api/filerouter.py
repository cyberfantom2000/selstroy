from uuid import UUID
from pathlib import Path
from typing import Union, Any
from fastapi import APIRouter, UploadFile, Request, Query
from fastapi.responses import FileResponse

from ..repository.localstorage import LocalStorage
from ..repository.managers import ModelManager
from ..repository.models.common import FileCreate, FilePublic

class FileRouter:
    """ File operations router """
    def __init__(self, storage: LocalStorage, manager: ModelManager, *args, **kwargs):
        """ Initializer
        :param storage: storage for saving file binary data
        :param manager: model manager for saving file description to DB
        """
        self.router = APIRouter(*args, **kwargs)
        self.storage = storage
        self.manager = manager

        self.router.add_api_route('', self.list, methods=['GET'],
                                  response_model=Union[list[FilePublic], list[dict[str, Any]]])
        self.router.add_api_route('', self.upload, methods=['POST'], response_model=FilePublic)
        self.router.add_api_route('/{uid}', self.download, methods=['GET'], response_class=FileResponse)
        self.router.add_api_route('/{uid}', self.delete, methods=['DELETE'], response_model=FilePublic)

    async def list(self, request: Request, limit: int = 100, offset: int = 0,
                   fields: str = Query(default=None, description='Comma separated fields')):
        requested_fields = fields.split(',') if fields else None
        return await self.manager.get(session=request.state.db_session, limit=limit, offset=offset, fields=requested_fields)

    async def upload(self, request: Request, file: UploadFile):
        filename = Path(file.filename)
        rel_path, size = await self.storage.write(file, filename.suffix)

        record = FileCreate(path=str(rel_path), size=size, ext=filename.suffix, name=filename.stem)
        return await self.manager.create(session=request.state.db_session, new_model=record)

    async def download(self, request: Request, uid: UUID):
        record = await self.manager.get_by_id(session=request.state.db_session, uid=uid)
        return FileResponse(self.storage.file_path(record.path))

    async def delete(self, request: Request, uid: UUID):
        record = await self.manager.get_by_id(session=request.state.db_session, uid=uid)
        await self.storage.delete(record.path)
        return await self.manager.delete(session=request.state.db_session, model_id=uid)

    def __str__(self):
        """ To debug output """
        return f'Name: {self.__class__.__name__}, Manager: {self.manager.__class__.__name__}, Storage: {self.storage.__class__.__name__}'
