from datetime import datetime, timedelta

from pydantic import BaseModel, PastDatetime, field_serializer


class AppleMusicRecord(BaseModel):
    # Local listening time; Apple exports it as UTC alongside "UTC Offset In Seconds".
    event_start_timestamp: PastDatetime
    song_name: str
    album_name: str
    media_type: str = "AUDIO"
    play_duration_ms: int
    device_type: str
    container_origin_type: str | None = None
    utc_offset_seconds: int | None = None

    @field_serializer("event_start_timestamp")
    def serialize_event_start_timestamp(self, ts: datetime) -> str:
        utc = ts - timedelta(seconds=self.utc_offset_seconds or 0)
        return utc.strftime("%Y-%m-%dT%H:%M:%S.000Z")
