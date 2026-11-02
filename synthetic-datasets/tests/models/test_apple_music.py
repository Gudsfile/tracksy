from datetime import datetime

import pytest

from synthetic_datasets.models.apple_music import AppleMusicRecord


def _record(utc_offset_seconds: int | None) -> AppleMusicRecord:
    return AppleMusicRecord(
        event_start_timestamp=datetime.fromisoformat("2020-08-07T11:48:23"),
        song_name="Never Gonna Give You Up",
        album_name="Whenever You Need Somebody",
        play_duration_ms=213_000,
        device_type="IPHONE",
        utc_offset_seconds=utc_offset_seconds,
    )


@pytest.mark.parametrize(
    ("utc_offset_seconds", "expected"),
    [
        (7200, "2020-08-07T09:48:23.000Z"),
        (-7200, "2020-08-07T13:48:23.000Z"),
        (19800, "2020-08-07T06:18:23.000Z"),
        (None, "2020-08-07T11:48:23.000Z"),
    ],
)
def test_event_start_timestamp_is_serialized_as_utc(utc_offset_seconds, expected):
    # given a local listening time and its offset
    record = _record(utc_offset_seconds)
    # when
    serialized = record.serialize_event_start_timestamp(record.event_start_timestamp)
    # then UTC = local - offset
    assert serialized == expected


def test_utc_offset_defaults_to_none():
    record = AppleMusicRecord(
        event_start_timestamp=datetime.fromisoformat("2020-08-07T11:48:23"),
        song_name="Song",
        album_name="Album",
        play_duration_ms=1,
        device_type="IPHONE",
    )
    assert record.utc_offset_seconds is None
