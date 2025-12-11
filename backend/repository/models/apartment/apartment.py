""" An apartment represents. The basic model for building an apartment page """

from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, Relationship

from .apartimage import ApartImage, ApartImagePublic
from .apartelement import ApartElement, ApartElementPublic
from ..common import File, FilePublic


class ApartmentPdfLink(SQLModel, table=True):
    apartment_id: UUID | None = Field(default=None, foreign_key='apartment.id', primary_key=True, ondelete='CASCADE')
    pdf_id: UUID | None = Field(default=None, foreign_key='file.id', primary_key=True, ondelete='CASCADE')


class ApartmentBase(SQLModel):
    id: UUID | None = Field(default_factory=uuid4, primary_key=True)
    title: str
    size: float
    type: str


class Apartment(ApartmentBase, table=True):
    images: list[ApartImage] = Relationship(back_populates=None, cascade_delete=True, sa_relationship_kwargs={"lazy": "selectin"})
    items: list[ApartElement] = Relationship(back_populates=None, cascade_delete=True, sa_relationship_kwargs={"lazy": "selectin"})
    pdf: File | None = Relationship(back_populates=None, link_model=ApartmentPdfLink, sa_relationship_kwargs={"lazy": "selectin"})
    project_id: UUID | None = Field(default=None, foreign_key='project.id', ondelete='CASCADE')


class ApartmentPublic(ApartmentBase):
    id: UUID
    images: list[ApartImagePublic]
    items: list[ApartElementPublic]
    pdf: FilePublic | None


class ApartmentCreate(ApartmentBase):
    pdf_id: UUID | None = None
    project_id: UUID


class ApartmentUpdate(ApartmentBase):
    id: UUID
    title: str | None = None
    size: float | None = None
    type: str | None = None
    pdf: str | None = None
    pdf_id: UUID | None = None
    project_id: UUID | None = None
