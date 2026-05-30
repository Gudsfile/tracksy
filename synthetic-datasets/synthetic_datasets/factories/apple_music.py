from ..config import GenerationConfig
from ..models.apple_music import AppleMusicRecord
from ..models.base import BaseEvent
from .base import BaseFactory

CLIENT_PLATFORMS = ["FUSE", "TILT"]


class AppleMusicFactory(BaseFactory[AppleMusicRecord]):
    def __init__(self, num_records: int, config: GenerationConfig) -> None:
        super().__init__(num_records, config)

    def _map_event(self, event: BaseEvent) -> AppleMusicRecord:
        base = self._catalog[event.track_index]
        return AppleMusicRecord(
            event_start_timestamp=event.timestamp,
            song_name=base.title,
            media_type="AUDIO",
            play_duration_ms=int(base.duration_ms * event.duration_ratio),
            client_platform=self.rng.choice(CLIENT_PLATFORMS),
        )
