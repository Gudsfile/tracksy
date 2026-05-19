from dataclasses import replace

import pytest

from synthetic_datasets.factories.funkwhale import FunkWhaleFactory
from synthetic_datasets.models.funkwhale import FunkWhaleListen


@pytest.mark.parametrize("num_records", range(0, 100, 3))
def test_create_streaming_history(num_records, default_generation_config):
    factory = FunkWhaleFactory(num_records=num_records, config=default_generation_config)
    listens = factory.create_streaming_history()
    assert len(listens) == num_records
    for listen in listens:
        assert isinstance(listen, FunkWhaleListen)


def test_fields_are_populated(default_generation_config):
    factory = FunkWhaleFactory(num_records=100, config=default_generation_config)
    listens = factory.create_streaming_history()
    for listen in listens:
        assert listen.track.title
        assert listen.track.artist.name
        assert listen.track.album.title
        assert listen.track.duration > 0
        assert listen.track.mbid
        assert listen.track.artist.mbid
        assert listen.track.album.mbid


def test_same_seed_produces_identical_results(default_generation_config):
    factory1 = FunkWhaleFactory(100, default_generation_config)
    listens1 = factory1.create_streaming_history()

    factory2 = FunkWhaleFactory(100, default_generation_config)
    listens2 = factory2.create_streaming_history()

    assert listens1 == listens2


def test_different_seeds_produce_different_results(default_generation_config):
    config1 = replace(default_generation_config, seed=123)
    config2 = replace(default_generation_config, seed=456)

    factory1 = FunkWhaleFactory(50, config1)
    listens1 = factory1.create_streaming_history()

    factory2 = FunkWhaleFactory(50, config2)
    listens2 = factory2.create_streaming_history()

    assert listens1 != listens2


@pytest.mark.parametrize("seed", [0, 1, 42, 999, 12345])
def test_various_seeds_work(seed, default_generation_config):
    config = replace(default_generation_config, seed=seed)
    factory = FunkWhaleFactory(100, config)
    listens = factory.create_streaming_history()
    assert len(listens) == 100
