from dataclasses import replace

import pytest

from synthetic_datasets.factories.jellyfin import JellyFinFactory
from synthetic_datasets.models.jellyfin import JellyFinRecord


@pytest.mark.parametrize("num_records", range(0, 100, 3))
def test_create_streaming_history(num_records, default_generation_config):
    # given
    factory = JellyFinFactory(num_records=num_records, config=default_generation_config)
    # when
    records = factory.create_streaming_history()
    # then
    assert len(records) == num_records
    for record in records:
        assert isinstance(record, JellyFinRecord)


def test_same_seed_produces_identical_results(default_generation_config):
    # given
    num_records = 100
    # when
    factory1 = JellyFinFactory(num_records, default_generation_config)
    records1 = factory1.create_streaming_history()

    factory2 = JellyFinFactory(num_records, default_generation_config)
    records2 = factory2.create_streaming_history()
    # then
    assert len(records1) == len(records2)
    assert records1 == records2


def test_different_seeds_produce_different_results(default_generation_config):
    # given
    num_records = 50
    config1 = replace(default_generation_config, seed=123)
    config2 = replace(default_generation_config, seed=456)
    # when
    factory1 = JellyFinFactory(num_records, config1)
    records1 = factory1.create_streaming_history()

    factory2 = JellyFinFactory(num_records, config2)
    records2 = factory2.create_streaming_history()
    # then
    assert records1 != records2


@pytest.mark.parametrize("seed", [0, 1, 42, 999, 12345])
def test_various_seeds_work(seed, default_generation_config):
    # given
    config = replace(default_generation_config, seed=seed)
    # when
    factory = JellyFinFactory(100, config)
    records = factory.create_streaming_history()
    # then
    assert len(records) == 100


def test_non_audio_records_are_present(default_generation_config):
    # given — generate enough records so ~10% non-Audio should appear
    factory = JellyFinFactory(num_records=500, config=default_generation_config)
    # when
    records = factory.create_streaming_history()
    # then
    non_audio = [r for r in records if r.item_type != "Audio"]
    assert len(non_audio) > 0, "Expected some non-Audio records (~10%), but found none"


def test_records_have_valid_item_types(default_generation_config):
    # given
    valid_types = {"Audio", "Movie", "Episode"}
    factory = JellyFinFactory(num_records=200, config=default_generation_config)
    # when
    records = factory.create_streaming_history()
    # then
    for record in records:
        assert record.item_type in valid_types


def test_records_have_valid_playback_methods(default_generation_config):
    # given
    valid_methods = {"DirectPlay", "Transcode"}
    factory = JellyFinFactory(num_records=200, config=default_generation_config)
    # when
    records = factory.create_streaming_history()
    # then
    for record in records:
        assert record.playback_method in valid_methods


def test_records_have_valid_client_names(default_generation_config):
    # given
    valid_clients = {"Jellyfin Web", "Jellyfin Android", "Jellyfin iOS", "Infuse", "Swiftfin"}
    factory = JellyFinFactory(num_records=200, config=default_generation_config)
    # when
    records = factory.create_streaming_history()
    # then
    for record in records:
        assert record.client_name in valid_clients
