import shutil

import pytest
import tempfile
from pathlib import Path

from backend.repository.localstorage import LocalStorage, EntityNotFound


class MockStream:
    """ Mock for async stream imitating """
    def __init__(self, data: bytes, chunk_size: int = 4):
        self.data = data
        self.chunk_size = chunk_size
        self.pos = 0

    def __aiter__(self):
        return self

    async def __anext__(self):
        if self.pos >= len(self.data):
            raise StopAsyncIteration

        chunk = self.data[self.pos:self.pos + self.chunk_size]
        self.pos += self.chunk_size
        return chunk


@pytest.fixture
def tmp_dir():
    """ Fixture for creating temp directory"""
    temp_dir = tempfile.mkdtemp()
    try:
        yield Path(temp_dir)
    finally:
        shutil.rmtree(temp_dir)


@pytest.fixture
def stream_mock() -> MockStream:
    """ Fixture for creating a mock stream """
    return MockStream(b'test mock data')


@pytest.fixture
def storage(tmp_dir: Path) -> LocalStorage:
    """ Fixture for creating a local storage testing object"""
    return LocalStorage(tmp_dir)


@pytest.mark.asyncio
async def test_write_file(storage: LocalStorage, stream_mock: MockStream):
    """ Test then LocalStorage successfully writing file
    :param storage: fixture of a LocalStorage
    :param stream_mock: fixture of a MockStream object
    """
    path = await storage.write(stream_mock, ext='txt', folder='test')
    assert Path(storage.base_path, path).exists()
    assert Path(storage.base_path, path).is_file()


@pytest.mark.asyncio
async def test_read_file(storage: LocalStorage):
    """ Test then LocalStorage successfully reading file
    :param storage: fixture of a LocalStorage
    """
    path = storage.base_path / 'test.txt'
    with open(path, 'wb') as f:
        f.write(b'test mock data')

    data = await storage.read(Path(path.name))
    assert data == b'test mock data'


@pytest.mark.asyncio
async def test_read_file_error(storage: LocalStorage):
    """ Test then LocalStorage raise exception if file not found while reading operation
    :param storage: fixture of a LocalStorage
    """
    with pytest.raises(EntityNotFound):
        await storage.read(Path('test.txt'))


@pytest.mark.asyncio
async def test_delete_file(storage: LocalStorage):
    """ Test then LocalStorage successfully deleting file
    :param storage: fixture of a LocalStorage
    """
    path = storage.base_path / 'test.txt'

    await storage.delete(Path(path.name))

    with open(path, 'wb') as f:
        f.write(b'test mock data')

    await storage.delete(Path(path.name))
    assert not path.exists()
