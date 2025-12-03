""" File description models """

from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field


class FileBase(SQLModel):
    id: UUID | None = Field(default_factory=uuid4, primary_key=True)


class File(FileBase, table=True):
    path: str
    name: str
    ext: str
    size: int


class FilePublic(FileBase):
    id: UUID


class FileCreate(FileBase):
    pass


class FileUpdate(FileBase):
    id: UUID
    path: str | None = None
    name: str | None = None
    ext: str | None = None
    size: str | None = None