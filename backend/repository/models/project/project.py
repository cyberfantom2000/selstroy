""" A Project represents. Basic model for building a project page """

from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, Relationship

from .shortdescription import ProjectShortDescription, ProjectShortDescriptionPublic
from .details import ProjectDetails, ProjectDetailsPublic
from ..apartment.apartment import Apartment, ApartmentPublic
from ..common import File, FilePublic


class ProjectImageLink(SQLModel, table=True):
    project_id: UUID | None = Field(default=None, foreign_key='project.id', primary_key=True)
    image_id: UUID | None = Field(default=None, foreign_key='file.id', primary_key=True)


class ProjectMasterPlanLink(SQLModel, table=True):
    project_id: UUID | None = Field(default=None, foreign_key='project.id', primary_key=True)
    master_plan_id: UUID | None = Field(default=None, foreign_key='file.id', primary_key=True)


class ProjectBase(SQLModel):
    id: UUID | None = Field(default_factory=uuid4, primary_key=True)
    title: str
    square_max: int
    square_min: int
    release_date: str
    floor_svg: str | None = Field(default=None)
    live_map: str | None = Field(default=None)


class Project(ProjectBase, table=True):
    slug: str | None = Field(default=None)
    active: bool = Field(default=False)
    images: list[File] = Relationship(back_populates=None, link_model=ProjectImageLink)
    master_plan: File | None = Relationship(back_populates=None, link_model=ProjectMasterPlanLink)
    short_description: ProjectShortDescription | None = Relationship(back_populates=None, cascade_delete=True)
    details: list[ProjectDetails] = Relationship(back_populates=None, cascade_delete=True)
    apartments: list[Apartment] = Relationship(back_populates=None, cascade_delete=True)


class ProjectPublic(ProjectBase):
    id: UUID
    images: list[FilePublic]
    master_plan: FilePublic | None
    short_description: ProjectShortDescriptionPublic | None
    details: list[ProjectDetailsPublic]
    apartments: list[ApartmentPublic]


class ProjectCreate(ProjectBase):
    slug: str | None = None
    images_ids: list[UUID] | None = None
    master_plan_id: UUID | None = None


class ProjectUpdate(ProjectBase):
    id: UUID
    title: str | None = None
    square_max: int | None = None
    square_min: int | None = None
    release_date: str | None = None
    floor_svg: str | None = None
    live_map: str | None = None
    images_ids: list[UUID] | None = None
    master_plan_id: UUID | None = None
