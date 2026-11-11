""" An apartment represents. The basic model for building an apartment page """

from enum import IntEnum
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, Relationship

from .apartimage import ApartImage, ApartImagePublic
from .apartelement import ApartElement, ApartElementPublic
from ..common import File, FilePublic


class ApartmentType(IntEnum):
    """ Numeric apartment type. Human-readable labels are defined on the frontend """
    STUDIO = 0
    ONE_ROOM = 1
    TWO_ROOM = 2
    THREE_ROOM = 3
    FOUR_ROOM = 4


class ApartmentPdfLink(SQLModel, table=True):
    apartment_id: UUID | None = Field(default=None, foreign_key='apartment.id', primary_key=True, ondelete='CASCADE')
    pdf_id: UUID | None = Field(default=None, foreign_key='file.id', primary_key=True, ondelete='CASCADE')


class ApartmentBase(SQLModel):
    id: UUID | None = Field(default_factory=uuid4, primary_key=True)
    square: float
    type: int = Field(ge=ApartmentType.STUDIO.value, le=ApartmentType.FOUR_ROOM.value)
    total_floors: int
    is_draft: bool
    slug: str = Field(unique=True, index=True)


class Apartment(ApartmentBase, table=True):
    images: list[ApartImage] = Relationship(back_populates=None, cascade_delete=True, sa_relationship_kwargs={"lazy": "selectin"})
    items: list[ApartElement] = Relationship(back_populates=None, cascade_delete=True, sa_relationship_kwargs={"lazy": "selectin"})
    pdf: File | None = Relationship(back_populates=None, link_model=ApartmentPdfLink, sa_relationship_kwargs={"lazy": "selectin"})
    project_id: UUID | None = Field(default=None, foreign_key='project.id', ondelete='CASCADE')
    project: 'Project' = Relationship(back_populates='apartments', sa_relationship_kwargs={"lazy": "selectin"})


class ApartmentPublic(ApartmentBase):
    id: UUID
    project_id: UUID
    images: list[ApartImagePublic]
    items: list[ApartElementPublic]
    pdf: FilePublic | None


class ApartmentCreate(ApartmentBase):
    pdf_id: UUID | None = None
    project_id: UUID


class ApartmentUpdate(ApartmentBase):
    id: UUID
    square: float | None = None
    type: int | None = Field(default=None, ge=ApartmentType.STUDIO.value, le=ApartmentType.FOUR_ROOM.value)
    total_floors: int = None
    pdf_id: UUID | None = None
    is_draft: bool | None = None
    slug: str | None = None
