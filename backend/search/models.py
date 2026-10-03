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
    cost_min: int | None = None
    cost_max: int | None = None
    square_min: float | None = None
    square_max: float | None = None
    release_dates: list[str] = list()
    sale_statuses: list[str] = list()


class SearchApartmentsResult(SQLModel):
    apartments: list[ApartmentPublic]
