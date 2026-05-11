""" Gallery item description model """

from uuid import UUID, uuid4
from sqlmodel import Field, SQLModel, Relationship

from ..common import File, FilePublic


class GalleryItemBase(SQLModel):
    id: UUID | None = Field(default_factory=uuid4, primary_key=True)


class GalleryItem(GalleryItemBase, table=True):
    image_id: UUID | None = Field(default=None, foreign_key='file.id', ondelete='CASCADE')
    image: File | None = Relationship(back_populates=None, sa_relationship_kwargs={"lazy": "selectin"})


class GalleryItemPublic(GalleryItemBase):
    id: UUID
    image: FilePublic | None


class GalleryItemCreate(GalleryItemBase):
    image_id: UUID


class GalleryItemUpdate(GalleryItemBase):
    image_id: UUID | None = None
