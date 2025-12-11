from sqlmodel import SQLModel

from .base import ModelManager

from ..models.project import ProjectDetailsUpdate, ProjectDetailsCreate
from ..models.common import File

class ProjectDetailsManager(ModelManager):
    """ ProjectDetails model manager. Override create and update methods for creating links
    to File models from an id
    """
    async def create(self, session, new_model: ProjectDetailsCreate):
        new_item = await super().create(session, new_model)

        if new_model.images_ids:
            new_item = await self._update_images(session, new_item, new_model.images_ids)

        return new_item

    async def update(self, session, update_model: ProjectDetailsUpdate):
        updated_item = await super().update(session, update_model)

        if update_model.images_ids is not None:
            updated_item = await self._update_images(session, updated_item, update_model.images_ids)

        return updated_item

    async def _update_images(self, session, item: SQLModel, images_ids: list):
        """ Updating model links with files """
        item.images.clear()

        if images_ids:
            tmp_manager = ModelManager(File, self.repo)
            images = await tmp_manager.get(session=session, filters={'id': images_ids})
            item.images.extend(images)

        return await super().update(session, item)
