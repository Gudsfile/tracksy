from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field, PastDatetime, field_serializer


class EndReasonTypeEnum(str, Enum):
    """
    Possible end reason types from Apple Music Play Activity.
    Based on observed Apple Music exports.
    """

    MANUALLY_SELECTED_PLAYBACK_OF_A_DIFF_ITEM = "MANUALLY_SELECTED_PLAYBACK_OF_A_DIFF_ITEM"
    NATURAL_END_OF_TRACK = "NATURAL_END_OF_TRACK"
    PLAYBACK_MANUALLY_PAUSED = "PLAYBACK_MANUALLY_PAUSED"
    SCRUB_BEGIN = "SCRUB_BEGIN"
    DEVICE_DISCONNECTED = "DEVICE_DISCONNECTED"
    UNKNOWN = "UNKNOWN"


class SourceTypeEnum(str, Enum):
    """
    Possible source types from Apple Music Play Activity.
    """

    MACINTOSH = "MACINTOSH"
    IPHONE = "IPHONE"
    IPAD = "IPAD"
    APPLE_WATCH = "APPLE_WATCH"
    APPLE_TV = "APPLE_TV"
    WINDOWS = "WINDOWS"
    UNKNOWN = "UNKNOWN"


class MediaTypeEnum(str, Enum):
    """Media type classification"""

    AUDIO = "AUDIO"
    NA = "N/A"


class AppleMusicPlayHistoryRecord(BaseModel):
    """
    Model for Apple Music - Play History Daily Tracks.csv

    Field names match Apple's export format exactly.
    """

    # Basic identification
    country: str = Field(pattern="[A-Z]{2}")
    track_identifier: int | None = Field(default=None, description="Apple Music track ID, 0 or null for unknown tracks")
    media_type: str = Field(default="N/A", description="Media type, usually N/A")

    # Temporal data
    date_played: PastDatetime = Field(description="Date when track was played")
    hours: int = Field(ge=0, le=23, description="Hour of day when played (0-23)")
    play_duration_milliseconds: int = Field(ge=0, description="Duration played in milliseconds")

    # Playback metadata
    end_reason_type: EndReasonTypeEnum
    source_type: SourceTypeEnum
    play_count: int = Field(ge=0, description="Number of times played")
    skip_count: int = Field(ge=0, description="Number of times skipped")

    # Additional fields
    ignore_for_recommendations: str = Field(default="", description="Usually empty")
    track_reference: str = Field(default="N/A")
    track_description: str = Field(description="Format: Artist - Track Name")

    @field_serializer("date_played")
    def serialize_date_played(self, date_played: datetime):
        """Serialize date to YYYYMMDD format"""
        return date_played.strftime("%Y%m%d")

    @field_serializer("media_type")
    def serialize_media_type(self, media_type: str):
        return media_type

    @field_serializer("end_reason_type")
    def serialize_end_reason(self, end_reason: EndReasonTypeEnum):
        return end_reason.value

    @field_serializer("source_type")
    def serialize_source(self, source: SourceTypeEnum):
        return source.value


class AppleMusicTrack(BaseModel):
    """Simplified track model for Apple Music"""

    track_id: int
    name: str
    artist: str
    duration_ms: int
