from dataclasses import dataclass, field
from datetime import date
from functools import cached_property

from .inactivity import InactivityWindow
from .personas import PersonaProfile


@dataclass
class Chapter:
    year: int
    position: int
    persona: PersonaProfile | None
    selected_month_windows: tuple[InactivityWindow, ...] = field(default_factory=tuple)
    selected_day_windows: tuple[InactivityWindow, ...] = field(default_factory=tuple)

    @cached_property
    def inactivity_dates(self) -> frozenset[date]:
        out: set[date] = set()
        for w in (*self.selected_month_windows, *self.selected_day_windows):
            out.update(w.to_dates(self.year))
        return frozenset(out)
