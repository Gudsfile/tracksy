from dataclasses import replace

import pytest

from synthetic_datasets.factories.apple_music import AppleMusicFactory
from synthetic_datasets.models.apple_music import AppleMusicRecord


@pytest.mark.parametrize("num_records", range(0, 100, 3))
def test_create_streaming_history(num_records, default_generation_config):
    # given
    factory = AppleMusicFactory(num_records=num_records, config=default_generation_config)
    # when
    records = factory.create_streaming_history()
    # then
    assert len(records) == num_records
    for record in records:
        assert isinstance(record, AppleMusicRecord)


def test_same_seed_produces_identical_results(default_generation_config):
    # given
    num_records = 100
    # when
    factory1 = AppleMusicFactory(num_records, default_generation_config)
    records1 = factory1.create_streaming_history()

    factory2 = AppleMusicFactory(num_records, default_generation_config)
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
    factory1 = AppleMusicFactory(num_records, config1)
    records1 = factory1.create_streaming_history()

    factory2 = AppleMusicFactory(num_records, config2)
    records2 = factory2.create_streaming_history()
    # then
    assert records1 != records2


@pytest.mark.parametrize("seed", [0, 1, 42, 999, 12345])
def test_various_seeds_work(seed, default_generation_config):
    # given
    config = replace(default_generation_config, seed=seed)
    # when
    factory = AppleMusicFactory(100, config)
    records = factory.create_streaming_history()
    # then
    assert len(records) == 100


def test_all_records_are_audio(default_generation_config):
    factory = AppleMusicFactory(num_records=200, config=default_generation_config)
    records = factory.create_streaming_history()
    for record in records:
        assert record.media_type == "AUDIO"


def test_records_have_valid_client_platforms(default_generation_config):
    valid_platforms = {"FUSE", "TILT"}
    factory = AppleMusicFactory(num_records=200, config=default_generation_config)
    records = factory.create_streaming_history()
    for record in records:
        assert record.client_platform in valid_platforms


def test_play_duration_is_non_negative(default_generation_config):
    factory = AppleMusicFactory(num_records=200, config=default_generation_config)
    records = factory.create_streaming_history()
    for record in records:
        assert record.play_duration_ms >= 0


def test_song_names_are_non_empty(default_generation_config):
    factory = AppleMusicFactory(num_records=50, config=default_generation_config)
    records = factory.create_streaming_history()
    for record in records:
        assert record.song_name.strip() != ""
