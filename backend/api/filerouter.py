from uuid import UUID
from pathlib import Path
from fastapi import APIRouter, UploadFile
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

        self.router.add_api_route('', self.upload, methods=['POST'], response_model=FilePublic)
        self.router.add_api_route('/{uid}', self.download, methods=['GET'], response_class=FileResponse)

    async def upload(self, file: UploadFile):
        filename = Path(file.filename)
        rel_path, size = await self.storage.write(file, filename.suffix)

        record = FileCreate(path=rel_path, size=size, extension=filename.suffix, filename=filename.stem)
        return await self.manager.create(record)

    async def download(self, uid: UUID):
        record = await self.manager.get(filters={'id': uid})
        return FileResponse(self.storage.file_path(record[0].path))

    def __str__(self):
        """ To debug output """
        return f'Name: {self.__class__.__name__}, Manager: {self.manager.__class__.__name__}, Storage: {self.storage.__class__.__name__}'
