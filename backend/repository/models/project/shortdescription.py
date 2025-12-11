""" A description represents. Project's short description, something like a slogan """

from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, Relationship

from ..common import File, FilePublic


class ProjectShortDescriptionFileLink(SQLModel, table=True):
    project_short_description_id: UUID | None = Field(default=None, foreign_key='projectshortdescription.id', primary_key=True, ondelete='CASCADE')
    file_id: UUID | None = Field(default=None, foreign_key='file.id', primary_key=True, ondelete='CASCADE')


class ProjectShortDescriptionBase(SQLModel):
    id: UUID | None = Field(default_factory=uuid4, primary_key=True)
    title: str
    sales_status: str


class ProjectShortDescription(ProjectShortDescriptionBase, table=True):
    image: File | None = Relationship(back_populates=None, link_model=ProjectShortDescriptionFileLink, sa_relationship_kwargs={"lazy": "selectin"})
    project_id: UUID | None = Field(default=None, foreign_key='project.id', ondelete='CASCADE')

class ProjectShortDescriptionPublic(ProjectShortDescriptionBase):
    id: UUID
    image: FilePublic | None


class ProjectShortDescriptionCreate(ProjectShortDescriptionBase):
    image_id: UUID | None = None
    project_id: UUID


class ProjectShortDescriptionUpdate(ProjectShortDescriptionBase):
    id: UUID
    title: str | None = None
    sales_status: str | None = None
    image_id: UUID | None = None
    project_id: UUID | None = None
