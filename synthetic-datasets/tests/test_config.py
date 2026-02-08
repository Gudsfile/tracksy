from datetime import datetime

from synthetic_datasets.config import GenerationConfig, derive_reference_date_from_seed


def test_derive_reference_date_determinism():
    seed = 42
    date1 = derive_reference_date_from_seed(seed)
    date2 = derive_reference_date_from_seed(seed)
    assert date1 == date2

    seed_diff = 43
    date3 = derive_reference_date_from_seed(seed_diff)
    assert date1 != date3


def test_create_no_args():
    config = GenerationConfig.create()
    assert config.seed is not None
    assert config.reference_date is not None
    assert config.is_seed_auto_generated is True
    assert config.is_reference_date_auto_generated is True

    expected_date = derive_reference_date_from_seed(config.seed)
    assert config.reference_date == expected_date


def test_create_with_seed():
    seed = 123
    config = GenerationConfig.create(seed=seed)

    assert config.seed == seed
    assert config.is_seed_auto_generated is False
    assert config.is_reference_date_auto_generated is True

    expected_date = derive_reference_date_from_seed(seed)
    assert config.reference_date == expected_date


def test_create_with_seed_and_date():
    seed = 42
    ref_date = datetime(2025, 12, 25, 12, 0, 0)

    config = GenerationConfig.create(seed=seed, reference_date=ref_date)

    assert config.seed == seed
    assert config.reference_date == ref_date
    assert config.is_seed_auto_generated is False
    assert config.is_reference_date_auto_generated is False

    date_from_seed = derive_reference_date_from_seed(seed)
    assert config.reference_date != date_from_seed


def test_log_config(capsys):
    seed = 42
    config = GenerationConfig.create(seed=seed)
    config.log_config()

    captured = capsys.readouterr()
    assert "Generation Configuration" in captured.out
    assert f"Seed: {seed}" in captured.out
    assert "provided" in captured.out
    assert "derived from seed" in captured.out
