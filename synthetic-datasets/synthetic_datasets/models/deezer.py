from datetime import datetime

from pydantic import BaseModel, Field, IPvAnyAddress, PastDatetime, field_serializer


class DeezerListeningHistoryRecord(BaseModel):
    """
    Model for Deezer listening history from Excel export.

    Sheet name: "10_listeningHistory"
    Field names match Deezer's export format exactly.
    """

    # Track information
    song_title: str = Field(description="Title of the song")
    artist: str = Field(description="Artist name")
    isrc: str = Field(description="International Standard Recording Code", pattern="^[A-Z]{2}[A-Z0-9]{3}[0-9]{7}$")
    album_title: str = Field(description="Album title")

    # Network information
    ip_address: IPvAnyAddress = Field(description="IP address where played")  # ty: ignore[invalid-type-form]

    # Playback information
    listening_time: int = Field(ge=0, description="Duration listened in seconds")
    platform_name: str = Field(description="Platform used (web, android, ios, etc.)")
    platform_model: str = Field(default="", description="Device model, often empty")

    # Temporal data
    date: PastDatetime = Field(description="Date and time when played")

    @field_serializer("date")
    def serialize_date(self, date: datetime):
        """Serialize date to YYYY-MM-DD HH:MM:SS format"""
        return date.strftime("%Y-%m-%d %H:%M:%S")

    @field_serializer("ip_address")
    def serialize_ip(self, ip: IPvAnyAddress):
        """Serialize IP address to string"""
        return str(ip)


class DeezerTrack(BaseModel):
    """Simplified track model for Deezer"""

    song_title: str
    artist: str
    isrc: str
    album_title: str
    duration_seconds: int
