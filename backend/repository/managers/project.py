from sqlmodel import SQLModel

from .base import ModelManager

from ..models.project import ProjectUpdate, ProjectCreate
from ..models.common import File


class ProjectManager(ModelManager):
    """ Project model manager. Override create and update methods for creating links
    to File models from an id
    """
    async def create(self, session, new_model: ProjectCreate):
        new_item = await super().create(session, new_model)

        await self._set_master_plan_field(session, new_item, new_model.images_ids)
        await self._set_master_plan_field(session, new_item, new_model.master_plan_id)
        if new_model.images_ids or new_model.master_plan_id:
             new_item = await super().update(session, new_item)

        return new_item

    async def update(self, session, update_model: ProjectUpdate):
        updated_item = await super().update(session, update_model)

        if update_model.images_ids is not None:
            await self._set_master_plan_field(session, updated_item, update_model.images_ids)
        if update_model.master_plan_id is not None:
            await self._set_master_plan_field(session, updated_item, update_model.master_plan_id)
        if update_model.images_ids is not None or update_model.master_plan_id is not None:
            updated_item = await super().update(session, updated_item)

        return updated_item

    async def _set_images_field(self, session, item: SQLModel, images_ids: list):
        """ Updating model links with images """
        item.images.clear()

        if images_ids:
            tmp_manager = ModelManager(File, self.repo)
            item.images = await tmp_manager.get(session=session, filters={'id': images_ids})

    async def _set_master_plan_field(self, session, item: SQLModel, master_plan_id):
        """ Updating model links with master plan """
        item.master_plan = None
        if master_plan_id:
            tmp_manager = ModelManager(File, self.repo)
            images = await tmp_manager.get(session=session, filters={'id': master_plan_id})
            item.master_plan = images[0]
