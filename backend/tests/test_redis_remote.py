import pytest
from unittest.mock import AsyncMock

from backend.repository.redis.remote import RedisRemote


@pytest.fixture
def client_mock() -> AsyncMock:
    """ Fixture for create async redis client mock """
    return AsyncMock()


@pytest.fixture
def redis(client_mock: AsyncMock) -> RedisRemote:
    """ Fixture for create RedisRemote instance """
    return RedisRemote(client_mock)


@pytest.mark.asyncio
async def test_add_dict(redis: RedisRemote):
    """ Test add_dict call delegation in a client call
    :param redis: fixture of a RedisRemote instance
    """
    topic = 'test'
    data = {'f': 1}
    await redis.add_dict(topic, data)
    redis.client.hset.assert_awaited_once_with(topic, mapping=data)

    ttl = 1
    await redis.add_dict(topic, data, ttl)
    redis.client.expire.assert_awaited_once_with(topic, ttl)


@pytest.mark.asyncio
async def test_get_dict(redis: RedisRemote):
    """ Test get_dict call delegation in a client call
    :param redis: fixture of a RedisRemote instance
    """
    topic = 'test'

    redis.client.hgetall.return_value = {'f': 1}
    value = await redis.get_dict(topic)
    redis.client.hgetall.assert_awaited_once_with(topic)
    assert value == {'f': 1}

    field = 'test'
    redis.client.hget.return_value = 1
    value = await redis.get_dict(topic, [field])
    redis.client.hget.assert_awaited_once_with(topic, field)
    assert value == 1

    fields = ['1', '2']
    redis.client.hmget.return_value = [1, 2]
    value = await redis.get_dict(topic, fields)
    redis.client.hmget.assert_awaited_once_with(topic, fields)
    assert value == [1, 2]


@pytest.mark.asyncio
async def test_update_dict(redis: RedisRemote):
    """ Test update_dict call delegation in a client call
    :param redis: fixture of a RedisRemote instance
    """
    topic = 'test'
    data = {'f': 1}
    await redis.update_dict(topic, data)
    redis.client.hset.assert_awaited_once_with(topic, mapping=data)


@pytest.mark.asyncio
async def test_delete_dict(redis: RedisRemote):
    """ Test delete_dict call delegation in a client call
    :param redis: fixture of a RedisRemote instance
    """
    topic = 'test'

    await redis.delete_dict(topic)
    redis.client.delete.assert_awaited_once_with(topic)

    keys = ['f', 'k']
    await redis.delete_dict(topic, keys)
    redis.client.hdel.assert_awaited_once_with(topic, *keys)
