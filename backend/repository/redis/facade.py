import asyncio
from enum import Enum, auto
from typing import Any

from redis.asyncio import RedisError

from common import settings, get_logger

log = get_logger(settings, 'Redis')


class State(Enum):
    UP = auto()
    DOWN = auto()
    SYNCING = auto()


class RedisFacade:
    """ Redis facade. If radis server not available stored data in RedisLocal.
    Checks server availability and sync data from RedisLocal to the redis server.
    Data may be lost, and TTL is transferred without taking into account the elapsed time. """
    def __init__(self, local, remote):
        self.local = local
        self.remote = remote

        self.state = State.UP

        self.state_lock = asyncio.Lock()
        self.sync_lock = asyncio.Lock()

        self.healthcheck_task = None

    async def add_dict(self, topic: str, data: dict, ttl_secs: int = None) -> None:
        """ Creates a new topic with hash data type in radis
        :param topic: data topic
        :param data: data to save in topic
        :param ttl_secs: time to live in seconds, if not None set ttl for topic
        """
        async with self.sync_lock:
            async with self.state_lock:
                state = self.state

        if state == State.UP:
            result, ok = await self._handle_redis_exception(self.remote.add_dict(topic, data, ttl_secs))
            if ok:
                return

        await self.local.add_dict(topic, data, ttl_secs)

    async def get_dict(self, topic: str, fields: list[str] = None) -> object | list | dict | None:
        """ Get hash data from radis by topic
        :param topic: data topic
        :param fields: fields to get from topic. If not None request only listed fields
        :return: dict if topic exists and fields is None
        :return: list if topic exists and fields len over 1
        :return: object if topic exists and fields equal 1
        :return: None if topic does not exist
        """
        async with self.state_lock:
            state = self.state

        if state == State.UP:
            result, ok = await self._handle_redis_exception(self.remote.get_dict(topic, fields))
            if ok:
                return result

        return await self.local.get_dict(topic, fields)

    async def update_dict(self, topic: str, data: dict) -> None:
        """ Update hash data in radis
        :param topic: data topic
        :param data: data to update in topic. May contain one or more fields to update
        """
        async with self.sync_lock:
            async with self.state_lock:
                state = self.state

        if state == State.UP:
            result, ok = await self._handle_redis_exception(self.remote.update_dict(topic, data))
            if ok:
                return

        await self.local.update_dict(topic, data)

    async def delete_dict(self, topic: str, keys: list[str] = None) -> None:
        """ Delete hash data in radis by topic
        :param topic: data topic
        :param keys: fields to delete from topic. May contain one or more fields to delete. if keys is None delete topic
        """
        async with self.sync_lock:
            async with self.state_lock:
                state = self.state

        if state == State.UP:
            result, ok = await self._handle_redis_exception(self.remote.delete_dict(topic, keys))
            if ok:
                return

        await self.local.delete_dict(topic, keys)

    async def set_unique(self, topic: str, value, ttl_secs: int = None) -> bool:
        """ Set the topic if it does not exist.
        :param topic: data topic
        :param value: data to set unique topic
        :param ttl_secs: time to live in seconds, if not None set ttl for topic
        :return: False if topic exists, else True
        """
        async with self.sync_lock:
            async with self.state_lock:
                state = self.state

        if state == State.UP:
            result, ok = await self._handle_redis_exception(self.remote.set_unique(topic, value, ttl_secs))
            if ok:
                return result

        return await self.local.set_unique(topic, value, ttl_secs)

    async def _handle_redis_exception(self, coroutine) -> tuple[Any, bool]:
        """ Catch RedisException and call _on_redis_down
        :param coroutine: coroutine
        :return tuple[coroutine result, status], when status is False if exception occurred
        """
        try:
            return await coroutine, True
        except RedisError as exc:
            log.error(f'Redis error: {exc}')
            await self._on_redis_down()
            return None, False

    async def _on_redis_down(self) -> None:
        """ Handling radis down event """
        async with self.state_lock:
            if self.state == State.UP:
                log.warning('Redis has down. Switch to local storage')
                self.state = State.DOWN
                if self.healthcheck_task is None:
                    self.healthcheck_task = asyncio.create_task(self._healthcheck(settings.redis_healthcheck_timeout_secs))

    async def _healthcheck(self, timeout_secs: int) -> None:
        """ Healthcheck flow. Sleep for timeout_secs seconds and try ping Redis. If ping success - make data sync.
        If ping failed create new healthcheck task
        :param timeout_secs: timeout before ping server
        """
        async with self.state_lock:
            if self.state != State.DOWN:
                return

        await asyncio.sleep(timeout_secs)

        try:
            await self.remote.ping()
            await self._make_sync()
            self.healthcheck_task = None
        except RedisError as exc:
            log.error(f'Redis healthcheck error: {exc}. Retry')
            self.healthcheck_task = asyncio.create_task(self._healthcheck(timeout_secs))

    async def _make_sync(self) -> None:
        """ Load data from local storage to redis server.
        NOTE: A potentially controversial function. It performs I/O operations under a sync_lock.
        NOTE: However, more complex synchronization mechanisms are not yet justified.
        """
        async with self.state_lock:
            if self.state != State.DOWN:
                return
            self.state = State.SYNCING

        log.info('Redis sync started')
        async with self.sync_lock:
            for topic, data in self.local.dicts.items():
                await self.remote.add_dict(topic, data, self.local.ttls.get(topic, None))

            for topic, data in self.local.uniques.items():
                await self.remote.set_unique(topic, data, self.local.ttls.get(topic, None))

            self.local.clear()

            async with self.state_lock:
                self.state = State.UP
                log.info('Redis sync finished')
                log.info('Redis server again available. Switch to remote storage')
