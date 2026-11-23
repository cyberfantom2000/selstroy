from .base import ModelManager
from ..exceptions import EntityNotFound
from ..models.common import File
from ..models.settings import SiteSettings, SiteSettingsUpdate


class SiteSettingsManager(ModelManager):
    def __init__(self, repo):
        super().__init__(SiteSettings, repo)

    async def current(self, session) -> SiteSettings:
        items = await self.repo.get_items(session, self.model, filters={'id': 1})
        if not items:
            raise EntityNotFound(self.model)
        return items[0]

    async def update(self, session, update_model: SiteSettingsUpdate) -> SiteSettings:
        current = await self.current(session)
        data = update_model.model_dump(exclude_unset=True)

        if not data:
            return current

        if 'hero_image_id' in data:
            file_id = data.pop('hero_image_id')
            file = await ModelManager(File, self.repo).get_by_id(session, file_id) if file_id else None
            current.hero_image = file

        for field, value in data.items():
            setattr(current, field, value)

        await self.repo.add_and_commit(session, current)
        await self.repo.refresh(session, [current])
        return current
