from datetime import datetime
from ipaddress import IPv4Address

import pytest

from synthetic_datasets.config import GenerationConfig
from synthetic_datasets.models.deezer import DeezerStreaming
from synthetic_datasets.models.funkwhale import FunkWhaleAlbum, FunkWhaleArtist, FunkWhaleListen, FunkWhaleTrack
from synthetic_datasets.models.spotify import ReasonEndEnum, ReasonStartEnum, Streaming


@pytest.fixture
def streaming_record():
    return Streaming(
        ts=datetime.fromisoformat("2020-08-07T11:48:23Z"),
        platform="Android",
        ms_played=213_000,
        conn_country="SE",
        ip_addr=IPv4Address("127.0.0.1"),
        master_metadata_track_name="Never Gonna Give You Up",
        master_metadata_album_artist_name="Rick Astley",
        master_metadata_album_album_name="Whenever You Need Somebody",
        spotify_track_uri="spotify:track:4PTG3Z6ehGkBFwjybzWkR8",
        reason_start=ReasonStartEnum.NONE,
        reason_end=ReasonEndEnum.NONE,
        shuffle=False,
        skipped=False,
        offline=False,
        incognito_mode=False,
    )


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


@pytest.fixture
def funkwhale_listen_record():
    return FunkWhaleListen(
        id=1,
        creation_date=datetime.fromisoformat("2024-03-15T14:30:00"),
        track=FunkWhaleTrack(
            id=456,
            title="Never Gonna Give You Up",
            mbid="a1b2c3d4-e5f6-7890-abcd-ef1234567890",
            duration=213,
            artist=FunkWhaleArtist(
                id=1,
                name="Rick Astley",
                mbid="b1c2d3e4-f5a6-7890-abcd-ef1234567890",
            ),
            album=FunkWhaleAlbum(
                id=1,
                title="Whenever You Need Somebody",
                mbid="c1d2e3f4-a5b6-7890-abcd-ef1234567890",
            ),
        ),
    )


@pytest.fixture
def default_generation_config():
    return GenerationConfig(seed=42, reference_date=datetime(2026, 2, 8))
