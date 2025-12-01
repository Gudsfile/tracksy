from datetime import datetime
from ipaddress import IPv4Address

import pytest

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
