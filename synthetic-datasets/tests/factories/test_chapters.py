from datetime import date

from synthetic_datasets.chapters import Chapter
from synthetic_datasets.inactivity import InactivityWindow
from synthetic_datasets.personas import CURRENT_ERA, NIGHT_OWL


def test_chapter_inactivity_dates_resolves_month_windows() -> None:
    chapter = Chapter(
        year=2023,
        position=1,
        persona=NIGHT_OWL,
        selected_month_windows=(InactivityWindow.full_month(6),),
        selected_day_windows=(),
    )
    dates = chapter.inactivity_dates
    assert isinstance(dates, frozenset)
    assert len(dates) == 30
    assert date(2023, 6, 1) in dates
    assert date(2023, 6, 30) in dates


def test_chapter_inactivity_dates_resolves_day_windows() -> None:
    chapter = Chapter(
        year=2023,
        position=1,
        persona=NIGHT_OWL,
        selected_month_windows=(),
        selected_day_windows=(InactivityWindow(month=1, start_day=14, end_day=20),),
    )
    dates = chapter.inactivity_dates
    assert len(dates) == 7
    assert date(2023, 1, 14) in dates
    assert date(2023, 1, 20) in dates


def test_chapter_inactivity_dates_resolves_both_window_types() -> None:
    chapter = Chapter(
        year=2023,
        position=1,
        persona=NIGHT_OWL,
        selected_month_windows=(InactivityWindow.full_month(6),),
        selected_day_windows=(InactivityWindow(month=1, start_day=14, end_day=20),),
    )
    dates = chapter.inactivity_dates
    assert len(dates) == 37  # 30 from June + 7 from Jan
    assert date(2023, 6, 1) in dates
    assert date(2023, 1, 20) in dates


def test_chapter_inactivity_dates_empty_when_no_windows() -> None:
    chapter = Chapter(
        year=2023,
        position=1,
        persona=NIGHT_OWL,
        selected_month_windows=(),
        selected_day_windows=(),
    )
    dates = chapter.inactivity_dates
    assert len(dates) == 0


def test_chapter_inactivity_dates_is_frozenset() -> None:
    chapter = Chapter(
        year=2023,
        position=1,
        persona=NIGHT_OWL,
        selected_month_windows=(InactivityWindow.full_month(6),),
    )
    dates = chapter.inactivity_dates
    assert isinstance(dates, frozenset)


def test_chapter_inactivity_dates_cached() -> None:
    chapter = Chapter(
        year=2023,
        position=1,
        persona=NIGHT_OWL,
        selected_month_windows=(InactivityWindow.full_month(6),),
    )
    dates1 = chapter.inactivity_dates
    dates2 = chapter.inactivity_dates
    assert dates1 is dates2  # Same object, cached


def test_chapter_ghost_with_persona_none() -> None:
    chapter = Chapter(year=2023, position=2, persona=None)
    dates = chapter.inactivity_dates
    assert len(dates) == 0


def test_chapter_with_current_era_persona() -> None:
    chapter = Chapter(
        year=2026,
        position=4,
        persona=CURRENT_ERA,
        selected_month_windows=(),
        selected_day_windows=(),
    )
    dates = chapter.inactivity_dates
    assert len(dates) == 0  # CURRENT_ERA has no inactivity windows


def test_chapter_leap_year_february() -> None:
    chapter = Chapter(
        year=2024,  # leap year
        position=1,
        persona=NIGHT_OWL,
        selected_month_windows=(InactivityWindow.full_month(2),),
    )
    dates = chapter.inactivity_dates
    assert len(dates) == 29
    assert date(2024, 2, 29) in dates


def test_chapter_multiple_day_windows() -> None:
    chapter = Chapter(
        year=2023,
        position=1,
        persona=NIGHT_OWL,
        selected_month_windows=(),
        selected_day_windows=(
            InactivityWindow(month=1, start_day=14, end_day=20),
            InactivityWindow(month=6, start_day=15, end_day=21),
        ),
    )
    dates = chapter.inactivity_dates
    assert len(dates) == 14  # 7 + 7
    assert date(2023, 1, 14) in dates
    assert date(2023, 6, 21) in dates
