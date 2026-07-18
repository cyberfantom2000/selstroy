""" A Project represents. Basic model for building a project page """

from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, Relationship

from .details import ProjectDetails, ProjectDetailsPublic
from ..apartment.apartment import Apartment, ApartmentPublic
from ..common import File, FilePublic


class ProjectDescriptionLink(SQLModel, table=True):
    project_id: UUID | None = Field(default=None, foreign_key='project.id', primary_key=True, ondelete='CASCADE')
    detail_id: UUID | None = Field(default=None, foreign_key='projectdetails.id', primary_key=True, ondelete='CASCADE')


class ProjectDetailsLink(SQLModel, table=True):
    project_id: UUID | None = Field(default=None, foreign_key='project.id', primary_key=True, ondelete='CASCADE')
    detail_id: UUID | None = Field(default=None, foreign_key='projectdetails.id', primary_key=True, ondelete='CASCADE')


class ProjectMasterPlanLink(SQLModel, table=True):
    project_id: UUID | None = Field(default=None, foreign_key='project.id', primary_key=True, ondelete='CASCADE')
    master_plan_id: UUID | None = Field(default=None, foreign_key='file.id', primary_key=True, ondelete='CASCADE')


class ProjectPreviewImageLink(SQLModel, table=True):
    project_id: UUID | None = Field(default=None, foreign_key='project.id', primary_key=True, ondelete='CASCADE')
    image_id: UUID | None = Field(default=None, foreign_key='file.id', primary_key=True, ondelete='CASCADE')


class ProjectBase(SQLModel):
    id: UUID | None = Field(default_factory=uuid4, primary_key=True)
    title: str
    tags: str | None = Field(default=None)
    square_max: float
    square_min: float
    release_date: str
    is_draft: bool
    slug: str = Field(unique=True, index=True)
    floor_svg: str | None = Field(default=None)
    live_map: str | None = Field(default=None)
    sale_status: str | None = Field(default=None)


class Project(ProjectBase, table=True):
    description: ProjectDetails | None = Relationship(back_populates=None, link_model=ProjectDescriptionLink, sa_relationship_kwargs={"lazy": "selectin"})
    master_plan: File | None = Relationship(back_populates=None, link_model=ProjectMasterPlanLink, sa_relationship_kwargs={"lazy": "selectin"})
    details: list[ProjectDetails] = Relationship(back_populates=None, link_model=ProjectDetailsLink, sa_relationship_kwargs={"lazy": "selectin"})
    apartments: list[Apartment] = Relationship(back_populates=None, cascade_delete=True, sa_relationship_kwargs={"lazy": "selectin"})
    preview_image: File | None = Relationship(back_populates=None, link_model=ProjectPreviewImageLink, sa_relationship_kwargs={"lazy": "selectin"})


class ProjectPublic(ProjectBase):
    id: UUID
    description: ProjectDetailsPublic | None
    master_plan: FilePublic | None
    details: list[ProjectDetailsPublic]
    apartments: list[ApartmentPublic]
    preview_image: FilePublic | None


class ProjectCreate(ProjectBase):
    master_plan_id: UUID | None = None
    preview_image_id: UUID | None = None


class ProjectUpdate(ProjectBase):
    id: UUID
    slug: str | None = None
    tags: str | None = None
    title: str | None = None
    square_max: float | None = None
    square_min: float | None = None
    release_date: str | None = None
    sale_status: str | None = None
    is_draft: bool | None = None
    floor_svg: str | None = None
    live_map: str | None = None
    master_plan_id: UUID | None = None
    preview_image_id: UUID | None = None
