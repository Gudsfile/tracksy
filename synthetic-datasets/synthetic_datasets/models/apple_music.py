from datetime import datetime

from pydantic import BaseModel, PastDatetime, field_serializer


class AppleMusicRecord(BaseModel):
    event_start_timestamp: PastDatetime
    song_name: str
    album_name: str
    media_type: str = "AUDIO"
    play_duration_ms: int
    device_type: str
    container_origin_type: str | None = None

    @field_serializer("event_start_timestamp")
    def serialize_event_start_timestamp(self, ts: datetime) -> str:
        return ts.strftime("%Y-%m-%dT%H:%M:%S.000Z")
