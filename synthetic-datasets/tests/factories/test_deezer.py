import re
from dataclasses import replace

import pytest

from synthetic_datasets.factories.deezer import DeezerFactory
from synthetic_datasets.models.deezer import DeezerStreaming

ISRC_PATTERN = re.compile(r"^[A-Z]{2}[A-Z0-9]{3}\d{7}$")


@pytest.mark.parametrize("num_records", range(0, 100, 3))
def test_create_streaming_history(num_records, default_generation_config):
    # given
    factory = DeezerFactory(num_records=num_records, config=default_generation_config)
    # when
    streamings = factory.create_streaming_history()
    # then
    assert len(streamings) == num_records
    for streaming in streamings:
        assert isinstance(streaming, DeezerStreaming)


def test_isrc_format(default_generation_config):
    # given
    factory = DeezerFactory(num_records=100, config=default_generation_config)
    # when
    streamings = factory.create_streaming_history()
    # then
    for streaming in streamings:
        assert ISRC_PATTERN.match(streaming.isrc), f"Invalid ISRC: {streaming.isrc}"


def test_same_seed_produces_identical_results(default_generation_config):
    # given
    num_records = 100
    # when
    factory1 = DeezerFactory(num_records, default_generation_config)
    streamings1 = factory1.create_streaming_history()

    factory2 = DeezerFactory(num_records, default_generation_config)
    streamings2 = factory2.create_streaming_history()
    # then
    assert len(streamings1) == len(streamings2)
    assert streamings1 == streamings2


def test_different_seeds_produce_different_results(default_generation_config):
    # given
    num_records = 50
    config1 = replace(default_generation_config, seed=123)
    config2 = replace(default_generation_config, seed=456)
    # when
    factory1 = DeezerFactory(num_records, config1)
    streamings1 = factory1.create_streaming_history()

    factory2 = DeezerFactory(num_records, config2)
    streamings2 = factory2.create_streaming_history()
    # then
    assert streamings1 != streamings2


@pytest.mark.parametrize("seed", [0, 1, 42, 999, 12345])
def test_various_seeds_work(seed, default_generation_config):
    # given
    config = replace(default_generation_config, seed=seed)
    # when
    factory = DeezerFactory(100, config)
    streamings = factory.create_streaming_history()
    # then
    assert len(streamings) == 100
