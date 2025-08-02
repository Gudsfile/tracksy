from datetime import datetime

from pydantic import BaseModel, Field, IPvAnyAddress, PastDatetime, field_serializer, model_validator

DEFAULT_TRACK_ID_SIZE = 22
DEFAULT_TRACK_URI_SUFFIX = "spotify:track:"


class Artist(BaseModel):
    name: str


class Album(BaseModel):
    name: str
    artist: Artist


class Track(BaseModel):
    uri: str
    name: str
    album: Album
    duration_ms: int


class Streaming(BaseModel):
    ts: PastDatetime  # should be ISO8601
    platform: str
    ms_played: int
    conn_country: str = Field(pattern="[A-Z]{2}")
    ip_addr_decrypted: IPvAnyAddress # ty: ignore[invalid-type-form]
    user_agent_decrypted: str
    master_metadata_track_name: str
    master_metadata_album_artist_name: str
    master_metadata_album_album_name: str
    spotify_track_uri: str = Field(pattern=f"{DEFAULT_TRACK_URI_SUFFIX}[a-zA-Z0-9]{{{DEFAULT_TRACK_ID_SIZE}}}")
    episode_name: str | None = None
    episode_show_name: str | None = None
    spotify_episode_uri: str | None = None
    reason_start: str
    reason_end: str
    shuffle: bool
    skipped: bool
    offline: bool
    offline_timestamp: int | None = None
    incognito_mode: bool

    @field_serializer("ts")
    def serialize_ts(self, ts: datetime):
        return ts.strftime("%Y-%m-%dT%H:%M:%SZ")

    @model_validator(mode="after")
    def set_skipped_and_reason(self):
        if self.skipped is None:
            self.skipped = self.ms_played < 30000

        if self.skipped and self.reason_end not in ["fwdbtn", "backbtn"]:
            self.reason_end = "fwdbtn"
        elif not self.skipped and self.reason_end not in ["trackdone"]:
            self.reason_end = "trackdone"

        return self
