from datetime import datetime

from synthetic_datasets.models.base import BaseEvent, BaseTrack


def test_base_track_fields():
    track = BaseTrack(title="Song", artist="Artist", album="Album", duration_ms=180_000)
    assert track.title == "Song"
    assert track.artist == "Artist"
    assert track.album == "Album"
    assert track.duration_ms == 180_000


def test_base_event_fields():
    ts = datetime(2024, 1, 1, 12, 0, 0)
    event = BaseEvent(timestamp=ts, track_index=3, is_skipped=False, duration_ratio=0.95)
    assert event.timestamp == ts
    assert event.track_index == 3
    assert event.is_skipped is False
    assert event.duration_ratio == 0.95
    assert event.shuffle is False


def test_base_event_shuffle_field():
    ts = datetime(2024, 1, 1, 12, 0, 0)
    event = BaseEvent(timestamp=ts, track_index=0, is_skipped=True, duration_ratio=0.1, shuffle=True)
    assert event.shuffle is True


def test_base_track_is_dataclass():
    import dataclasses

    assert dataclasses.is_dataclass(BaseTrack)
    assert dataclasses.is_dataclass(BaseEvent)
