from uuid import UUID
from sqlmodel import SQLModel

from backend.repository.models.apartment import ApartmentPublic

class ProjectDescriptor(SQLModel):
    id: UUID
    title: str


class ApartmentFiltersRequest(SQLModel):
    projects: list[UUID] | None = None


class ApartmentFilters(SQLModel):
    projects: list[ProjectDescriptor] = list()
    types: list[str] = list()
    cost_from: int | None = None
    cost_to: int | None = None
    square_from: float | None = None
    square_to: float | None = None
    release_years: list[str] = list()
    sale_statuses: list[str] = list()


class SearchApartmentsResult(SQLModel):
    apartments: list[ApartmentPublic]
