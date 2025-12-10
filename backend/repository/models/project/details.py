""" A description represents. Project's detail description """

from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, Relationship

from ..common.file import File, FilePublic


class ProjectDetailsFileLink(SQLModel, table=True):
    project_detail_id: UUID | None = Field(default=None, foreign_key='projectdetails.id', primary_key=True, ondelete='CASCADE')
    file_id: UUID | None = Field(default=None, foreign_key='file.id', primary_key=True, ondelete='CASCADE')


class ProjectDetailsBase(SQLModel):
    id: UUID | None = Field(default_factory=uuid4, primary_key=True)
    title: str | None = Field(default=None)
    text: str


class ProjectDetails(ProjectDetailsBase, table=True):
    images: list[File] = Relationship(back_populates=None, link_model=ProjectDetailsFileLink)
    project_id: UUID | None = Field(default=None, foreign_key='project.id', ondelete='CASCADE')


class ProjectDetailsPublic(ProjectDetailsBase):
    images: list[FilePublic]


class ProjectDetailsCreate(ProjectDetailsBase):
    images_ids: list[UUID]
    project_id: UUID


class ProjectDetailsUpdate(ProjectDetailsBase):
    id: UUID
    title: str | None = None
    text: str | None = None
    images_ids: list[UUID] | None = None
    project_id: UUID | None = None
