import re
from dataclasses import replace

import pytest

from synthetic_datasets.factories.custom import CustomFactory
from synthetic_datasets.models.custom import CustomStreaming

TRACK_URI_PATTERN = re.compile(r"^custom:[a-z0-9-]+:[a-z0-9-]+$")


@pytest.mark.parametrize("num_records", range(0, 100, 3))
def test_create_streaming_history(num_records, default_generation_config):
    factory = CustomFactory(num_records=num_records, config=default_generation_config)
    streamings = factory.create_streaming_history()
    assert len(streamings) == num_records
    for streaming in streamings:
        assert isinstance(streaming, CustomStreaming)


def test_track_uri_format(default_generation_config):
    factory = CustomFactory(num_records=100, config=default_generation_config)
    streamings = factory.create_streaming_history()
    for streaming in streamings:
        assert TRACK_URI_PATTERN.match(streaming.track_uri), f"Invalid track_uri: {streaming.track_uri}"


def test_ms_played_non_negative(default_generation_config):
    factory = CustomFactory(num_records=100, config=default_generation_config)
    streamings = factory.create_streaming_history()
    for streaming in streamings:
        assert streaming.ms_played > 0


def test_platform_non_empty(default_generation_config):
    factory = CustomFactory(num_records=100, config=default_generation_config)
    streamings = factory.create_streaming_history()
    for streaming in streamings:
        assert streaming.platform != ""


def test_same_seed_produces_identical_results(default_generation_config):
    num_records = 100
    factory1 = CustomFactory(num_records, default_generation_config)
    streamings1 = factory1.create_streaming_history()
    factory2 = CustomFactory(num_records, default_generation_config)
    streamings2 = factory2.create_streaming_history()
    assert streamings1 == streamings2


def test_different_seeds_produce_different_results(default_generation_config):
    num_records = 50
    config1 = replace(default_generation_config, seed=123)
    config2 = replace(default_generation_config, seed=456)
    factory1 = CustomFactory(num_records, config1)
    streamings1 = factory1.create_streaming_history()
    factory2 = CustomFactory(num_records, config2)
    streamings2 = factory2.create_streaming_history()
    assert streamings1 != streamings2


@pytest.mark.parametrize("seed", [0, 1, 42, 999, 12345])
def test_various_seeds_work(seed, default_generation_config):
    config = replace(default_generation_config, seed=seed)
    factory = CustomFactory(100, config)
    streamings = factory.create_streaming_history()
    assert len(streamings) == 100
