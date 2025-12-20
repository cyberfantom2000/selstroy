

class RedisRemote:
    """ Local redis implements. Save data in memory.
    Has an async interface for compatibility with Redis, but does not operate async
    """
    def __init__(self, client):
        """ Initializer
        :param client: redis client
        """
        self.client = client

    async def add_dict(self, topic: str, data: dict, ttl_secs: int = None) -> None:
        """ Creates a new topic with hash data type in radis
        :param topic: data topic
        :param data: data to save in topic
        :param ttl_secs: time to live in seconds, if not None set ttl for topic
        """
        await self.client.hset(topic, mapping=data)
        if ttl_secs:
            await self.client.expire(topic, ttl_secs)


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
                return await self.client.hget(topic, fields[0])
            else:
                return await self.client.hmget(topic, fields)
        else:
            return await self.client.hgetall(topic)

    async def update_dict(self, topic: str, data: dict) -> None:
        """ Update hash data in radis
        :param topic: data topic
        :param data: data to update in topic. May contain one or more fields to update
        """
        await self.client.hset(topic, mapping=data)

    async def delete_dict(self, topic: str, keys: list[str] = None) -> None:
        """ Delete hash data in radis by topic
        :param topic: data topic
        :param keys: fields to delete from topic. May contain one or more fields to delete. if keys is None delete topic
        """
        if keys:
            await self.client.hdel(topic, *keys)
        else:
            await self.client.delete(topic)

    async def ping(self):
        """ Ping redis server. Can be used to healthcheck """
        return await self.client.ping()
