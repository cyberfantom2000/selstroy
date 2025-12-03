""" An apartment image represents. Used to create a block with switchable images of apartments by category """

from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, Relationship

from ..common import File, FilePublic


class ApartImageIconLink(SQLModel, table=True):
    apart_image_id: UUID | None = Field(default=None, foreign_key='apartimage.id', primary_key=True)
    icon_id: UUID | None = Field(default=None, foreign_key='file.id', primary_key=True)


class ApartImageImageLink(SQLModel, table=True):
    apart_image_id: UUID | None = Field(default=None, foreign_key='apartimage.id', primary_key=True)
    image_id: UUID | None = Field(default=None, foreign_key='file.id', primary_key=True)


class ApartImageBase(SQLModel):
    id: UUID | None = Field(default_factory=uuid4, primary_key=True)
    category: str


class ApartImage(ApartImageBase, table=True):
    category_icon: File | None = Relationship(back_populates=None)
    image: File | None = Relationship(back_populates=None)
    apartment_id: UUID | None = Field(default=None, foreign_key='apartment.id', ondelete='CASCADE')


class ApartImagePublic(ApartImageBase):
    id: UUID
    category_icon: FilePublic | None
    image: FilePublic


class ApartImageCreate(ApartImageBase):
    category_icon_id: UUID | None = None
    image_id: UUID
    apartment_id: UUID


class ApartImageUpdate(ApartImageBase):
    id: UUID
    category: str | None = None
    category_icon_id: UUID | None = None
    image_id: UUID | None = None
    apartment_id: UUID | None = None
