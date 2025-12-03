""" An apartment element represents a set of data: floor, apartment number, price """

from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field


class ApartElementBase(SQLModel):
    id: UUID | None = Field(default_factory=uuid4, primary_key=True)
    floor: int
    number: int
    cost: int


class ApartElement(ApartElementBase, table=True):
    apartment_id: UUID | None = Field(default_factory=None, foreign_key='apartment.id', ondelete='CASCADE')


class ApartElementPublic(ApartElementBase):
    id: UUID


class ApartElementCreate(ApartElementBase):
    apartment_id: UUID


class ApartElementUpdate(ApartElementBase):
    id: UUID
    floor: int | None = None
    number: int | None = None
    cost: int | None = None
    apartment_id: UUID | None = None
