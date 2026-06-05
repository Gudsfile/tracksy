import calendar
from dataclasses import dataclass
from datetime import date


@dataclass(frozen=True)
class InactivityWindow:
    """A contiguous range of days within a calendar year, year-agnostic.
    Resolved to actual dates at chapter build time.
    """

    month: int  # 1-12
    start_day: int  # 1-31
    end_day: int  # 1-31, inclusive (clamped to month's last day)

    def to_dates(self, year: int) -> list[date]:
        last = calendar.monthrange(year, self.month)[1]
        return [date(year, self.month, d) for d in range(self.start_day, min(self.end_day, last) + 1)]

    @classmethod
    def full_month(cls, month: int) -> "InactivityWindow":
        return cls(month=month, start_day=1, end_day=31)
