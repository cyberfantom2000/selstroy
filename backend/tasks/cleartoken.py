from datetime import datetime, timedelta

from common import settings, get_logger

from ..repository.models.auth import RefreshToken

log = get_logger(settings, 'ClearTokenTask')

class ClearTokenTask:
    """ Task to clear expired tokens """
    def __init__(self, session, repo, ttl_after_expired_days: int):
        """ Initializer
        :param session: database session maker
        :param repo: database repository
        :param ttl_after_expired_days: number of days after which expired tokens should be cleared
        """
        self.session = session
        self.repo = repo
        self.ttl_days = ttl_after_expired_days

    async def execute(self) -> None:
        log.info('starting')
        async with self.session() as session:
            three_days_ago = datetime.now() - timedelta(days=self.ttl_days)
            items = await self.repo.get(session, RefreshToken, conditions=[RefreshToken.expired < three_days_ago],
                                        limit=None, offset=None, options=None, for_update=None)
            log.info(f'expired tokens: {len(items) if items else 0}')
            if items:
                await self.repo.delete(session, items)
        log.info('finished')