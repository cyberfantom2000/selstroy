from sqlmodel import SQLModel

from .base import ModelManager

from ..models.project import ProjectShortDescriptionUpdate, ProjectShortDescriptionCreate
from ..models.common import File

class ProjectShortDescriptionManager(ModelManager):
    """ ProjectShortDescription model manager. Override create and update methods for creating links
    to File models from an id
    """
    async def create(self, session, new_model: ProjectShortDescriptionCreate):
        new_item = await super().create(session, new_model)

        if new_model.image_id:
            new_item = await self._update_image(session, new_item, new_model.image_id)

        return new_item

    async def update(self, session, update_model: ProjectShortDescriptionUpdate):
        updated_item = await super().update(session, update_model)

        if update_model.image_id:
            updated_item = await self._update_image(session, updated_item, update_model.image_id)

        return updated_item

    async def _update_image(self, session, item: SQLModel, image_id):
        """ Updating model link with file """
        tmp_manager = ModelManager(File, self.repo)
        item.image = await tmp_manager.get_by_id(session, image_id)
        await self.commit(session)
        return item
