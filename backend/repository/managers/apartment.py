from sqlmodel import SQLModel

from .base import ModelManager

from ..models.apartment import ApartmentUpdate, ApartmentCreate
from ..models.common import File


class ApartmentManager(ModelManager):
    """ Apartment model manager. Override create and update methods for creating links
    to File models from an id
    """
    async def create(self, session, new_model: ApartmentCreate):
        new_item = await super().create(session, new_model)

        if new_model.pdf_id:
            new_item = await self._update_pdf_field(session, new_item, new_model.pdf_id)

        return new_item

    async def update(self, session, update_model: ApartmentUpdate):
        updated_item = await super().update(session, update_model)

        if update_model.pdf_id:
            updated_item = await self._update_pdf_field(session, updated_item, update_model.pdf_id)

        return updated_item

    async def _update_pdf_field(self, session, item: SQLModel, pdf_id):
        """ Updating model links with image """
        tmp_manager = ModelManager(File, self.repo)
        files = await tmp_manager.get(session=session, filters={'id': pdf_id})
        item.pdf = files[0]

        return await super().update(session, item)
