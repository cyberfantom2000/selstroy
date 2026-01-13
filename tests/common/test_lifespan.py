import pytest
from unittest.mock import Mock, AsyncMock

from common.lifespan import Lifespan

@pytest.fixture
def lifespan() -> Lifespan:
    return Lifespan()


@pytest.mark.asyncio
async def test_add_starting_task(lifespan: Lifespan):
    """ Calls add_starting_task and checks that the task has been stored
    :param lifespan: fixture for Lifespan instance
    """
    callback = Mock()
    args = (1, )
    kwargs = {'a': 1}
    uid = lifespan.add_starting_task(callback, *args, **kwargs)

    assert uid in lifespan.starting_tasks
    assert lifespan.starting_tasks[uid].call == callback
    assert lifespan.starting_tasks[uid].args == args
    assert lifespan.starting_tasks[uid].kwargs == kwargs


@pytest.mark.asyncio
async def test_remove_starting_task(lifespan: Lifespan):
    """ Calls remove_starting_task and checks that the task has been removed.
    Also checks that removing a non-existent id does not cause an error
    :param lifespan: fixture for Lifespan instance
    """
    callback = Mock()
    uid = 1

    lifespan.starting_tasks[uid] = callback

    lifespan.remove_starting_task(uid)
    lifespan.remove_starting_task(2)

    assert uid not in lifespan.starting_tasks


@pytest.mark.asyncio
async def test_add_shutdown_task(lifespan: Lifespan):
    """ Calls add_shutdown_task and checks that the task has been stored.
    :param lifespan: fixture for Lifespan instance
    """
    callback = Mock()
    args = (1, )
    kwargs = {'a': 1}
    uid = lifespan.add_shutdown_task(callback, *args, **kwargs)

    assert uid in lifespan.stopping_tasks
    assert lifespan.stopping_tasks[uid].call == callback
    assert lifespan.stopping_tasks[uid].args == args
    assert lifespan.stopping_tasks[uid].kwargs == kwargs


@pytest.mark.asyncio
async def test_remove_starting_task(lifespan: Lifespan):
    """ Calls remove_shutdown_task and checks that the task has been removed
    Also checks that removing a non-existent id does not cause an error
    :param lifespan: fixture for Lifespan instance
    """
    callback = Mock()
    uid = 1

    lifespan.stopping_tasks[uid] = callback

    lifespan.remove_shutdown_task(uid)
    lifespan.remove_shutdown_task(2)

    assert uid not in lifespan.stopping_tasks


@pytest.mark.asyncio
async def test_lifespan_call(lifespan: Lifespan):
    """ Simulates the operation of an app by calling startup tasks before it starts working
    and shutting down tasks after it app shutdown
    :param lifespan: fixture for Lifespan instance
    """
    start_callback = Mock()
    start_args = (1, )
    start_kwargs = {'a': 1}
    lifespan.add_starting_task(start_callback, *start_args, **start_kwargs)

    stop_callback = Mock()
    stop_args = (2, )
    stop_kwargs = {'b': 2}
    lifespan.add_shutdown_task(stop_callback, *stop_args, **stop_kwargs)

    async with lifespan(None):
        start_callback.assert_called_once_with(*start_args, **start_kwargs)
        assert len(lifespan.starting_tasks) == 0
        assert stop_callback.call_count == 0

    stop_callback.assert_called_once_with(*stop_args, **stop_kwargs)
    assert len(lifespan.stopping_tasks) == 0