import pytest

from synthetic_datasets.models.spotify import ReasonEndEnum, ReasonStartEnum, Streaming

BASE_STREAMING = {
    "ts": "2020-08-07T11:48:23Z",
    "platform": "Android",
    "ms_played": 213_000,
    "conn_country": "SE",
    "ip_addr": "127.0.0.1",
    "master_metadata_track_name": "Never Gonna Give You Up",
    "master_metadata_album_artist_name": "Rick Astley",
    "master_metadata_album_album_name": "Whenever You Need Somebody",
    "spotify_track_uri": "spotify:track:4PTG3Z6ehGkBFwjybzWkR8",
    "reason_start": ReasonStartEnum.NONE,
    "reason_end": ReasonEndEnum.NONE,
    "shuffle": False,
    "skipped": False,
    "offline": False,
    "incognito_mode": False,
}


@pytest.mark.parametrize("skipped, reason_end",[
        (True, ReasonEndEnum.BACK_BUTTON),
        (True, ReasonEndEnum.FORWARD_BUTTON),
        (False, ReasonEndEnum.TRACK_DONE),
        (False, ReasonEndEnum.REMOTE),
])  # fmt: skip
def test_valid_reason_end(skipped, reason_end):
    data = BASE_STREAMING.copy()
    data["skipped"] = skipped
    data["reason_end"] = reason_end
    streaming = Streaming(**data)  # ty: ignore[missing-argument] # https://github.com/astral-sh/ty/issues/247
    assert streaming.reason_end == reason_end


@pytest.mark.parametrize("skipped, reason_end, error_msg", [
    (True, ReasonEndEnum.TRACK_DONE, "The end reason must be `backbtn` or `fwdbtn` if streaming is skipped: reason_end: `{reason_end}`"),
    (True, ReasonEndEnum.REMOTE, "The end reason must be `backbtn` or `fwdbtn` if streaming is skipped: reason_end: `{reason_end}`"),
    (False, ReasonEndEnum.BACK_BUTTON, "The end reason must not be `backbtn` or `fwdbtn` if streaming is not skipped: reason_end: `{reason_end}`"),
    (False, ReasonEndEnum.FORWARD_BUTTON, "The end reason must not be `backbtn` or `fwdbtn` if streaming is not skipped: reason_end: `{reason_end}`"),
])  # fmt: skip
def test_invalid_reason_end(skipped, reason_end, error_msg):
    data = BASE_STREAMING.copy()
    data["skipped"] = skipped
    data["reason_end"] = reason_end
    with pytest.raises(ValueError) as err:
        Streaming(**data)  # ty: ignore[missing-argument] # https://github.com/astral-sh/ty/issues/247
    assert error_msg.replace("{reason_end}", reason_end.value) in str(err.value)
