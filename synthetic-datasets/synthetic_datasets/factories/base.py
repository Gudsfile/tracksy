import calendar
import random
from abc import ABC, abstractmethod
from datetime import datetime, timedelta
from typing import Generic, TypeVar

import numpy as np
from faker import Faker
from tqdm import tqdm

from ..config import GenerationConfig

RecordT = TypeVar("RecordT")


class BaseFactory(ABC, Generic[RecordT]):
    month_weights = [0.08, 0.07, 0.07, 0.06, 0.07, 0.08, 0.08, 0.08, 0.1, 0.10, 0.11, 0.1]
    hour_weights = [
        0.01, 0.01, 0.01, 0.01, 0.02, 0.04, 0.07, 0.09, 0.08, 0.06, 0.04, 0.04,
        0.05, 0.03, 0.04, 0.05, 0.05, 0.06, 0.07, 0.06, 0.05, 0.03, 0.02, 0.01,
    ]  # fmt: skip

    ZIPF_A: float = 1.8
    SKIP_CHANCE_MIN: float = 0.15
    SKIP_CHANCE_MAX: float = 0.30
    START_YEAR: int = 2020
    TRACK_DURATION_MIN_MS: int = 120_000
    TRACK_DURATION_MAX_MS: int = 360_000

    def __init__(self, num_records: int, config: GenerationConfig) -> None:
        self.config = config
        random.seed(config.seed)
        np.random.seed(config.seed)
        Faker.seed(config.seed)
        self.faker = Faker()
        self.now = config.reference_date
        self.start_year = self.START_YEAR
        self.skip_chance_trend = np.linspace(
            self.SKIP_CHANCE_MIN,
            self.SKIP_CHANCE_MAX,
            self.now.year - self.start_year + 1,
        )
        print("🎵 Generating music catalog...")
        self.tracks = self._generate_catalog(num_records)
        print("📈 Generating evolving listening tastes...")
        self.weighted_tracks = self._generate_weighted_tracks_by_year()
        for year, weighted_records in self.weighted_tracks.items():
            print(f" - {year}: {len(weighted_records)} records")
        print("📅 Generating distribution over year...")
        self.records_per_year = self._generate_distribution_over_year(num_records)
        for year, n in self.records_per_year.items():
            print(f" - {year}: {n} records")

    @abstractmethod
    def _generate_catalog(self, num_records: int) -> list: ...

    @abstractmethod
    def _create_one_record(self, ts: datetime) -> RecordT: ...

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
            year: int(base_records_per_year * year_weight) for year, year_weight in zip(years, year_weights)
        }
        records_per_year[self.now.year] += n_records - sum(records_per_year.values())
        return records_per_year

    def _generate_weighted_tracks_by_year(self) -> dict[int, list]:
        weighted_tracks_by_year = {}
        for year in range(self.start_year, self.now.year + 1):
            popularity = np.random.zipf(a=self.ZIPF_A, size=len(self.tracks))
            np.random.shuffle(popularity)

            weighted = []
            for track, weight in zip(self.tracks, popularity):
                repeats = min(int(weight / 10), 100)
                if repeats > 0:
                    weighted.extend([track] * repeats)
                else:
                    weighted.extend([track])

            weighted_tracks_by_year[year] = weighted

        return weighted_tracks_by_year

    def create_streaming_history(self) -> list[RecordT]:
        all_records: list[RecordT] = []

        for year, num_records_for_year in self.records_per_year.items():
            year_records = [
                self._create_one_record(self._get_random_datetime_for_year(year))
                for _ in tqdm(range(num_records_for_year), desc=f"💿 Generating streamings for {year}", leave=True)
            ]
            all_records.extend(year_records)

        return all_records
