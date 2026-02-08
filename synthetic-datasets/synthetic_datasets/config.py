import random
from dataclasses import dataclass
from datetime import datetime, timedelta


def derive_reference_date_from_seed(seed: int) -> datetime:
    rng = random.Random(seed)

    start_date = datetime(2025, 11, 1)
    end_date = datetime(2026, 2, 1)

    delta_seconds = int((end_date - start_date).total_seconds())
    random_seconds = rng.randint(0, delta_seconds)

    random_microseconds = rng.randint(0, 999999)

    derived_date = start_date + timedelta(seconds=random_seconds, microseconds=random_microseconds)
    return derived_date


@dataclass
class GenerationConfig:
    seed: int
    reference_date: datetime
    is_seed_auto_generated: bool = False
    is_reference_date_auto_generated: bool = False

    @classmethod
    def create(cls, seed: int | None = None, reference_date: datetime | None = None) -> "GenerationConfig":
        if seed is None:
            seed = random.randint(0, 2**31 - 1)
            is_seed_auto = True
            print(f"🌱 Auto-generated seed: {seed} (use --seed {seed} to reproduce)")
        else:
            is_seed_auto = False
            print(f"🌱 Using provided seed: {seed}")

        if reference_date is None:
            reference_date = derive_reference_date_from_seed(seed)
            is_date_auto = True
            print(f"📅 Derived reference date from seed: {reference_date.isoformat()}")
        else:
            is_date_auto = False
            print(f"📅 Using provided reference date: {reference_date.isoformat()}")

        return cls(
            seed=seed,
            reference_date=reference_date,
            is_seed_auto_generated=is_seed_auto,
            is_reference_date_auto_generated=is_date_auto,
        )

    def log_config(self) -> None:
        print("=" * 60)
        print("🔧 Generation Configuration")
        print(f"  Seed: {self.seed} {'(auto-generated)' if self.is_seed_auto_generated else '(provided)'}")
        print(
            f"  Reference Date: {self.reference_date.isoformat()} {'(derived from seed)' if self.is_reference_date_auto_generated else '(provided)'}"
        )
        print("=" * 60)
        print(f"To reproduce: --seed {self.seed} --reference-date {self.reference_date.isoformat()}")
        print("=" * 60)
