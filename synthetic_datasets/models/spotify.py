from datetime import datetime

from pydantic import BaseModel, Field, IPvAnyAddress, PastDatetime, field_serializer

DEFAULT_TRACK_ID_SIZE = 22
DEFAULT_TRACK_URI_SUFFIX = "spotify:track:"


class User(BaseModel):
    name: str
    platforms: list[str]


class Artist(BaseModel):
    name: str


class Album(BaseModel):
    name: str
    artist: Artist


class Track(BaseModel):
    uri: str
    name: str
    album: Album


class Streaming(BaseModel):
    ts: PastDatetime  # should be ISO8601
    username: str
    platform: str
    ms_played: int
    conn_country: str = Field(pattern="[A-Z]{2}")
    ip_addr_decrypted: IPvAnyAddress
    user_agent_decrypted: str
    master_metadata_track_name: str
    master_metadata_album_artist_name: str
    master_metadata_album_album_name: str
    spotify_track_uri: str = Field(pattern=f"{DEFAULT_TRACK_URI_SUFFIX}[a-z0-9]{{{DEFAULT_TRACK_ID_SIZE}}}")
    episode_name: str | None
    episode_show_name: str | None
    spotify_episode_uri: str | None
    reason_start: str | None
    reason_end: str | None
    shuffle: bool
    skipped: bool
    offline: bool
    offline_timestamp: str | None
    incognito_mode: bool

    @field_serializer("ts")
    def format_ts(cls, ts: datetime):
        return cls.strftime("%Y-%m-%dT%H:%M:%SZ")
