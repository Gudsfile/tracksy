from datetime import datetime
from ipaddress import IPv4Address

import pytest

from synthetic_datasets.models.deezer import DeezerStreaming


@pytest.fixture
def deezer_streaming_record():
    return DeezerStreaming(
        song_title="Never Gonna Give You Up",
        artist="Rick Astley",
        isrc="GBAYE8800243",
        album_title="Whenever You Need Somebody",
        ip_address=IPv4Address("127.0.0.1"),
        listening_time=213,
        platform_name="web",
        platform_model="",
        date=datetime.fromisoformat("2020-08-07T11:48:23"),
    )


def test_valid_construction(deezer_streaming_record):
    assert deezer_streaming_record.song_title == "Never Gonna Give You Up"
    assert deezer_streaming_record.artist == "Rick Astley"
    assert deezer_streaming_record.isrc == "GBAYE8800243"
    assert deezer_streaming_record.listening_time == 213
    assert deezer_streaming_record.platform_model == ""


def test_date_serialization_format(deezer_streaming_record):
    serialized = deezer_streaming_record.serialize_date(deezer_streaming_record.date)
    assert serialized == "2020-08-07 11:48:23"


def test_ip_address_serialization(deezer_streaming_record):
    serialized = deezer_streaming_record.serialize_ip_address(deezer_streaming_record.ip_address)
    assert serialized == "127.0.0.1"


def test_listening_time_is_int(deezer_streaming_record):
    assert isinstance(deezer_streaming_record.listening_time, int)
