from sqlmodel import SQLModel

from .base import ModelManager

from ..models.apartment import ApartImageUpdate, ApartImageCreate
from ..models.common import File


class ApartImageManager(ModelManager):
    """ ApartImage model manager. Override create and update methods for creating links
    to File models from an id
    """
    async def create(self, new_model: ApartImageCreate):
        new_item = await super().create(new_model)

        if new_model.image_id or new_model.icon_id:
            new_item = await self._update_image_fields(new_item, new_model.image_id, new_model.icon_id)

        return new_item

    async def update(self, update_model: ApartImageUpdate):
        updated_item = await super().update(update_model)

        if updated_item.image_id or updated_item.icon_id:
            updated_item = await self._update_image_fields(updated_item, update_model.image_id, update_model.icon_id)

        return updated_item

    async def _update_image_fields(self, item: SQLModel, icon_id, image_id):
        """ Updating model links with image """

        tmp_manager = ModelManager(File, self.repo)
        if image_id:
            images = await tmp_manager.get(filters={'id': image_id})
            item.image = images[0]
        if icon_id:
            images = await tmp_manager.get(filters={'id': image_id})
            item.image = images[0]

        return await super().update(item)
