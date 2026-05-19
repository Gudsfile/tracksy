import calendar
import random
import uuid
from dataclasses import dataclass
from datetime import datetime, timedelta

import numpy as np
from faker import Faker
from tqdm import tqdm

from ..config import GenerationConfig
from ..models.funkwhale import FunkWhaleAlbum, FunkWhaleArtist, FunkWhaleListen, FunkWhaleTrack


@dataclass
class FunkWhaleCatalogTrack:
    track_id: int
    track_mbid: str
    title: str
    duration_sec: int
    artist_id: int
    artist_mbid: str
    artist_name: str
    album_id: int
    album_mbid: str
    album_title: str


class FunkWhaleFactory:
    month_weights = [0.08, 0.07, 0.07, 0.06, 0.07, 0.08, 0.08, 0.08, 0.1, 0.10, 0.11, 0.1]
    hour_weights = [
        0.01, 0.01, 0.01, 0.01, 0.02, 0.04, 0.07, 0.09, 0.08, 0.06, 0.04, 0.04,
        0.05, 0.03, 0.04, 0.05, 0.05, 0.06, 0.07, 0.06, 0.05, 0.03, 0.02, 0.01,
    ]  # fmt: skip

    def __init__(self, num_records: int, config: GenerationConfig):
        self.config = config

        random.seed(self.config.seed)
        np.random.seed(self.config.seed)
        Faker.seed(self.config.seed)

        self.faker = Faker()
        self.now = self.config.reference_date
        self.start_year = 2020
        self.skip_chance_trend = np.linspace(0.15, 0.30, self.now.year - self.start_year + 1)

        num_artists = max(int(num_records * 0.2), 1)
        num_albums = max(int(num_records * 0.3), 1)
        num_tracks = max(int(num_records * 0.5), 1)

        print("🎵 Generating FunkWhale music catalog...")
        print(f" - records: {num_records}")
        print(f" - artists: {num_artists}")
        print(f" - albums : {num_albums}")
        print(f" - tracks : {num_tracks}")
        self.tracks = self._generate_catalog(num_artists, num_albums, num_tracks)

        print("📈 Generating evolving listening tastes...")
        self.weighted_tracks = self._generate_weighted_tracks_by_year()

        print("📅 Generating distribution over year...")
        self.records_per_year = self._generate_distribution_over_year(num_records)

    def _generate_catalog(
        self, num_artists: int, num_albums: int, num_tracks: int
    ) -> list[FunkWhaleCatalogTrack]:
        artists = [
            (i + 1, str(uuid.UUID(int=random.getrandbits(128))), self.faker.name())
            for i in range(num_artists)
        ]
        albums = [
            (i + 1, str(uuid.UUID(int=random.getrandbits(128))), " ".join(self.faker.words(3)).title(), random.choice(artists))
            for i in range(num_albums)
        ]
        tracks = []
        for i in range(num_tracks):
            album = random.choice(albums)
            album_id, album_mbid, album_title, (artist_id, artist_mbid, artist_name) = album
            tracks.append(
                FunkWhaleCatalogTrack(
                    track_id=i + 1,
                    track_mbid=str(uuid.UUID(int=random.getrandbits(128))),
                    title=" ".join(self.faker.words(4)).title(),
                    duration_sec=random.randint(120, 360),
                    artist_id=artist_id,
                    artist_mbid=artist_mbid,
                    artist_name=artist_name,
                    album_id=album_id,
                    album_mbid=album_mbid,
                    album_title=album_title,
                )
            )
        return tracks

    def _generate_weighted_tracks_by_year(self) -> dict[int, list[FunkWhaleCatalogTrack]]:
        weighted_tracks_by_year = {}
        for year in range(self.start_year, self.now.year + 1):
            popularity = np.random.zipf(a=1.8, size=len(self.tracks))
            np.random.shuffle(popularity)
            weighted = []
            for track, weight in zip(self.tracks, popularity):
                repeats = min(int(weight / 10), 100)
                weighted.extend([track] * max(repeats, 1))
            weighted_tracks_by_year[year] = weighted
        return weighted_tracks_by_year

    def _get_random_datetime_for_year(self, year: int) -> datetime:
        if year < self.now.year:
            months = np.arange(1, 13)
            month_weights = np.array(self.month_weights)
        else:
            months = np.arange(1, self.now.month + 1)
            month_weights = np.array(self.month_weights[: self.now.month])

        month_weights = month_weights / month_weights.sum()
        month = np.random.choice(months, p=month_weights)
        max_day = calendar.monthrange(year, month)[1]
        day = random.randint(1, max_day)
        hour_weights = np.array(self.hour_weights)
        hour_weights = hour_weights / hour_weights.sum()
        hour = np.random.choice(range(24), p=hour_weights)
        minute = random.randint(0, 59)
        second = random.randint(0, 59)
        candidate = datetime(year, month, day, hour, minute, second)
        if candidate > self.now:
            start = datetime(year, 1, 1)
            delta_seconds = int((self.now - start).total_seconds())
            return start + timedelta(seconds=random.randint(0, delta_seconds))
        return candidate

    def _generate_distribution_over_year(self, n_records: int) -> dict[int, int]:
        years = range(self.start_year, self.now.year + 1)
        year_weights = [random.uniform(0.5, 1.5) for _ in years]
        base_records_per_year = n_records / sum(year_weights)
        records_per_year = {
            year: int(base_records_per_year * weight)
            for year, weight in zip(years, year_weights)
        }
        records_per_year[self.now.year] += n_records - sum(records_per_year.values())
        return records_per_year

    def _create_one_listen(self, listen_id: int, ts: datetime) -> FunkWhaleListen:
        year_index = ts.year - self.start_year
        is_skipped = random.random() < self.skip_chance_trend[year_index]
        track = random.choice(self.weighted_tracks[ts.year])
        duration = (
            random.randint(1, 29) if is_skipped
            else random.randint(int(track.duration_sec * 0.95), track.duration_sec)
        )
        return FunkWhaleListen(
            id=listen_id,
            creation_date=ts,
            track=FunkWhaleTrack(
                id=track.track_id,
                title=track.title,
                mbid=track.track_mbid,
                duration=duration,
                artist=FunkWhaleArtist(
                    id=track.artist_id,
                    name=track.artist_name,
                    mbid=track.artist_mbid,
                ),
                album=FunkWhaleAlbum(
                    id=track.album_id,
                    title=track.album_title,
                    mbid=track.album_mbid,
                ),
            ),
        )

    def create_streaming_history(self) -> list[FunkWhaleListen]:
        all_listens = []
        listen_id = 1
        for year, num_records_for_year in self.records_per_year.items():
            year_records = [
                self._create_one_listen(listen_id + i, self._get_random_datetime_for_year(year))
                for i in tqdm(range(num_records_for_year), desc=f"💿 Generating FunkWhale listens for {year}", leave=True)
            ]
            listen_id += num_records_for_year
            all_listens.extend(year_records)
        return all_listens
