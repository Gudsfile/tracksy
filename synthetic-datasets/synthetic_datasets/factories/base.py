import random
from abc import ABC, abstractmethod
from datetime import date, datetime, timedelta
from typing import ClassVar, Generic, TypeVar

import numpy as np
from faker import Faker
from rich import get_console, print
from rich.progress import track

from ..chapters import Chapter
from ..config import GenerationConfig
from ..models.base import BaseEvent, BaseTrack
from ..personas import ACTIVE_PERSONAS, TERMINAL_PERSONA, PersonaProfile

_console = get_console()

RecordT = TypeVar("RecordT")


class BaseFactory(ABC, Generic[RecordT]):
    ZIPF_A: ClassVar[float] = 1.8
    TRACK_DURATION_MIN_MS: ClassVar[int] = 120_000
    TRACK_DURATION_MAX_MS: ClassVar[int] = 360_000
    ROLE_BOOST: ClassVar[dict[str, float]] = {"core": 3.0, "favored": 1.0, "noise": 0.2}

    def __init__(self, num_records: int, config: GenerationConfig) -> None:
        self.config = config
        self.rng = random.Random(config.seed)
        self.np_rng = np.random.default_rng(config.seed)
        self.faker = Faker()
        self.faker.seed_instance(config.seed)
        self.now = config.reference_date
        print("🎵 Generating music catalog...")
        self._catalog = self._generate_catalog(num_records)
        print("🗂️ Building chapter sequence...")
        self._chapters = self._build_chapters()
        print("📅 Distributing records per chapter...")
        self._records_per_chapter = self._distribute_records(num_records)
        for chapter in self._chapters:
            count = self._records_per_chapter[chapter.position]
            label = chapter.persona.name if chapter.persona else "Ghost"
            print(f" - {chapter.year} ({label}): {count} records")
        print("📈 Generating listening tastes per chapter...")
        self._weighted_tracks_per_chapter = self._generate_weighted_tracks_per_chapter()
        for position, pool in self._weighted_tracks_per_chapter.items():
            print(f" - position {position}: {len(pool)} weighted entries")
        print("🕐 Precomputing day/hour distributions per chapter...")
        self._day_distribution_per_chapter: dict[int, tuple[list[date], list[float]]] = {}
        self._hour_distribution_per_chapter: dict[int, list[float]] = {}
        for chapter in self._chapters:
            if chapter.persona is None:
                continue
            self._day_distribution_per_chapter[chapter.position] = self._build_day_distribution(chapter)
            self._hour_distribution_per_chapter[chapter.position] = self._build_hour_distribution(chapter.persona)

    def _generate_catalog(self, num_records: int) -> list[BaseTrack]:
        n_artists = max(1, int(num_records * 0.20))
        n_albums = max(1, int(num_records * 0.30))
        n_tracks = max(1, int(num_records * 0.50))
        print(f" - {num_records} records")
        print(f" - {n_artists} artists")
        print(f" - {n_albums} albums")
        print(f" - {n_tracks} tracks")

        with _console.status("Generating artists..."):
            artists = [self.faker.name() for _ in range(n_artists)]
        with _console.status("Generating albums..."):
            albums = [self.faker.catch_phrase() for _ in range(n_albums)]
        with _console.status("Generating tracks..."):
            return [
                BaseTrack(
                    title=self.faker.bs(),
                    artist=self.rng.choice(artists),
                    album=self.rng.choice(albums),
                    duration_ms=self.rng.randint(self.TRACK_DURATION_MIN_MS, self.TRACK_DURATION_MAX_MS),
                )
                for _ in range(n_tracks)
            ]

    @property
    def chapters(self) -> tuple[Chapter, ...]:
        return tuple(self._chapters)

    @abstractmethod
    def _map_event(self, event: BaseEvent) -> RecordT: ...

    def _chapter_bounds(self, chapter: Chapter) -> tuple[date, date]:
        first_day = date(chapter.year, 1, 1)
        if chapter.year == self.now.year:
            last_day = self.now.date()
        else:
            last_day = date(chapter.year, 12, 31)
        return first_day, last_day

    def _build_day_distribution(self, chapter: Chapter) -> tuple[list[date], list[float]]:
        persona = chapter.persona
        assert persona is not None
        first_day, last_day = self._chapter_bounds(chapter)
        inactivity = chapter.inactivity_dates
        days: list[date] = []
        weights: list[float] = []
        current = first_day
        while current <= last_day:
            if current not in inactivity:
                month_w = persona.month_weights[current.month - 1]
                weekday_w = persona.weekday_multipliers[current.weekday()]
                days.append(current)
                weights.append(month_w * weekday_w)
            current = current + timedelta(days=1)
        total = sum(weights)
        probs = [w / total for w in weights]
        return days, probs

    def _build_hour_distribution(self, persona: PersonaProfile) -> list[float]:
        total = sum(persona.hour_weights)
        return [w / total for w in persona.hour_weights]

    def _select_gaps_for_chapter(self, chapter: Chapter) -> None:
        persona = chapter.persona
        if persona is None:
            return
        chapter_rng = random.Random(self.config.seed ^ chapter.position)
        chapter.selected_month_windows = tuple(
            chapter_rng.sample(persona.inactivity_month_windows, persona.n_month_gaps)
        )
        chapter.selected_day_windows = tuple(
            chapter_rng.sample(persona.inactivity_day_windows, persona.n_day_gap_windows)
        )

    def _build_chapters(self) -> list[Chapter]:
        ref_year = self.now.year
        chapters: list[Chapter | None] = [None] * 5
        chapters[4] = Chapter(year=ref_year, position=4, persona=TERMINAL_PERSONA)
        ghost_position = self.rng.choice([1, 2, 3])
        chapters[ghost_position] = Chapter(year=ref_year - (4 - ghost_position), position=ghost_position, persona=None)
        remaining_positions = [p for p in (0, 1, 2, 3) if chapters[p] is None]
        shuffled = list(ACTIVE_PERSONAS)
        self.rng.shuffle(shuffled)
        for position, persona in zip(remaining_positions, shuffled):
            chapter = Chapter(
                year=ref_year - (4 - position),
                position=position,
                persona=persona,
            )
            self._select_gaps_for_chapter(chapter)
            chapters[position] = chapter
        self._select_gaps_for_chapter(chapters[4])  # type: ignore[index]
        return [ch for ch in chapters if ch is not None]

    def _distribute_records(self, num_records: int) -> dict[int, int]:
        share_units: dict[int, float] = {}
        for chapter in self._chapters:
            if chapter.persona is None:
                share_units[chapter.position] = 0.0
                continue
            first_day, last_day = self._chapter_bounds(chapter)
            duration_factor = (last_day - first_day).days / 365
            share_units[chapter.position] = chapter.persona.volume_weight * duration_factor

        total = sum(share_units.values())
        exact = {pos: num_records * unit / total for pos, unit in share_units.items()}
        base = {pos: int(value) for pos, value in exact.items()}
        leftover = num_records - sum(base.values())

        fractions = sorted(exact.items(), key=lambda kv: kv[1] - int(kv[1]), reverse=True)
        for pos, _ in fractions[:leftover]:
            base[pos] += 1
        return base

    def _generate_weighted_tracks_per_chapter(self) -> dict[int, list[int]]:
        n_tracks = len(self._catalog)
        n_core = int(n_tracks * 0.20)
        self._core_indices: set[int] = set(self.rng.sample(range(n_tracks), n_core))

        popularity = self.np_rng.zipf(a=self.ZIPF_A, size=n_tracks)
        self._favored_indices_per_chapter: dict[int, set[int]] = {}

        result: dict[int, list[int]] = {}
        for chapter in self._chapters:
            if chapter.persona is None:
                continue
            chapter_rng = random.Random(self.config.seed ^ chapter.position)
            favored_pool = [i for i in range(n_tracks) if i not in self._core_indices]
            n_favored = min(int(n_tracks * chapter.persona.catalog_favored_share), len(favored_pool))
            favored_indices = set(chapter_rng.sample(favored_pool, n_favored))
            self._favored_indices_per_chapter[chapter.position] = favored_indices

            weighted: list[int] = []
            for i, p in enumerate(popularity):
                role = "core" if i in self._core_indices else "favored" if i in favored_indices else "noise"
                repeats = min(int(p * self.ROLE_BOOST[role] / 10), 100)
                if repeats > 0:
                    weighted.extend([i] * repeats)

            if not weighted:
                weighted = list(range(n_tracks))

            result[chapter.position] = weighted

        return result

    def _generate_events_for_chapter(self, chapter: Chapter) -> list[BaseEvent]:
        persona = chapter.persona
        assert persona is not None
        count = self._records_per_chapter[chapter.position]
        weighted_pool = self._weighted_tracks_per_chapter[chapter.position]
        days, day_probs = self._day_distribution_per_chapter[chapter.position]
        hour_probs = self._hour_distribution_per_chapter[chapter.position]

        day_indices = self.np_rng.choice(len(days), size=count, p=day_probs)
        hour_values = self.np_rng.choice(24, size=count, p=hour_probs)

        events: list[BaseEvent] = []
        for i in range(count):
            day = days[int(day_indices[i])]
            hour = int(hour_values[i])
            minute = self.rng.randint(0, 59)
            second = self.rng.randint(0, 59)
            ts = datetime(day.year, day.month, day.day, hour, minute, second)
            track_index = self.rng.choice(weighted_pool)
            is_skipped = self.rng.random() < persona.skip_chance
            duration_ratio = self.rng.uniform(0.05, 0.30) if is_skipped else self.rng.uniform(0.90, 1.00)
            shuffle = self.rng.random() < persona.shuffle_chance
            events.append(BaseEvent(ts, track_index, is_skipped, duration_ratio, shuffle))
        return events

    def _generate_base_events(self) -> list[BaseEvent]:
        events: list[BaseEvent] = []
        print("📅 Generating events...")
        for chapter in self._chapters:
            if chapter.persona is None:
                continue
            label = chapter.persona.name
            chapter_events = self._generate_events_for_chapter(chapter)
            for _ in track(range(len(chapter_events)), description=f" - {chapter.year} ({label})"):
                pass
            events.extend(chapter_events)
        return sorted(events, key=lambda e: e.timestamp)

    def create_streaming_history(self) -> list[RecordT]:
        events = self._generate_base_events()
        return [self._map_event(e) for e in track(events, description="💿 Generating streamings")]
