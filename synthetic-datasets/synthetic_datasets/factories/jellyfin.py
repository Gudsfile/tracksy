import uuid

from ..config import GenerationConfig
from ..models.base import BaseEvent
from ..models.jellyfin import JellyFinRecord
from .base import BaseFactory

NON_AUDIO_ITEM_TYPES = ["Movie", "Episode"]
CLIENT_NAMES = ["Jellyfin Web", "Jellyfin Android", "Jellyfin iOS", "Infuse", "Swiftfin"]


class JellyFinFactory(BaseFactory[JellyFinRecord]):
    def __init__(self, num_records: int, config: GenerationConfig) -> None:
        super().__init__(num_records, config)
        self.user_id = uuid.UUID(int=self.rng.getrandbits(128)).hex
        self._item_ids = [uuid.UUID(int=self.rng.getrandbits(128)).hex for _ in self._catalog]

    def _map_event(self, event: BaseEvent) -> JellyFinRecord:
        if self.rng.random() < 0.10:
            item_type = self.rng.choice(NON_AUDIO_ITEM_TYPES)
            item_name = self.faker.bs()
            play_duration = self.rng.randint(1800, 7200)
            item_id = uuid.UUID(int=self.rng.getrandbits(128)).hex
        else:
            track = self._catalog[event.track_index]
            item_type = "Audio"
            item_name = track.title
            play_duration = max(1, int(event.duration_ratio * track.duration_ms / 1000))
            item_id = self._item_ids[event.track_index]

        return JellyFinRecord(
            date_created=event.timestamp,
            user_id=self.user_id,
            item_id=item_id,
            item_type=item_type,
            item_name=item_name,
            playback_method="DirectPlay" if self.rng.random() < 0.70 else "Transcode",
            client_name=self.rng.choice(CLIENT_NAMES),
            device_name=self.faker.user_agent(),
            play_duration=play_duration,
        )
