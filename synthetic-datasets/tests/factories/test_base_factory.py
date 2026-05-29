from datetime import datetime

import pytest

from synthetic_datasets.config import GenerationConfig
from synthetic_datasets.factories.base import BaseFactory


class ConcreteFactory(BaseFactory[str]):
    def _generate_catalog(self, num_records: int) -> list:
        return []

    def _create_one_record(self, ts: datetime) -> str:
        return "record"


@pytest.fixture
def config():
    return GenerationConfig(seed=42, reference_date=datetime(2026, 2, 8))


@pytest.fixture
def factory(config):
    return ConcreteFactory(num_records=10, config=config)


def test_get_random_datetime_for_year_returns_correct_year(factory):
    for year in range(2020, 2026):
        dt = factory._get_random_datetime_for_year(year)
        assert dt.year == year


def test_get_random_datetime_for_current_year_never_future(factory):
    current_year = factory.now.year
    for _ in range(100):
        dt = factory._get_random_datetime_for_year(current_year)
        assert dt <= factory.now


def test_generate_distribution_over_year_sums_to_n(factory):
    for n in [0, 1, 50, 100, 999]:
        result = factory._generate_distribution_over_year(n)
        assert sum(result.values()) == n


def test_rng_seeding_is_deterministic(config):
    f1 = ConcreteFactory(num_records=50, config=config)
    f2 = ConcreteFactory(num_records=50, config=config)
    assert f1.records_per_year == f2.records_per_year
