import uuid
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest

from backend.repository.models.apartment import ApartmentType
from backend.search import Searcher
from backend.search.models import ApartmentFilters


def make_item(cost: int) -> SimpleNamespace:
    return SimpleNamespace(cost=cost)


def make_apartment(type_: int, is_draft: bool = False, square: float = 50.0,
                   costs: tuple = ()) -> SimpleNamespace:
    return SimpleNamespace(type=type_, is_draft=is_draft, square=square,
                           items=[make_item(cost) for cost in costs])


def make_project(is_draft: bool = False, release_date: str = '2026', sale_status: str = 'open',
                 square_min: float = 30.0, square_max: float = 100.0,
                 apartments: tuple = ()) -> SimpleNamespace:
    return SimpleNamespace(id=uuid.uuid4(), title='Project', is_draft=is_draft,
                           release_date=release_date, sale_status=sale_status,
                           square_min=square_min, square_max=square_max,
                           apartments=list(apartments))


def attach_project(apartment: SimpleNamespace, project: SimpleNamespace) -> SimpleNamespace:
    apartment.project = project
    return apartment


@pytest.fixture
def project_manager() -> AsyncMock:
    return AsyncMock()


@pytest.fixture
def apartment_manager() -> AsyncMock:
    return AsyncMock()


@pytest.fixture
def searcher(project_manager: AsyncMock, apartment_manager: AsyncMock) -> Searcher:
    return Searcher(project_manager, apartment_manager)


@pytest.mark.asyncio
async def test_apartments_filters_excludes_drafts_and_sorts(searcher: Searcher):
    first_project = make_project(release_date='2026', sale_status='open')
    second_project = make_project(release_date='2025', sale_status='sold')

    first_project.apartments = [
        make_apartment(ApartmentType.TWO_ROOM, costs=(5_000_000, 6_000_000)),
        make_apartment(ApartmentType.ONE_ROOM, costs=(4_000_000,)),
        make_apartment(ApartmentType.THREE_ROOM, is_draft=True, costs=(1_000_000,)),
    ]
    second_project.apartments = [
        make_apartment(ApartmentType.STUDIO, costs=(3_000_000,)),
    ]

    searcher.project_manager.get.return_value = [first_project, second_project]
    project_ids = [first_project.id, second_project.id]

    result = await searcher.apartments_filters(None, project_ids)

    searcher.project_manager.get.assert_awaited_once_with(
        session=None, filters={'is_draft': False, 'id': project_ids})

    assert result.projects == project_ids
    assert result.types == [ApartmentType.STUDIO, ApartmentType.ONE_ROOM, ApartmentType.TWO_ROOM]
    assert result.cost_min == 3_000_000
    assert result.cost_max == 6_000_000
    assert result.release_dates == ['2025', '2026']
    assert result.sale_statuses == ['open', 'sold']
    assert result.square_min == 30.0
    assert result.square_max == 100.0


@pytest.mark.asyncio
async def test_apartments_filters_without_project_ids(searcher: Searcher):
    searcher.project_manager.get.return_value = []

    result = await searcher.apartments_filters(None, None)

    searcher.project_manager.get.assert_awaited_once_with(
        session=None, filters={'is_draft': False, 'id': None})
    assert result.projects == []
    assert result.types == []


@pytest.mark.asyncio
async def test_apartments_excludes_drafts_and_sorts_sold_out_last(searcher: Searcher):
    published_project = make_project()
    draft_project = make_project(is_draft=True)

    available = attach_project(
        make_apartment(ApartmentType.ONE_ROOM, square=40.0, costs=(4_000_000,)), published_project)
    draft_apartment = attach_project(
        make_apartment(ApartmentType.TWO_ROOM, is_draft=True, square=60.0, costs=(5_000_000,)), published_project)
    apartment_of_draft_project = attach_project(
        make_apartment(ApartmentType.ONE_ROOM, square=50.0, costs=(3_000_000,)), draft_project)
    sold_out = attach_project(
        make_apartment(ApartmentType.THREE_ROOM, square=80.0, costs=()), published_project)
    expensive = attach_project(
        make_apartment(ApartmentType.TWO_ROOM, square=70.0, costs=(8_000_000,)), published_project)

    searcher.apartment_manager.get.return_value = [
        available, draft_apartment, apartment_of_draft_project, sold_out, expensive,
    ]

    result = await searcher.apartments(None, ApartmentFilters())

    searcher.apartment_manager.get.assert_awaited_once_with(session=None, filters={})
    assert result == [available, expensive, sold_out]


@pytest.mark.asyncio
async def test_apartments_normalizes_type_and_project_filters(searcher: Searcher):
    project = make_project()
    apartment = attach_project(make_apartment(ApartmentType.ONE_ROOM, costs=(4_000_000,)), project)
    searcher.apartment_manager.get.return_value = [apartment]

    await searcher.apartments(None, ApartmentFilters(types=[ApartmentType.ONE_ROOM], projects=[project.id]))

    searcher.apartment_manager.get.assert_awaited_once_with(
        session=None, filters={'type': [ApartmentType.ONE_ROOM], 'project_id': [project.id]})


@pytest.mark.asyncio
async def test_apartments_cost_filters_exclude_sold_out(searcher: Searcher):
    project = make_project()
    cheap = attach_project(make_apartment(ApartmentType.ONE_ROOM, costs=(4_000_000,)), project)
    expensive = attach_project(make_apartment(ApartmentType.TWO_ROOM, costs=(8_000_000,)), project)
    sold_out = attach_project(make_apartment(ApartmentType.THREE_ROOM, costs=()), project)
    searcher.apartment_manager.get.return_value = [cheap, expensive, sold_out]

    no_filter = await searcher.apartments(None, ApartmentFilters())
    assert no_filter == [cheap, expensive, sold_out]

    min_filter = await searcher.apartments(None, ApartmentFilters(cost_min=5_000_000))
    assert min_filter == [expensive]

    max_filter = await searcher.apartments(None, ApartmentFilters(cost_max=4_500_000))
    assert max_filter == [cheap]

    range_filter = await searcher.apartments(
        None, ApartmentFilters(cost_min=1_000_000, cost_max=10_000_000))
    assert range_filter == [cheap, expensive]


@pytest.mark.asyncio
async def test_apartments_release_sale_and_square_filters(searcher: Searcher):
    first_project = make_project(release_date='2026', sale_status='open')
    second_project = make_project(release_date='2025', sale_status='sold')

    first = attach_project(make_apartment(ApartmentType.ONE_ROOM, square=40.0, costs=(4_000_000,)), first_project)
    second = attach_project(make_apartment(ApartmentType.TWO_ROOM, square=70.0, costs=(5_000_000,)), second_project)
    searcher.apartment_manager.get.return_value = [first, second]

    assert await searcher.apartments(None, ApartmentFilters(release_dates=['2025'])) == [second]
    assert await searcher.apartments(None, ApartmentFilters(sale_statuses=['open'])) == [first]
    assert await searcher.apartments(None, ApartmentFilters(square_min=50.0)) == [second]
    assert await searcher.apartments(None, ApartmentFilters(square_max=50.0)) == [first]


@pytest.mark.asyncio
async def test_apartments_excludes_apartment_without_project(searcher: Searcher):
    orphan = make_apartment(ApartmentType.ONE_ROOM, costs=(4_000_000,))
    orphan.project = None
    searcher.apartment_manager.get.return_value = [orphan]

    assert await searcher.apartments(None, ApartmentFilters()) == []
