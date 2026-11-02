import random
from datetime import date, timedelta
from typing import ClassVar
from zoneinfo import ZoneInfo

from ..config import GenerationConfig
from ..models.apple_music import AppleMusicRecord
from ..models.base import BaseEvent
from .base import BaseFactory


class AppleMusicFactory(BaseFactory[AppleMusicRecord]):
    DEVICE_TYPES: ClassVar[list[str]] = ["IPHONE", "MACINTOSH", "HOMEPOD"]
    HOME_TIMEZONE: ClassVar[ZoneInfo] = ZoneInfo("Europe/Paris")
    TRAVEL_TIMEZONES: ClassVar[list[ZoneInfo]] = [
        ZoneInfo("America/New_York"),
        ZoneInfo("America/Los_Angeles"),
        ZoneInfo("Asia/Kolkata"),
        ZoneInfo("Asia/Tokyo"),
    ]
    TRIP_START_CHANCE: ClassVar[float] = 0.01
    TRIP_MIN_DAYS: ClassVar[int] = 3
    TRIP_MAX_DAYS: ClassVar[int] = 14
    MISSING_OFFSET_CHANCE: ClassVar[float] = 0.02

    def __init__(self, num_records: int, config: GenerationConfig) -> None:
        super().__init__(num_records, config)
        # Dedicated RNG: offsets must not shift the draws of the shared generators.
        self._offset_rng = random.Random(f"{config.seed}:apple-music-offsets")
        self.trip_timezones = self._plan_trips()

    def _plan_trips(self) -> dict[date, ZoneInfo]:
        """Travel stretches of consecutive days spent in another timezone."""
        if not self._chapters:
            return {}
        day, last_day = self._chapter_bounds(self._chapters[0])[0], self.now.date()
        trips: dict[date, ZoneInfo] = {}
        while day <= last_day:
            if self._offset_rng.random() < self.TRIP_START_CHANCE:
                zone = self._offset_rng.choice(self.TRAVEL_TIMEZONES)
                length = self._offset_rng.randint(self.TRIP_MIN_DAYS, self.TRIP_MAX_DAYS)
                for _ in range(length):
                    trips[day] = zone
                    day += timedelta(days=1)
            day += timedelta(days=1)
        return trips

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
        if self._offset_rng.random() < self.MISSING_OFFSET_CHANCE:
            return None
        zone = self.trip_timezones.get(event.timestamp.date(), self.HOME_TIMEZONE)
        offset = event.timestamp.replace(tzinfo=zone).utcoffset()
        return None if offset is None else int(offset.total_seconds())
