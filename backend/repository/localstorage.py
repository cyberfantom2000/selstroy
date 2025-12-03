import aiofiles
import uuid

from pathlib import Path
from .exceptions import EntityNotFound


class LocalStorage:
    """ Files local storage"""
    def __init__(self, base_path: Path):
        """ Initializer
        :param base_path: path to save files
        """
        self.base_path = base_path
        self.base_path.mkdir(parents=True, exist_ok=True)

    async def write(self, stream, ext: str, folder: str = '') -> Path:
        """ Write file to local storage
        :param stream: stream to write
        :param ext: file extension
        :param folder: folder to save file
        :return: relative file path
        """
        path = self.base_path / folder
        path.mkdir(parents=True, exist_ok=True)

        name = f'{uuid.uuid4().hex}.{ext}'
        dst = path / name

        async with aiofiles.open(dst, mode='wb') as file:
            async for chunk in stream:
                await file.write(chunk)

        return dst.relative_to(self.base_path)

    async def read(self, rel_path: Path) -> bytes:
        """ Read file from local storage
        :param rel_path: relative file path
        :return: file content
        :raises EntityNotFound: File not found"""
        path = self.base_path / rel_path

        if not path.exists():
            raise EntityNotFound(f'File not found: {path}')

        async with aiofiles.open(path, mode='rb') as file:
            return await file.read()

    async def delete(self, rel_path: Path) -> None:
        """ Delete file from local storage
        :param rel_path: relative file path
        """
        path = self.base_path / rel_path
        if path.exists():
            path.unlink()