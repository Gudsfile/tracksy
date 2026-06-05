from datetime import datetime

import pytest

from synthetic_datasets.config import GenerationConfig
from synthetic_datasets.factories.base import BaseFactory
from synthetic_datasets.models.base import BaseEvent


class ConcreteFactory(BaseFactory[str]):
    def _map_event(self, event: BaseEvent) -> str:
        return f"record:{event.track_index}"


@pytest.fixture
def config():
    return GenerationConfig(seed=42, reference_date=datetime(2026, 2, 8))


@pytest.fixture
def factory(config):
    return ConcreteFactory(num_records=10, config=config)


def test_year_gap_present(factory):
    ghost_count = sum(1 for ch in factory.chapters if ch.persona is None)
    assert ghost_count == 1


def test_month_gap_present(factory):
    active_chapters = [ch for ch in factory.chapters if ch.persona is not None]
    assert any(ch.selected_month_windows for ch in active_chapters)


def test_day_gap_present(factory):
    active_chapters = [ch for ch in factory.chapters if ch.persona is not None]
    assert any(ch.selected_day_windows for ch in active_chapters)


def test_gap_layout_deterministic(config):
    f1 = ConcreteFactory(num_records=10, config=config)
    f2 = ConcreteFactory(num_records=10, config=config)
    for ch1, ch2 in zip(f1.chapters, f2.chapters):
        assert ch1.selected_month_windows == ch2.selected_month_windows
        assert ch1.selected_day_windows == ch2.selected_day_windows


def test_selected_windows_dates_within_chapter_year(factory):
    for chapter in factory.chapters:
        for date_obj in chapter.inactivity_dates:
            assert date_obj.year == chapter.year


def test_day_windows_taken_whole(factory):
    for chapter in factory.chapters:
        for window in chapter.selected_day_windows:
            window_dates = set(window.to_dates(chapter.year))
            assert window_dates.issubset(chapter.inactivity_dates)
