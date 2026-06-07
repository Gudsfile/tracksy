from datetime import datetime

from pydantic import BaseModel, PastDatetime, field_serializer


class JellyFinRecord(BaseModel):
    date_created: PastDatetime
    user_id: str  # UUID hex
    item_id: str  # UUID hex
    item_type: str = "Audio"
    item_name: str
    playback_method: str
    client_name: str
    device_name: str
    play_duration: int  # seconds

    @field_serializer("date_created")
    def serialize_date_created(self, date_created: datetime) -> str:
        return date_created.strftime("%Y-%m-%d %H:%M:%S")
