import calendar
import random
from abc import ABC, abstractmethod
from datetime import datetime, timedelta
from typing import ClassVar, Generic, TypeVar

import numpy as np
from faker import Faker
from tqdm import tqdm

from ..config import GenerationConfig
from ..models.base import BaseEvent, BaseTrack

RecordT = TypeVar("RecordT")


class BaseFactory(ABC, Generic[RecordT]):
    month_weights: ClassVar[list[float]] = [0.08, 0.07, 0.07, 0.06, 0.07, 0.08, 0.08, 0.08, 0.1, 0.10, 0.11, 0.1]
    hour_weights: ClassVar[list[float]] = [
        0.01, 0.01, 0.01, 0.01, 0.02, 0.04, 0.07, 0.09, 0.08, 0.06, 0.04, 0.04,
        0.05, 0.03, 0.04, 0.05, 0.05, 0.06, 0.07, 0.06, 0.05, 0.03, 0.02, 0.01,
    ]  # fmt: skip

    ZIPF_A: ClassVar[float] = 1.8
    SKIP_CHANCE_MIN: ClassVar[float] = 0.15
    SKIP_CHANCE_MAX: ClassVar[float] = 0.30
    START_YEAR: ClassVar[int] = 2020
    TRACK_DURATION_MIN_MS: ClassVar[int] = 120_000
    TRACK_DURATION_MAX_MS: ClassVar[int] = 360_000

    def __init__(self, num_records: int, config: GenerationConfig) -> None:
        self.config = config
        self.rng = random.Random(config.seed)
        self.np_rng = np.random.default_rng(config.seed)
        self.faker = Faker()
        self.faker.seed_instance(config.seed)
        self.now = config.reference_date
        self.start_year = self.START_YEAR
        self.skip_chance_trend = np.linspace(
            self.SKIP_CHANCE_MIN,
            self.SKIP_CHANCE_MAX,
            self.now.year - self.start_year + 1,
        )
        print("🎵 Generating music catalog...")
        self._catalog = self._generate_catalog(num_records)
        print("📈 Generating evolving listening tastes...")
        self._weighted_tracks = self._generate_weighted_tracks_by_year()
        for year, weighted_records in self._weighted_tracks.items():
            print(f" - {year}: {len(weighted_records)} records")
        print("📅 Generating distribution over year...")
        self._records_per_year = self._generate_distribution_over_year(num_records)
        for year, n in self._records_per_year.items():
            print(f" - {year}: {n} records")

    def _generate_catalog(self, num_records: int) -> list[BaseTrack]:
        n_artists = max(1, int(num_records * 0.20))
        n_albums = max(1, int(num_records * 0.30))
        n_tracks = max(1, int(num_records * 0.50))
        print(f" - records: {num_records}")
        print(f" - artists: {n_artists}")
        print(f" - albums : {n_albums}")
        print(f" - tracks : {n_tracks}")

        artists = [self.faker.name() for _ in range(n_artists)]
        albums = [self.faker.catch_phrase() for _ in range(n_albums)]
        return [
            BaseTrack(
                title=self.faker.bs(),
                artist=self.rng.choice(artists),
                album=self.rng.choice(albums),
                duration_ms=self.rng.randint(self.TRACK_DURATION_MIN_MS, self.TRACK_DURATION_MAX_MS),
            )
            for _ in range(n_tracks)
        ]

    @abstractmethod
    def _map_event(self, event: BaseEvent) -> RecordT: ...

    def _get_random_datetime_for_year(self, year: int) -> datetime:
        if year < self.now.year:
            months = np.arange(1, 13)
            month_weights = np.array(self.month_weights)
        else:
            months = np.arange(1, self.now.month + 1)
            month_weights = np.array(self.month_weights[: self.now.month])

        month_weights = month_weights / month_weights.sum()
        month = self.np_rng.choice(months, p=month_weights)

        max_day = calendar.monthrange(year, int(month))[1]
        day = self.rng.randint(1, max_day)

        hour_weights = np.array(self.hour_weights)
        hour_weights = hour_weights / hour_weights.sum()
        hour = self.np_rng.choice(range(24), p=hour_weights)

        minute = self.rng.randint(0, 59)
        second = self.rng.randint(0, 59)

        candidate = datetime(year, int(month), day, int(hour), minute, second)

        if candidate > self.now:
            start = datetime(year, 1, 1)
            delta_seconds = int((self.now - start).total_seconds())
            return start + timedelta(seconds=self.rng.randint(0, delta_seconds))

        return candidate

    def _generate_distribution_over_year(self, n_records: int) -> dict[int, int]:
        years = range(self.start_year, self.now.year + 1)

        year_weights = [self.rng.uniform(0.5, 1.5) for _ in years]
        base_records_per_year = n_records / sum(year_weights)
        records_per_year = {
            year: int(base_records_per_year * year_weight) for year, year_weight in zip(years, year_weights)
        }
        records_per_year[self.now.year] += n_records - sum(records_per_year.values())
        return records_per_year

    def _generate_weighted_tracks_by_year(self) -> dict[int, list[int]]:
        weighted_tracks_by_year: dict[int, list[int]] = {}
        for year in range(self.start_year, self.now.year + 1):
            popularity = self.np_rng.zipf(a=self.ZIPF_A, size=len(self._catalog))
            self.np_rng.shuffle(popularity)

            weighted: list[int] = []
            for i, weight in enumerate(popularity):
                repeats = min(int(weight / 10), 100)
                if repeats > 0:
                    weighted.extend([i] * repeats)
                else:
                    weighted.append(i)

            weighted_tracks_by_year[year] = weighted

        return weighted_tracks_by_year

    def _generate_base_events(self) -> list[BaseEvent]:
        events: list[BaseEvent] = []
        for year, count in self._records_per_year.items():
            skip_chance = self.skip_chance_trend[year - self.start_year]
            for _ in range(count):
                ts = self._get_random_datetime_for_year(year)
                track_index = self.rng.choice(self._weighted_tracks[year])
                is_skipped = self.rng.random() < skip_chance
                if is_skipped:
                    duration_ratio = self.rng.uniform(0.05, 0.30)
                else:
                    duration_ratio = self.rng.uniform(0.90, 1.00)
                events.append(
                    BaseEvent(
                        timestamp=ts,
                        track_index=track_index,
                        is_skipped=is_skipped,
                        duration_ratio=duration_ratio,
                    )
                )
        return sorted(events, key=lambda e: e.timestamp)

    def create_streaming_history(self) -> list[RecordT]:
        events = self._generate_base_events()
        return [self._map_event(e) for e in tqdm(events, desc="💿 Generating streamings", leave=True)]
