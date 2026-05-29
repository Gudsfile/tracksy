import random
from dataclasses import dataclass
from datetime import datetime

from ..config import GenerationConfig
from ..models.apple_music import AppleMusicRecord
from .base import BaseFactory


@dataclass
class AppleMusicTrack:
    song_name: str
    duration_ms: int


CLIENT_PLATFORMS = ["FUSE", "TILT"]


class AppleMusicFactory(BaseFactory[AppleMusicRecord]):
    def __init__(self, num_records: int, config: GenerationConfig) -> None:
        super().__init__(num_records, config)

    def _generate_catalog(self, num_records: int) -> list[AppleMusicTrack]:
        num_tracks = max(int(num_records * 0.5), 1)
        print(f" - records: {num_records}")
        print(f" - tracks : {num_tracks}")
        return [
            AppleMusicTrack(
                song_name=" ".join(self.faker.words(4)).title(),
                duration_ms=random.randint(self.TRACK_DURATION_MIN_MS, self.TRACK_DURATION_MAX_MS),
            )
            for _ in range(num_tracks)
        ]

    def _create_one_record(self, ts: datetime) -> AppleMusicRecord:
        year_index = ts.year - self.start_year
        is_skipped = random.random() < self.skip_chance_trend[year_index]

        track = random.choice(self.weighted_tracks[ts.year])
        play_duration_ms = random.randint(1_000, 29_000) if is_skipped else random.randint(30_000, track.duration_ms)

        client_platform = random.choice(CLIENT_PLATFORMS)

        return AppleMusicRecord(
            event_start_timestamp=ts,
            song_name=track.song_name,
            media_type="AUDIO",
            play_duration_ms=play_duration_ms,
            client_platform=client_platform,
        )
