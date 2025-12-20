import pytest
import asyncio
from unittest.mock import AsyncMock, call

from redis.asyncio import RedisError

from backend.repository.redis.facade import RedisFacade
from common import settings


@pytest.fixture
def local_redis_mock() -> AsyncMock:
    """ Fixture for create async local redis mock """
    return AsyncMock()


@pytest.fixture
def remote_redis_mock() -> AsyncMock:
    """ Fixture for create async remote redis mock """
    return AsyncMock()


@pytest.fixture
def redis(local_redis_mock: AsyncMock, remote_redis_mock: AsyncMock) -> RedisFacade:
    return RedisFacade(local_redis_mock, remote_redis_mock)


@pytest.mark.asyncio
async def test_add_dict(redis: RedisFacade):
    """ Test add_dict RedisFacade. Checking switch backend if remote error occurs
    :param redis: fixture for RedisFacade instance
    """
    topic='test'
    data = {'test': 'test'}
    ttl = 1
    await redis.add_dict(topic, data, ttl)
    redis.remote.add_dict.assert_called_once_with(topic, data, ttl)

    redis.remote.add_dict.side_effect = RedisError("Test BOOM!")
    await redis.add_dict(topic, data, ttl)
    redis.local.add_dict.assert_called_once_with(topic, data, ttl)


@pytest.mark.asyncio
async def test_get_dict(redis: RedisFacade):
    """ Test get_dict RedisFacade. Checking switch backend if remote error occurs
    :param redis: fixture for RedisFacade instance
    """
    topic = 'test'
    data = {'test': 'test'}
    fields = ['test']

    redis.remote.get_dict.return_value = data
    value = await redis.get_dict(topic, fields)
    redis.remote.get_dict.assert_called_once_with(topic, fields)
    assert data == value

    redis.remote.get_dict.side_effect = RedisError("Test BOOM!")
    redis.local.get_dict.return_value = data
    value = await redis.get_dict(topic, fields)
    redis.local.get_dict.assert_called_once_with(topic, fields)
    assert data == value


@pytest.mark.asyncio
async def test_update_dict(redis: RedisFacade):
    """ Test update_dict RedisFacade. Checking switch backend if remote error occurs
    :param redis: fixture for RedisFacade instance
    """
    topic = 'test'
    data = {'test': 'test'}

    await redis.update_dict(topic, data)
    redis.remote.update_dict.assert_awaited_once_with(topic, data)

    redis.remote.update_dict.side_effect = RedisError("Test BOOM!")
    await redis.update_dict(topic, data)
    redis.local.update_dict.assert_awaited_once_with(topic, data)


@pytest.mark.asyncio
async def test_delete_dict(redis: RedisFacade):
    """ Test delete_dict RedisFacade. Checking switch backend if remote error occurs
    :param redis: fixture for RedisFacade instance
    """
    topic = 'test'
    keys = ['test', '1']

    await redis.delete_dict(topic, keys)
    redis.remote.delete_dict.assert_awaited_once_with(topic, keys)

    redis.remote.delete_dict.side_effect = RedisError("Test BOOM!")
    await redis.delete_dict(topic, keys)
    redis.local.delete_dict.assert_awaited_once_with(topic, keys)


@pytest.mark.asyncio
async def test_sync_done(redis: RedisFacade):
    topic = 'test'
    data = {'test': 'test'}

    redis.remote.add_dict.side_effect = RedisError("Test BOOM!")
    redis.local.dicts = {'test': data}
    redis.local.ttls = {}
    await redis.add_dict(topic, data)

    redis.remote.add_dict.side_effect = None

    await asyncio.sleep(settings.redis_healthcheck_timeout_secs + 1)

    redis.remote.ping.assert_awaited_once_with()
    redis.remote.add_dict.assert_has_awaits([call(topic, data, None), call(topic, data, None)])
    redis.local.clear.assert_called_once()

    redis.remote.get_dict.return_value = data
    value = await redis.get_dict(topic)

    redis.remote.get_dict.assert_awaited_once_with(topic, None)
    assert data == value
