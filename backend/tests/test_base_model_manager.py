import pytest
import uuid
from unittest.mock import AsyncMock, Mock

from backend.repository.exceptions import EntityNotFound
from backend.repository.managers import ModelManager


@pytest.fixture
def model_type_mock() -> Mock:
    """ Fixture for create sql model type mock """
    mock = Mock()
    mock.__name__ = 'Mock'
    mock.model_fields = ['id', 'name']
    return mock


@pytest.fixture
def model_mock_with_id() -> Mock:
    """ Fixture for create mock with random 'id' attribute"""
    model = Mock()
    model.id = uuid.uuid4()
    return model


@pytest.fixture
def model_mock_with_id_and_name(model_mock_with_id: Mock) -> Mock:
    """ Fixture for create mock with random 'id' and 'name' attributes """
    model_mock_with_id.name = str(uuid.uuid4())
    return model_mock_with_id


@pytest.fixture
def repo_mock() -> AsyncMock:
    """ Fixture for create async repo mock """
    repo = AsyncMock()

    repo.create.return_value = Mock()
    repo.get_items.return_value = [Mock()]
    repo.update.return_value = Mock()
    repo.delete.return_value = None

    return repo


@pytest.fixture
def manager(repo_mock: AsyncMock, model_type_mock: Mock) -> ModelManager:
    """ Fixture for create ModelManager """
    return ModelManager(model_type_mock, repo_mock)


@pytest.mark.asyncio
async def test_call_create(manager: ModelManager):
    """
    Test then ModelManager correctly call 'create' method of AsyncRepository
    :param manager: fixture of a ModelManager
    """
    new_item = Mock()
    await manager.create(None, new_item)

    manager.repo.create.assert_awaited_once_with(None, manager.model, model=new_item)


@pytest.mark.asyncio
async def test_call_update(manager: ModelManager, model_mock_with_id: Mock):
    """
    Test then ModelManager correctly call 'update' method of AsyncRepository
    :param manager: fixture of a ModelManager
    :param model_mock_with_id: fixture of a sql model mock with id
    """
    await manager.update(None, model_mock_with_id)

    manager.repo.get_items.assert_awaited_once_with(None, manager.model, filters={'id': model_mock_with_id.id}, offset=None, limit=None)
    manager.repo.update.assert_awaited_once_with(None, manager.repo.get_items.return_value[0], model=model_mock_with_id)


@pytest.mark.asyncio
async def test_update_exception(manager: ModelManager, model_mock_with_id):
    """
    Test then ModelManager raise exception if repository return None
    :param manager: fixture of a ModelManager
    :param model_mock_with_id: fixture of a sql model mock with id
    """
    manager.repo.get_items.return_value = None

    with pytest.raises(EntityNotFound):
        await manager.update(None, model_mock_with_id)


@pytest.mark.asyncio
async def test_call_delete(manager: ModelManager, model_mock_with_id: Mock):
    """
    Test then ModelManager correctly call 'delete' method of AsyncRepository
    :param manager: fixture of a ModelManager
    :param model_mock_with_id: fixture of a sql model mock with id
    """
    manager.repo.get_items.return_value = [model_mock_with_id]

    item = await manager.delete(None, model_mock_with_id.id)

    manager.repo.get_items.assert_awaited_once_with(None, manager.model, filters={'id': model_mock_with_id.id}, offset=None, limit=None)
    manager.repo.delete.assert_awaited_once_with(None, model_mock_with_id)
    assert item == model_mock_with_id


@pytest.mark.asyncio
async def test_delete_exception(manager: ModelManager):
    """
    Test then ModelManager raise exception if repository return None
    :param manager: fixture of a ModelManager
    """
    manager.repo.get_items.return_value = None

    with pytest.raises(EntityNotFound):
        await manager.delete(None, uuid.uuid4())


@pytest.mark.asyncio
async def test_call_get_items(manager: ModelManager, model_mock_with_id: Mock):
    """
    Test then ModelManager correctly call get items from repository
    :param manager: fixture of a ModelManager
    :param model_mock_with_id: fixture of a sql model mock with id
    """
    manager.repo.get_items.return_value = [model_mock_with_id]

    filters = {'id': model_mock_with_id.id}
    offset = 1
    limit = 1

    items = await manager.get(session=None, filters=filters, offset=offset, limit=limit)

    manager.repo.get_items.assert_awaited_once_with(None, manager.model,  filters=filters, offset=offset, limit=limit)
    assert items == manager.repo.get_items.return_value


@pytest.mark.asyncio
async def test_call_get_one_field(manager: ModelManager, model_mock_with_id: Mock):
    """
    Test then ModelManager correctly call get one field from repository
    :param manager: fixture of a ModelManager
    :param model_mock_with_id: fixture of a sql model mock with id
    """
    manager.repo.get_fields.return_value = [model_mock_with_id.id]

    filters = {'id': model_mock_with_id.id}
    offset = 1
    limit = 1
    fields = ['id']

    result = await manager.get(session=None, filters=filters, offset=offset, limit=limit, fields=fields)

    assert result == [{'id': model_mock_with_id.id}]


@pytest.mark.asyncio
async def test_call_get_fields(manager: ModelManager, model_mock_with_id_and_name: Mock):
    """
    Test then ModelManager correctly call get fields from repository
    :param manager: fixture of a ModelManager
    :param model_mock_with_id_and_name: fixture of a sql model mock with id and name
    """
    manager.repo.get_fields.return_value = [[model_mock_with_id_and_name.id, model_mock_with_id_and_name.name]]

    filters = {'id': model_mock_with_id_and_name.id}
    offset = 1
    limit = 1
    fields = ['id', 'name']

    result = await manager.get(session=None, filters=filters, offset=offset, limit=limit, fields=fields)

    assert result == [{'id': model_mock_with_id_and_name.id, 'name': model_mock_with_id_and_name.name}]
