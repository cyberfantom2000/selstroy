from uuid import uuid4, UUID
from datetime import datetime, timedelta, UTC

from sqlmodel import SQLModel, Field, Relationship
from common import settings
from ..common.user import User


def ttl_factory() -> datetime:
    """ Refresh token TTL factory """
    return datetime.now(UTC) + timedelta(days=settings.refresh_token_ttl_days)


class RefreshToken(SQLModel, table=True):
    id: UUID | None = Field(default_factory=uuid4, primary_key=True)
    token: str = Field(nullable=False, index=True, unique=True)
    csrf: str = Field(nullable=False, index=True, unique=True)
    user: User | None = Relationship(back_populates="refresh_tokens")
    revoked: bool = Field(default=False, nullable=False)
    expires: datetime = Field(default_factory=ttl_factory, nullable=False)
