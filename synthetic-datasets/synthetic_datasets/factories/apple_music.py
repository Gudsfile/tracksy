from typing import ClassVar
from zoneinfo import ZoneInfo

from ..models.apple_music import AppleMusicRecord
from ..models.base import BaseEvent
from .base import BaseFactory


class AppleMusicFactory(BaseFactory[AppleMusicRecord]):
    DEVICE_TYPES: ClassVar[list[str]] = ["IPHONE", "MACINTOSH", "HOMEPOD"]
    HOME_TIMEZONE: ClassVar[ZoneInfo] = ZoneInfo("Europe/Paris")

    def _map_event(self, event: BaseEvent) -> AppleMusicRecord:
        base = self._catalog[event.track_index]
        return AppleMusicRecord(
            event_start_timestamp=event.timestamp,
            song_name=base.title,
            album_name=base.album,
            media_type="AUDIO",
            play_duration_ms=int(base.duration_ms * event.duration_ratio),
            device_type=self.rng.choice(self.DEVICE_TYPES),
            container_origin_type="STREAM_RADIO_STATION" if self.rng.random() < 0.05 else None,
            utc_offset_seconds=self._utc_offset_seconds(event),
        )

    def _utc_offset_seconds(self, event: BaseEvent) -> int | None:
        offset = event.timestamp.replace(tzinfo=self.HOME_TIMEZONE).utcoffset()
        return None if offset is None else int(offset.total_seconds())
