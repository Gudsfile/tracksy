import pytest

from synthetic_datasets.personas import (
    ACTIVE_PERSONAS,
    TERMINAL_PERSONA,
    PersonaProfile,
)

ALL_PERSONAS = (*ACTIVE_PERSONAS, TERMINAL_PERSONA)


@pytest.mark.parametrize("persona", ALL_PERSONAS, ids=lambda p: p.name)
def test_hour_weights_length(persona: PersonaProfile) -> None:
    assert len(persona.hour_weights) == 24


@pytest.mark.parametrize("persona", ALL_PERSONAS, ids=lambda p: p.name)
def test_weekday_multipliers_length(persona: PersonaProfile) -> None:
    assert len(persona.weekday_multipliers) == 7


@pytest.mark.parametrize("persona", ALL_PERSONAS, ids=lambda p: p.name)
def test_month_weights_length(persona: PersonaProfile) -> None:
    assert len(persona.month_weights) == 12


@pytest.mark.parametrize("persona", ALL_PERSONAS, ids=lambda p: p.name)
def test_hour_weights_sum_positive(persona: PersonaProfile) -> None:
    assert sum(persona.hour_weights) > 0


@pytest.mark.parametrize("persona", ALL_PERSONAS, ids=lambda p: p.name)
def test_weekday_multipliers_sum_positive(persona: PersonaProfile) -> None:
    assert sum(persona.weekday_multipliers) > 0


@pytest.mark.parametrize("persona", ALL_PERSONAS, ids=lambda p: p.name)
def test_month_weights_sum_positive(persona: PersonaProfile) -> None:
    assert sum(persona.month_weights) > 0


@pytest.mark.parametrize("persona", ALL_PERSONAS, ids=lambda p: p.name)
def test_skip_chance_in_range(persona: PersonaProfile) -> None:
    assert 0.0 <= persona.skip_chance <= 1.0


@pytest.mark.parametrize("persona", ALL_PERSONAS, ids=lambda p: p.name)
def test_shuffle_chance_in_range(persona: PersonaProfile) -> None:
    assert 0.0 <= persona.shuffle_chance <= 1.0


@pytest.mark.parametrize("persona", ALL_PERSONAS, ids=lambda p: p.name)
def test_n_month_gaps_does_not_exceed_candidates(persona: PersonaProfile) -> None:
    assert persona.n_month_gaps <= len(persona.inactivity_month_windows)


@pytest.mark.parametrize("persona", ALL_PERSONAS, ids=lambda p: p.name)
def test_n_day_gap_windows_does_not_exceed_candidates(persona: PersonaProfile) -> None:
    assert persona.n_day_gap_windows <= len(persona.inactivity_day_windows)


def test_active_personas_collective_month_gaps() -> None:
    assert sum(p.n_month_gaps for p in ACTIVE_PERSONAS) >= 1


def test_active_personas_collective_day_gap_windows() -> None:
    assert sum(p.n_day_gap_windows for p in ACTIVE_PERSONAS) >= 1
