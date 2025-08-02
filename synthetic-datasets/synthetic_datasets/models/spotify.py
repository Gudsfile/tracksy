from datetime import datetime
from enum import Enum

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


class ReasonStartEnum(str, Enum):
    APP_LOAD = "appload"
    BACK_BUTTON = "backbtn"
    CLICK_ROW = "clickrow"
    CLICK_ROW_2 = "click-row"
    FORWARD_BUTTON = "fwdbtn"
    PERSISTED = "persisted"
    PLAY_BUTTON = "playbtn"
    REMOTE = "remote"
    TRACK_DONE = "trackdone"
    TRACK_ERROR = "trackerror"
    UNKNOWN = "unknown"
    NONE = None


class ReasonEndEnum(str, Enum):
    BACK_BUTTON = "backbtn"
    CLICK_ROW = "clickrow"
    CLICK_ROW_2 = "click-row"
    END_PLAY = "endplay"
    FORWARD_BUTTON = "fwdbtn"
    LOGOUT = "logout"
    PLAY_BUTTON = "playbtn"
    REMOTE = "remote"
    TRACK_DONE = "trackdone"
    TRACK_ERROR = "trackerror"
    UNEXPECTED_EXIT = "unexpected-exit"
    UNEXPECTED_EXIT_WHILE_PAUSED = "unexpected-exit-while-paused"
    UNKNOWN = "unknown"
    NONE = None


class Streaming(BaseModel):
    ts: PastDatetime  # should be ISO8601
    platform: str
    ms_played: int
    conn_country: str = Field(pattern="[A-Z]{2}")
    ip_addr: IPvAnyAddress  # ty: ignore[invalid-type-form]
    master_metadata_track_name: str
    master_metadata_album_artist_name: str
    master_metadata_album_album_name: str
    spotify_track_uri: str = Field(pattern=f"{DEFAULT_TRACK_URI_SUFFIX}[a-zA-Z0-9]{{{DEFAULT_TRACK_ID_SIZE}}}")
    episode_name: str | None = None
    episode_show_name: str | None = None
    spotify_episode_uri: str | None = None
    audiobook_title: str | None = None
    audiobook_uri: str | None = None
    audiobook_chapter_uri: str | None = None
    audiobook_chapter_title: str | None = None
    reason_start: ReasonStartEnum
    reason_end: ReasonEndEnum
    shuffle: bool
    skipped: bool
    offline: bool
    offline_timestamp: int | None = None
    incognito_mode: bool

    @field_serializer("ts")
    def serialize_ts(self, ts: datetime):
        return ts.strftime("%Y-%m-%dT%H:%M:%SZ")

    @model_validator(mode="after")
    def validate_reason_end(self):
        skipped_reason_ends = [ReasonEndEnum.BACK_BUTTON, ReasonEndEnum.FORWARD_BUTTON]

        if self.skipped and self.reason_end not in skipped_reason_ends:
            raise ValueError(
                f"The end reason must be `backbtn` or `fwdbtn` if streaming is skipped: reason_end: `{self.reason_end.value}`"
            )

        if not self.skipped and self.reason_end in skipped_reason_ends:
            raise ValueError(
                f"The end reason must not be `backbtn` or `fwdbtn` if streaming is not skipped: reason_end: `{self.reason_end.value}`"
            )

        return self
