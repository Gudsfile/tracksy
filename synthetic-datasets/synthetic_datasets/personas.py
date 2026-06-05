from dataclasses import dataclass

from .inactivity import InactivityWindow


@dataclass(frozen=True)
class PersonaProfile:
    name: str
    volume_weight: float
    hour_weights: tuple[float, ...]  # length 24
    weekday_multipliers: tuple[float, ...]  # length 7, Monday=0
    month_weights: tuple[float, ...]  # length 12
    skip_chance: float  # 0.0-1.0
    shuffle_chance: float  # 0.0-1.0
    session_avg_minutes: int
    session_gap_minutes: int
    catalog_favored_share: float = 0.60
    inactivity_month_windows: tuple[InactivityWindow, ...] = ()
    inactivity_day_windows: tuple[InactivityWindow, ...] = ()
    n_month_gaps: int = 0
    n_day_gap_windows: int = 0


NIGHT_OWL = PersonaProfile(
    name="NIGHT_OWL",
    volume_weight=1.0,
    hour_weights=(
        0.08,  # 0
        0.07,  # 1
        0.05,  # 2
        0.02,  # 3
        0.01,  # 4
        0.01,  # 5
        0.01,  # 6
        0.01,  # 7
        0.01,  # 8
        0.01,  # 9
        0.01,  # 10
        0.01,  # 11
        0.01,  # 12
        0.01,  # 13
        0.01,  # 14
        0.01,  # 15
        0.01,  # 16
        0.01,  # 17
        0.02,  # 18
        0.03,  # 19
        0.04,  # 20
        0.05,  # 21
        0.10,  # 22
        0.10,  # 23
    ),
    weekday_multipliers=(0.7, 0.7, 0.7, 0.7, 1.2, 1.5, 1.3),
    month_weights=(1.0, 1.0, 1.0, 1.0, 1.0, 0.7, 0.8, 1.0, 1.0, 1.0, 1.0, 0.7),
    skip_chance=0.45,
    shuffle_chance=0.75,
    session_avg_minutes=120,
    session_gap_minutes=25,
    inactivity_month_windows=(
        InactivityWindow.full_month(6),
        InactivityWindow.full_month(12),
    ),
    inactivity_day_windows=(
        InactivityWindow(month=1, start_day=14, end_day=20),
        InactivityWindow(month=6, start_day=15, end_day=21),
    ),
    n_month_gaps=1,
    n_day_gap_windows=1,
)

MORNING_COMMUTER = PersonaProfile(
    name="MORNING_COMMUTER",
    volume_weight=1.4,
    hour_weights=(
        0.01,  # 0
        0.01,  # 1
        0.01,  # 2
        0.01,  # 3
        0.01,  # 4
        0.01,  # 5
        0.01,  # 6
        0.12,  # 7
        0.12,  # 8
        0.08,  # 9
        0.02,  # 10
        0.02,  # 11
        0.02,  # 12
        0.02,  # 13
        0.02,  # 14
        0.02,  # 15
        0.02,  # 16
        0.02,  # 17
        0.10,  # 18
        0.08,  # 19
        0.02,  # 20
        0.02,  # 21
        0.01,  # 22
        0.01,  # 23
    ),
    weekday_multipliers=(1.2, 1.2, 1.2, 1.2, 1.2, 0.5, 0.5),
    month_weights=(1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.4, 1.0, 1.0, 1.0, 1.0),
    skip_chance=0.18,
    shuffle_chance=0.40,
    session_avg_minutes=35,
    session_gap_minutes=15,
    inactivity_month_windows=(InactivityWindow.full_month(8),),
    inactivity_day_windows=(InactivityWindow(month=12, start_day=24, end_day=31),),
    n_month_gaps=1,
    n_day_gap_windows=1,
)

SETTLED_LISTENER = PersonaProfile(
    name="SETTLED_LISTENER",
    volume_weight=1.6,
    hour_weights=(
        0.01,  # 0
        0.01,  # 1
        0.01,  # 2
        0.01,  # 3
        0.01,  # 4
        0.01,  # 5
        0.01,  # 6
        0.01,  # 7
        0.01,  # 8
        0.01,  # 9
        0.01,  # 10
        0.01,  # 11
        0.01,  # 12
        0.01,  # 13
        0.08,  # 14
        0.09,  # 15
        0.09,  # 16
        0.09,  # 17
        0.09,  # 18
        0.08,  # 19
        0.07,  # 20
        0.04,  # 21
        0.03,  # 22
        0.02,  # 23
    ),
    weekday_multipliers=(0.9, 1.0, 1.0, 1.0, 1.0, 1.1, 0.9),
    month_weights=(0.9, 0.9, 0.9, 0.9, 1.1, 1.1, 1.1, 1.1, 0.9, 0.9, 0.9, 0.9),
    skip_chance=0.08,
    shuffle_chance=0.20,
    session_avg_minutes=60,
    session_gap_minutes=20,
    catalog_favored_share=0.50,
    inactivity_month_windows=(InactivityWindow.full_month(7),),
    inactivity_day_windows=(),
    n_month_gaps=1,
    n_day_gap_windows=0,
)

CURRENT_ERA = PersonaProfile(
    name="CURRENT_ERA",
    volume_weight=1.0,
    hour_weights=(
        0.01,  # 0
        0.01,  # 1
        0.01,  # 2
        0.01,  # 3
        0.02,  # 4
        0.04,  # 5
        0.07,  # 6
        0.08,  # 7
        0.07,  # 8
        0.05,  # 9
        0.04,  # 10
        0.04,  # 11
        0.04,  # 12
        0.04,  # 13
        0.04,  # 14
        0.05,  # 15
        0.06,  # 16
        0.07,  # 17
        0.07,  # 18
        0.06,  # 19
        0.05,  # 20
        0.04,  # 21
        0.02,  # 22
        0.01,  # 23
    ),
    weekday_multipliers=(1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0),
    month_weights=(1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0),
    skip_chance=0.22,
    shuffle_chance=0.45,
    session_avg_minutes=50,
    session_gap_minutes=20,
    inactivity_month_windows=(),
    inactivity_day_windows=(),
    n_month_gaps=0,
    n_day_gap_windows=0,
)

ACTIVE_PERSONAS = (NIGHT_OWL, MORNING_COMMUTER, SETTLED_LISTENER)
TERMINAL_PERSONA = CURRENT_ERA


def _check_invariants() -> None:
    if sum(p.n_month_gaps for p in ACTIVE_PERSONAS) < 1:
        raise ValueError("ACTIVE_PERSONAS must collectively contribute at least one month gap")
    if sum(p.n_day_gap_windows for p in ACTIVE_PERSONAS) < 1:
        raise ValueError("ACTIVE_PERSONAS must collectively contribute at least one day gap")
    for p in (*ACTIVE_PERSONAS, TERMINAL_PERSONA):
        if p.n_month_gaps > len(p.inactivity_month_windows):
            raise ValueError(f"{p.name}: n_month_gaps exceeds candidates")
        if p.n_day_gap_windows > len(p.inactivity_day_windows):
            raise ValueError(f"{p.name}: n_day_gap_windows exceeds candidates")


_check_invariants()
