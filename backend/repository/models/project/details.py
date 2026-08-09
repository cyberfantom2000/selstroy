""" A description represents. Project's detail description """

from uuid import UUID, uuid4
from enum import Enum
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Index, and_

from ..common.file import File, FilePublic


class ProjectDetailsType(str, Enum):
    DESCRIPTION = 'description'
    DETAIL = 'detail'


class ProjectDetailsFileLink(SQLModel, table=True):
    project_detail_id: UUID | None = Field(default=None, foreign_key='projectdetails.id', primary_key=True, ondelete='CASCADE')
    file_id: UUID | None = Field(default=None, foreign_key='file.id', primary_key=True, ondelete='CASCADE')


class ProjectDetailsBase(SQLModel):
    id: UUID | None = Field(default_factory=uuid4, primary_key=True)
    title: str | None = Field(default=None)
    text: str | None = Field(default=None)


class ProjectDetails(ProjectDetailsBase, table=True):
    project_id: UUID | None = Field(default=None, foreign_key='project.id', ondelete='CASCADE')
    images: list[File] = Relationship(back_populates=None, link_model=ProjectDetailsFileLink, sa_relationship_kwargs={"lazy": "selectin"})
    type: ProjectDetailsType = Field(index=True)

    __table_args__ = (
        Index(
            'uq_project_details_description',
            'project_id',
            unique=True,
            postgresql_where=and_(type == ProjectDetailsType.DESCRIPTION)
        ),
    )


class ProjectDetailsPublic(ProjectDetailsBase):
    project_id: UUID
    images: list[FilePublic]


class ProjectDetailsCreate(ProjectDetailsBase):
    project_id: UUID
    images_ids: list[UUID] | None = None


class ProjectDetailsUpdate(ProjectDetailsBase):
    id: UUID
    title: str | None = None
    text: str | None = None
    images_ids: list[UUID] | None = None
