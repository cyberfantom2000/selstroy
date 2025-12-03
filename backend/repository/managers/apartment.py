from sqlmodel import SQLModel

from .base import ModelManager

from ..models.apartment import ApartmentUpdate, ApartmentCreate
from ..models.common import File


class ApartmentManager(ModelManager):
    """ Apartment model manager. Override create and update methods for creating links
    to File models from an id
    """
    async def create(self, new_model: ApartmentCreate):
        new_item = await super().create(new_model)

        if new_model.pdf_id:
            new_item = await self._update_pdf_field(new_item, new_model.pdf_id)

        return new_item

    async def update(self, update_model: ApartmentUpdate):
        updated_item = await super().update(update_model)

        if updated_item.pdf_id:
            updated_item = await self._update_pdf_field(updated_item, update_model.pdf_id)

        return updated_item

    async def _update_pdf_field(self, item: SQLModel, pdf_id):
        """ Updating model links with image """
        tmp_manager = ModelManager(File, self.repo)
        files = await tmp_manager.get(filters={'id': pdf_id})
        item.pdf = files[0]

        return await super().update(item)
