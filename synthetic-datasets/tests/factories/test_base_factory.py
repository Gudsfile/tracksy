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
    for year in range(2020, 2026):
        dt = factory._get_random_datetime_for_year(year)
        assert dt.year == year


def test_get_random_datetime_for_current_year_never_future(factory):
    current_year = factory.now.year
    for _ in range(100):
        dt = factory._get_random_datetime_for_year(current_year)
        assert dt <= factory.now


def test_generate_distribution_over_year_sums_to_n(factory):
    for n in [0, 1, 50, 100, 999]:
        result = factory._generate_distribution_over_year(n)
        assert sum(result.values()) == n


def test_generate_distribution_over_year_largest_remainder(factory, config):
    # Edge cases: sum must always equal n_records
    for n in [0, 1, 3, 100, 1000]:
        result = factory._generate_distribution_over_year(n)
        assert sum(result.values()) == n, f"sum mismatch for n={n}"

    # Determinism: same seed produces same distribution
    factory_a = ConcreteFactory(num_records=10, config=config)
    factory_b = ConcreteFactory(num_records=10, config=config)
    assert factory_a._generate_distribution_over_year(97) == factory_b._generate_distribution_over_year(97)

    # Largest remainder correctness: monkey-patch weights so we can predict the result.
    # With equal weights across N years, each year gets exactly n_records / N.
    # When not evenly divisible the remainder must be spread one per year starting
    # from the first years (all fractional parts are equal so ordering is stable).

    years = list(range(factory.start_year, factory.now.year + 1))
    n_years = len(years)
    n = n_years * 3 + 1  # e.g. 19 for 6 years => floor=3 per year, leftover=1

    # Temporarily replace rng.uniform to return a constant weight
    original_uniform = factory.rng.uniform
    factory.rng.uniform = lambda a, b: 1.0  # type: ignore[method-assign]
    result = factory._generate_distribution_over_year(n)
    factory.rng.uniform = original_uniform  # type: ignore[method-assign]

    assert sum(result.values()) == n
    floor_val = n // n_years
    ceil_val = floor_val + 1
    leftover = n - floor_val * n_years
    assert sum(1 for v in result.values() if v == ceil_val) == leftover
    assert sum(1 for v in result.values() if v == floor_val) == n_years - leftover
    # All values must be floor or ceil — no other values allowed
    for v in result.values():
        assert v in (floor_val, ceil_val), f"unexpected count {v}"


def test_rng_seeding_is_deterministic(config):
    f1 = ConcreteFactory(num_records=50, config=config)
    f2 = ConcreteFactory(num_records=50, config=config)
    assert f1._records_per_year == f2._records_per_year


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


def test_generate_base_events_count_matches_records_per_year(factory):
    events = factory._generate_base_events()
    assert len(events) == sum(factory._records_per_year.values())


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
    assert len(records) == sum(factory._records_per_year.values())


def test_same_seed_same_output(config):
    f1 = ConcreteFactory(num_records=50, config=config)
    r1 = f1.create_streaming_history()
    f2 = ConcreteFactory(num_records=50, config=config)
    r2 = f2.create_streaming_history()
    assert r1 == r2


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
