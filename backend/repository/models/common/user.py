from uuid import UUID, uuid4
from enum import Enum
from sqlmodel import SQLModel, Field, Relationship


class Privilege(str, Enum):
    user = "user"
    admin = "admin"


class UserBase(SQLModel):
    id: UUID | None = Field(default_factory=uuid4, primary_key=True)
    login: str
    privilege: Privilege


class User(UserBase, table=True):
    name: str
    email: str
    password_hash: str
    refresh_tokens: list['RefreshToken'] = Relationship(back_populates='user')


class UserPublic(UserBase):
    id: UUID


class UserCreate(UserBase):
    password: str
    email: str | None
    name: str | None


class UserUpdate(UserBase):
    id: UUID
    email: str | None = None
    name: str | None = None
    privilege: Privilege | None = None
