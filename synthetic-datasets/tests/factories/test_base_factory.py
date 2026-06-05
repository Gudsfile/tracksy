import dataclasses
import random
from datetime import datetime

import pytest
from faker import Faker
from numpy.random import Generator

from synthetic_datasets.config import GenerationConfig
from synthetic_datasets.factories.apple_music import AppleMusicFactory
from synthetic_datasets.factories.base import BaseFactory
from synthetic_datasets.factories.deezer import DeezerFactory
from synthetic_datasets.factories.spotify import SpotifyFactory
from synthetic_datasets.models.base import BaseEvent, BaseTrack


class ConcreteFactory(BaseFactory[str]):
    def _map_event(self, event: BaseEvent) -> str:
        return f"record:{event.track_index}"


@pytest.fixture
def config():
    return GenerationConfig(seed=42, reference_date=datetime(2026, 2, 8))


@pytest.fixture
def factory(config):
    return ConcreteFactory(num_records=10, config=config)


def test_get_random_datetime_for_year_returns_correct_year(factory):
    for year in range(factory.start_year, factory.now.year + 1):
        dt = factory._get_random_datetime_for_year(year)
        assert dt.year == year


def test_get_random_datetime_for_current_year_never_future(factory):
    current_year = factory.now.year
    for _ in range(100):
        dt = factory._get_random_datetime_for_year(current_year)
        assert dt <= factory.now


def test_rng_seeding_is_deterministic(config):
    f1 = ConcreteFactory(num_records=50, config=config)
    f2 = ConcreteFactory(num_records=50, config=config)
    assert f1._records_per_chapter == f2._records_per_chapter


def test_instance_level_rngs_exist(factory):
    assert isinstance(factory.rng, random.Random)
    assert isinstance(factory.np_rng, Generator)
    assert isinstance(factory.faker, Faker)


def test_generate_catalog_returns_base_tracks(factory):
    assert len(factory._catalog) > 0
    for track in factory._catalog:
        assert isinstance(track, BaseTrack)
        assert track.title
        assert track.artist
        assert track.album
        assert factory.TRACK_DURATION_MIN_MS <= track.duration_ms <= factory.TRACK_DURATION_MAX_MS


def test_weighted_tracks_contains_indices(factory):
    for year, indices in factory._weighted_tracks.items():
        assert len(indices) > 0
        for idx in indices:
            assert isinstance(idx, int)
            assert 0 <= idx < len(factory._catalog)


def test_generate_base_events_returns_sorted_events(factory):
    events = factory._generate_base_events()
    timestamps = [e.timestamp for e in events]
    assert timestamps == sorted(timestamps)


def test_generate_base_events_count_matches_records_per_chapter(factory):
    events = factory._generate_base_events()
    assert len(events) == sum(factory._records_per_chapter.values())


def test_base_event_duration_ratio_skipped(config):
    factory = ConcreteFactory(num_records=200, config=config)
    events = factory._generate_base_events()
    for event in events:
        if event.is_skipped:
            assert 0.05 <= event.duration_ratio <= 0.30
        else:
            assert 0.90 <= event.duration_ratio <= 1.00


def test_create_streaming_history_count(config):
    factory = ConcreteFactory(num_records=50, config=config)
    records = factory.create_streaming_history()
    assert len(records) == sum(factory._records_per_chapter.values())


def test_same_seed_same_output(config):
    f1 = ConcreteFactory(num_records=50, config=config)
    r1 = f1.create_streaming_history()
    f2 = ConcreteFactory(num_records=50, config=config)
    r2 = f2.create_streaming_history()
    assert r1 == r2


def test_build_chapters_returns_five(factory):
    assert len(factory.chapters) == 5


def test_position_four_is_current_era(factory):
    assert factory.chapters[4].position == 4
    from synthetic_datasets.personas import CURRENT_ERA

    assert factory.chapters[4].persona == CURRENT_ERA


def test_position_zero_never_ghost(factory):
    assert factory.chapters[0].persona is not None


def test_exactly_one_ghost(factory):
    ghost_count = sum(1 for ch in factory.chapters if ch.persona is None)
    assert ghost_count == 1


def test_same_seed_same_chapter_ordering(config):
    f1 = ConcreteFactory(num_records=50, config=config)
    f2 = ConcreteFactory(num_records=50, config=config)
    for ch1, ch2 in zip(f1.chapters, f2.chapters):
        assert ch1.position == ch2.position
        assert ch1.year == ch2.year
        assert (ch1.persona is None) == (ch2.persona is None)
        if ch1.persona is not None and ch2.persona is not None:
            assert ch1.persona.name == ch2.persona.name


def test_different_seeds_different_ordering(config):
    configs = [
        config,
        dataclasses.replace(config, seed=42),
        dataclasses.replace(config, seed=999),
    ]
    factories = [ConcreteFactory(num_records=50, config=c) for c in configs]
    chapter_sequences = [
        tuple((ch.position, ch.persona.name if ch.persona else None) for ch in f.chapters) for f in factories
    ]
    assert len(set(chapter_sequences)) >= 2  # At least 2 different orderings among 3 seeds


def test_ghost_gets_zero_records(factory):
    for chapter in factory.chapters:
        if chapter.persona is None:
            assert factory._records_per_chapter[chapter.position] == 0


def test_records_sum_equals_num_records(config):
    for num in [50, 100, 500, 1000]:
        factory = ConcreteFactory(num_records=num, config=config)
        assert sum(factory._records_per_chapter.values()) == num


def test_chapters_property_is_tuple_of_chapter(factory):
    from synthetic_datasets.chapters import Chapter

    assert isinstance(factory.chapters, tuple)
    assert all(isinstance(ch, Chapter) for ch in factory.chapters)


def test_at_least_one_active_chapter_has_month_windows(factory):
    active_chapters = [ch for ch in factory.chapters if ch.persona is not None]
    assert any(ch.selected_month_windows for ch in active_chapters)


def test_at_least_one_active_chapter_has_day_windows(factory):
    active_chapters = [ch for ch in factory.chapters if ch.persona is not None]
    assert any(ch.selected_day_windows for ch in active_chapters)


def test_global_random_not_used(config):
    """Instance-level rng; global random state must not affect output."""
    random.seed(999)
    f1 = ConcreteFactory(num_records=30, config=config)
    r1 = f1.create_streaming_history()

    random.seed(0)
    f2 = ConcreteFactory(num_records=30, config=config)
    r2 = f2.create_streaming_history()

    assert r1 == r2


class TestCrossProviderCatalogConsistency:
    def test_same_seed_produces_same_catalog(self, config):
        spotify = SpotifyFactory(100, config)
        deezer = DeezerFactory(100, config)
        apple = AppleMusicFactory(100, config)

        for i, base_track in enumerate(spotify._catalog):
            assert deezer._catalog[i].title == base_track.title
            assert deezer._catalog[i].artist == base_track.artist
            assert apple._catalog[i].title == base_track.title
            assert apple._catalog[i].album == base_track.album
