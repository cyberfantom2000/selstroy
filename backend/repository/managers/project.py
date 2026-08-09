from sqlmodel import SQLModel

from .base import ModelManager

from ..models.project import ProjectUpdate, ProjectDetails, ProjectCreate, ProjectDetailsType
from ..models.common import File
from ..utils import raise_for_invalid_slug


class ProjectManager(ModelManager):
    """ Project model manager. Override create and update methods for creating links
    to File models from an id
    """
    async def create(self, session, new_model: ProjectCreate) -> SQLModel:
        raise_for_invalid_slug(new_model.slug)

        new_item = await super().create(session, new_model)

        if new_model.master_plan_id:
            new_item.master_plan = await self._get_image(session, new_model.master_plan_id)
        if new_model.preview_image_id:
            new_item.preview_image = await self._get_image(session, new_model.preview_image_id)

        if new_model.master_plan_id or new_model.preview_image_id:
            await self.commit(session)

        await self._create_description(session, new_item.id)

        await self.repo.refresh(session, [new_item])

        return new_item

    async def update(self, session, update_model: ProjectUpdate) -> SQLModel:
        if update_model.slug is not None:
            raise_for_invalid_slug(update_model.slug)

        updated_item = await super().update(session, update_model)

        if update_model.master_plan_id is not None:
            updated_item.master_plan = await self._get_image(session, update_model.master_plan_id)
        if update_model.preview_image_id is not None:
            updated_item.preview_image = await self._get_image(session, update_model.preview_image_id)

        if update_model.master_plan_id is not None or update_model.preview_image_id is not None:
            updated_item = await super().update(session, updated_item)

        return updated_item

    async def _get_image(self, session, img_id) -> SQLModel | None:
        """ Return image by id """
        tmp_manager = ModelManager(File, self.repo)
        return await tmp_manager.get_by_id(session, img_id)

    async def _create_description(self, session, project_id) -> None:
        """ Create required project description """
        tmp_manager = ModelManager(ProjectDetails, self.repo)
        description = ProjectDetails(project_id=project_id, type=ProjectDetailsType.DESCRIPTION)
        await tmp_manager.create(session, description)