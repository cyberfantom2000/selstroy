"""Shared settings for the public site."""

from uuid import UUID

from sqlalchemy import CheckConstraint
from sqlmodel import SQLModel, Field, Relationship

from ..common import File


class SiteSettings(SQLModel, table=True):
    __table_args__ = (CheckConstraint('id = 1', name='ck_sitesettings_singleton'),)

    id: int = Field(default=1, primary_key=True, sa_column_kwargs={'autoincrement': False})
    years_on_market: int = Field(default=19, ge=0, sa_column_kwargs={'server_default': '19'})
    commissioned_area: int = Field(default=150000, ge=0, sa_column_kwargs={'server_default': '150000'})
    houses_built: int = Field(default=20, ge=0, sa_column_kwargs={'server_default': '20'})
    residents_count: int = Field(default=7500, ge=0, sa_column_kwargs={'server_default': '7500'})

    hero_image_id: UUID | None = Field(default=None, foreign_key='file.id', ondelete='SET NULL')
    hero_image: File | None = Relationship(sa_relationship_kwargs={'lazy': 'selectin'})
