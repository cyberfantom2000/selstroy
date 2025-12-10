""" Promotion represents. The basic model for building promotions page """

from uuid import uuid4, UUID
from sqlmodel import SQLModel, Field, Relationship

from ..common import File, FilePublic


class PromotionImageLink(SQLModel, table=True):
    promotion_id: UUID | None = Field(default=None, foreign_key='promotion.id', primary_key=True, ondelete='CASCADE')
    image_id: UUID | None = Field(default=None, foreign_key='file.id', primary_key=True, ondelete='CASCADE')


class PromotionBase(SQLModel):
    id: UUID | None = Field(default_factory=uuid4, primary_key=True)
    text: str


class Promotion(PromotionBase, table=True):
    image: File | None = Relationship(back_populates=None, link_model=PromotionImageLink)


class PromotionPublic(PromotionBase):
    id: UUID
    image: FilePublic | None


class PromotionCreate(PromotionBase):
    image_id: UUID | None = None


class PromotionUpdate(PromotionBase):
    id: UUID
    text: str | None = None
    image_id: UUID | None = None
