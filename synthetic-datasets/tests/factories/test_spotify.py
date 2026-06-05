import pytest

from synthetic_datasets.factories.spotify import SpotifyFactory
from synthetic_datasets.models.spotify import Streaming


@pytest.mark.parametrize("num_records", range(0, 100, 3))
def test_create_streaming_history(num_records, default_generation_config):
    # given
    factory = SpotifyFactory(num_records=num_records, config=default_generation_config)
    # when
    streamings = factory.create_streaming_history()
    # then
    assert len(streamings) == num_records
    for streaming in streamings:
        assert isinstance(streaming, Streaming)


def test_shuffle_read_from_event(default_generation_config):
    factory = SpotifyFactory(num_records=100, config=default_generation_config)
    streamings = factory.create_streaming_history()
    assert any(s.shuffle for s in streamings)
    assert any(not s.shuffle for s in streamings)


def test_shuffle_deterministic_from_seed(default_generation_config):
    f1 = SpotifyFactory(num_records=50, config=default_generation_config)
    r1 = f1.create_streaming_history()
    f2 = SpotifyFactory(num_records=50, config=default_generation_config)
    r2 = f2.create_streaming_history()
    assert [s.shuffle for s in r1] == [s.shuffle for s in r2]
