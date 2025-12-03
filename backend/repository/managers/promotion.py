from sqlmodel import SQLModel

from .base import ModelManager

from ..models.promotion import PromotionCreate, PromotionUpdate
from ..models.common import File


class PromotionManager(ModelManager):
    """ Promotion model manager. Override create and update methods for creating links
    to File models from an id
    """
    async def create(self, new_model: PromotionCreate):
        new_item = await super().create(new_model)

        if new_model.image_id:
            new_item = await self._update_image_field(new_item, new_model.image_id)

        return new_item

    async def update(self, update_model: PromotionUpdate):
        updated_item = await super().update(update_model)

        if updated_item.image_id:
            updated_item = await self._update_image_field(updated_item, update_model.image_id)

        return updated_item

    async def _update_image_field(self, item: SQLModel, image_id):
        """ Updating model links with image """
        tmp_manager = ModelManager(File, self.repo)
        files = await tmp_manager.get(filters={'id': image_id})
        item.image = files[0]

        return await super().update(item)
