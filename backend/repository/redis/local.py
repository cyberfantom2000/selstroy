import asyncio
from collections import OrderedDict


class RedisLocal:
    """ Local redis implements. Save data in memory.
    Has an async interface for compatibility with Redis, but does not operate async
    """
    def __init__(self, capacity: int):
        """ Initializer """
        self.capacity = capacity
        self.dicts = OrderedDict()
        self.uniques = OrderedDict()
        self.ttls = {}

    async def add_dict(self, topic: str, data: dict, ttl_secs: int = None) -> None:
        """ Creates a new topic with hash data type in radis
        :param topic: data topic
        :param data: data to save in topic
        :param ttl_secs: time to live in seconds, if not None set ttl for topic
        """
        self.dicts[topic] = data
        self._shrink_storage()

        if ttl_secs:
            self.ttls[topic] = ttl_secs
            asyncio.create_task(self._time_to_die(topic, ttl_secs))


    async def get_dict(self, topic: str, fields: list[str] = None) -> object | list | dict | None:
        """ Get hash data from radis by topic
        :param topic: data topic
        :param fields: fields to get from topic. If not None request only listed fields
        :return: object if topic exists and fields equal 1
        :return: list if topic exists and fields len over 1
        :return: dict if topic exists and fields is None
        :return: if topic does not exist return None
        """
        if fields:
            if len(fields) == 1:
                return self.dicts.get(topic, {}).get(fields[0], None)
            else:
                data = self.dicts.get(topic, {})
                if not data:
                    return None
                return [data[k] for k in fields if k in data]
        else:
            return self.dicts.get(topic, None)

    async def update_dict(self, topic: str, data: dict) -> None:
        """ Update hash data in radis
        :param topic: data topic
        :param data: data to update in topic. May contain one or more fields to update
        """
        self.dicts.setdefault(topic, {}).update(data)
        self._shrink_storage()

    async def delete_dict(self, topic: str, keys: list[str] = None) -> None:
        """ Delete hash data in radis by topic
        :param topic: data topic
        :param keys: fields to delete from topic. May contain one or more fields to delete. if keys is None delete topic
        """
        if keys:
            data = self.dicts.get(topic, {})
            for key in keys:
                data.pop(key, '')
        else:
            self.dicts.pop(topic, '')

    async def set_unique(self, topic: str, value, ttl_secs: int = None) -> bool:
        """ Set the topic if it does not exist.
        :param topic: data topic
        :param value: data to set unique topic
        :param ttl_secs: time to live in seconds, if not None set ttl for topic
        :return: False if topic exists, else True
        """
        if topic in self.uniques or topic in self.dicts:
            return False

        self.uniques[topic] = value
        if ttl_secs:
            self.ttls[topic] = ttl_secs
            asyncio.create_task(self._time_to_die(topic, ttl_secs))
        return True

    def clear(self):
        """ Clear all data """
        self.dicts.clear()
        self.ttls.clear()
        self.uniques.clear()

    def _shrink_storage(self):
        """ Remove older items if storage capacity is exceeded """
        for _ in range(0, len(self.dicts) - self.capacity):
            self.dicts.popitem(last=False)

        for _ in range(0, len(self.uniques) - self.capacity):
            self.uniques.popitem(last=False)

    async def _time_to_die(self, topic: str, ttl_secs: int) -> None:
        """ Simple ttl callback """
        await asyncio.sleep(ttl_secs)
        self.dicts.pop(topic, '')
        self.uniques.pop(topic, '')
        self.ttls.pop(topic, '')