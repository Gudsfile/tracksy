import pytest

from synthetic_datasets.factories.spotify import SpotifyFactory, rotate
from synthetic_datasets.models.spotify import Streaming


@pytest.mark.parametrize("num_records", range(0, 100, 3))
def test_create_streaming_history(num_records):
    # given
    factory = SpotifyFactory(num_records=num_records)
    # when
    streamings = factory.create_streaming_history()
    # then
    assert len(streamings) == num_records
    for streaming in streamings:
        assert isinstance(streaming, Streaming)


@pytest.mark.parametrize(
    "input, step, expected",
    [
        ([1, 2, 3], -2, [2, 3, 1]),
        ([1, 2, 3], -1, [3, 1, 2]),
        ([1, 2, 3], 0, [1, 2, 3]),
        ([1, 2, 3], 1, [2, 3, 1]),
        ([1, 2, 3], 2, [3, 1, 2]),
        ([1, 2, 3], 3, [1, 2, 3]),
        ([1, 2, 3], 4, [2, 3, 1]),
        ([1, 2, 3], 5, [3, 1, 2]),
        ([1, 2, 3, 4, 5], 6, [2, 3, 4, 5, 1]),
    ],
)
def test_rotate(input, step, expected):
    # when
    result = rotate(input, step)
    # then
    assert result == expected
