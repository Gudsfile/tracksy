from datetime import datetime

import pytest

from synthetic_datasets.models.custom import CustomStreaming


@pytest.fixture
def record():
    return CustomStreaming(
        ts=datetime.fromisoformat("2024-03-15T14:30:00"),
        track_name="NeS - Post-it",
        artist_name="Veridis Project",
        album_name="Veridis Remix",
        ms_played=213000,
        track_uri="custom:veridis-project:nes-post-it",
        platform="web",
    )


def test_valid_construction(record):
    assert record.track_name == "NeS - Post-it"
    assert record.artist_name == "Veridis Project"
    assert record.album_name == "Veridis Remix"
    assert record.ms_played == 213000
    assert record.track_uri == "custom:veridis-project:nes-post-it"
    assert record.platform == "web"


def test_ts_serialization_z_suffix(record):
    serialized = record.serialize_ts(record.ts)
    assert serialized == "2024-03-15T14:30:00Z"


def test_ts_serialization_format(record):
    serialized = record.serialize_ts(record.ts)
    assert serialized.endswith("Z")
    datetime.strptime(serialized, "%Y-%m-%dT%H:%M:%SZ")


def test_ms_played_is_int(record):
    assert isinstance(record.ms_played, int)
