import pytest
import asyncio

from backend.repository.redis.local import RedisLocal

@pytest.fixture
def redis():
    """ Fixture for create local redis storage """
    return RedisLocal(capacity=50)


@pytest.mark.asyncio
async def test_add_get_dict(redis: RedisLocal):
    """ Test to check add and get data
    :param redis: fixture of a RedisLocal
    """
    data_set = {'test': {'test': 1, 'fff': 'mmm'}, 'foo': {'bar': 'baz'}}

    for topic, values in data_set.items():
        await redis.add_dict(topic=topic, data=values)
        assert values == await redis.get_dict(topic)

    assert None == await redis.get_dict(topic='random')


@pytest.mark.asyncio
async def test_get_fields(redis: RedisLocal):
    """ Test to check data fields from storage
    :param redis: fixture of a RedisLocal
    """
    data = {'test': 1, 'fff': 'mmm'}
    await redis.add_dict(topic='test', data=data)

    assert 1 == await redis.get_dict(topic='test', fields=['test'])
    assert [1, 'mmm'] == await redis.get_dict(topic='test', fields=['test', 'fff'])


@pytest.mark.asyncio
async def test_update_dict(redis: RedisLocal):
    """ Test to check data update
    :param redis: fixture of a RedisLocal
    """
    data = {'test': 1, 'fff': 'mmm'}
    await redis.add_dict(topic='test', data=data)

    await redis.update_dict(topic='test', data={'test': 2, 'kkk': 66})

    assert [2, 66, 'mmm'] == await redis.get_dict(topic='test', fields=['test', 'kkk', 'fff'])


@pytest.mark.asyncio
async def test_delete_dict(redis: RedisLocal):
    """ Test to check data delete
    :param redis: fixture of a RedisLocal
    """
    topic = 'test'
    await redis.add_dict(topic=topic, data={'test': 1})

    await redis.delete_dict(topic=topic)

    assert None == await redis.get_dict(topic=topic)


@pytest.mark.asyncio
async def test_delete_dict_fields(redis: RedisLocal):
    """ Test to check delete some fields
    :param redis: fixture of a RedisLocal
    """
    topic = 'test'
    data = {'test': 1, 'fff': 'mmm'}
    await redis.add_dict(topic=topic, data=data)

    await redis.delete_dict(topic=topic, keys=['test'])

    assert {'fff': 'mmm'} == await redis.get_dict(topic=topic)


@pytest.mark.asyncio
async def test_ttl(redis: RedisLocal):
    """ Test to check topic is deleted after ttl expires
    :param redis: fixture of a RedisLocal
    """
    await redis.add_dict(topic='test', data={'test': 1}, ttl_secs=1)

    await asyncio.sleep(2)

    assert None == await redis.get_dict(topic='test')


@pytest.mark.asyncio
async def test_shrink_storage():
    """ Test to check that storage cannot be larger fixed capacity """
    redis = RedisLocal(1)

    await redis.add_dict(topic='test', data={'test': 1})
    await redis.add_dict(topic='fff', data={'test': 1})

    assert None == await redis.get_dict(topic='test')
    assert {'test': 1} == await redis.get_dict(topic='fff')
