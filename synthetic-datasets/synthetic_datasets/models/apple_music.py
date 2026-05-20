from datetime import datetime

from pydantic import BaseModel, PastDatetime, field_serializer


class AppleMusicRecord(BaseModel):
    event_start_timestamp: PastDatetime
    song_name: str
    media_type: str = "AUDIO"
    play_duration_ms: int  # milliseconds; always >= 0
    client_platform: str  # e.g. "FUSE", "TILT"

    @field_serializer("event_start_timestamp")
    def serialize_event_start_timestamp(self, ts: datetime) -> str:
        return ts.strftime("%Y-%m-%dT%H:%M:%S.000Z")
