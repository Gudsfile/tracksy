from datetime import date

from synthetic_datasets.inactivity import InactivityWindow


def test_inactivity_window_to_dates_leap_year() -> None:
    dates = InactivityWindow(month=2, start_day=1, end_day=31).to_dates(2024)
    assert len(dates) == 29


def test_inactivity_window_to_dates_non_leap_year() -> None:
    dates = InactivityWindow(month=2, start_day=1, end_day=31).to_dates(2023)
    assert len(dates) == 28


def test_inactivity_window_to_dates_clamps_end_day() -> None:
    dates = InactivityWindow(month=2, start_day=27, end_day=31).to_dates(2023)
    assert len(dates) == 2
    assert date(2023, 2, 27) in dates
    assert date(2023, 2, 28) in dates


def test_inactivity_window_full_month_leap_year() -> None:
    dates = InactivityWindow.full_month(2).to_dates(2024)
    assert len(dates) == 29
    assert date(2024, 2, 1) in dates
    assert date(2024, 2, 29) in dates


def test_inactivity_window_full_month_non_leap_year() -> None:
    dates = InactivityWindow.full_month(2).to_dates(2023)
    assert len(dates) == 28
    assert date(2023, 2, 1) in dates
    assert date(2023, 2, 28) in dates


def test_inactivity_window_partial_month() -> None:
    dates = InactivityWindow(month=6, start_day=15, end_day=21).to_dates(2023)
    assert len(dates) == 7
    assert date(2023, 6, 15) in dates
    assert date(2023, 6, 21) in dates


def test_inactivity_window_single_day() -> None:
    dates = InactivityWindow(month=6, start_day=15, end_day=15).to_dates(2023)
    assert len(dates) == 1
    assert date(2023, 6, 15) in dates


def test_inactivity_window_all_months() -> None:
    for month in range(1, 13):
        dates = InactivityWindow.full_month(month).to_dates(2023)
        assert len(dates) > 0
        assert all(d.month == month for d in dates)
