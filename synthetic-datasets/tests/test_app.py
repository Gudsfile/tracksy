from datetime import datetime
from unittest.mock import patch

from pytest import mark
from typer.testing import CliRunner

from synthetic_datasets.app import app

runner = CliRunner()


def test_help():
    result = runner.invoke(app, ["--help"])
    assert result.exit_code == 0
    assert "Generate synthetic streaming datasets" in result.output
    assert "provider" in result.stdout
    assert "seed" in result.stdout


def test_num_records_below_minimum():
    result = runner.invoke(app, ["50"])
    assert result.exit_code != 0
    assert "Minimal value is: 100" in result.output


def test_num_records_boundary_rejected(tmp_path):
    result = runner.invoke(app, ["99", "-o", str(tmp_path)])
    assert result.exit_code != 0


def test_num_records_boundary_accepted(tmp_path):
    result = runner.invoke(app, ["100", "--seed", "42", "-o", str(tmp_path)])
    assert result.exit_code == 0


def test_generate_spotify(tmp_path):
    result = runner.invoke(app, ["100", "--seed", "42", "-o", str(tmp_path)])
    assert result.exit_code == 0
    assert (tmp_path / "spotify").exists()


def test_generate_deezer(tmp_path):
    result = runner.invoke(app, ["100", "--seed", "42", "--provider", "deezer", "-o", str(tmp_path)])
    assert result.exit_code == 0
    assert (tmp_path / "deezer").exists()


def test_generate_apple_music(tmp_path):
    result = runner.invoke(app, ["100", "--seed", "42", "--provider", "apple-music", "-o", str(tmp_path)])
    assert result.exit_code == 0
    assert (tmp_path / "apple_music").exists()


@patch("synthetic_datasets.app._spotify")
@patch("synthetic_datasets.app.GenerationConfig.create")
@mark.parametrize(
    ["reference_date_str", "expected_datetime"],
    [
        ("2026-01-15T01:02:03", datetime(2026, 1, 15, 1, 2, 3)),
        ("2025-12-31T23:59:59", datetime(2025, 12, 31, 23, 59, 59)),
        ("2024-02-29T12:00:00", datetime(2024, 2, 29, 12, 0, 0)),
    ],
)
def test_generate_with_reference_date(mock_create, mock_spotify, reference_date_str, expected_datetime):
    result = runner.invoke(app, ["100", "--reference-date", reference_date_str])

    assert result.exit_code == 0
    mock_create.assert_called_once_with(seed=None, reference_date=expected_datetime)
    mock_spotify.assert_called_once()


@patch("synthetic_datasets.app._spotify")
@patch("synthetic_datasets.app.GenerationConfig.create")
@mark.parametrize("seed", [0, 42, 1234567890])
def test_generate_with_seed(mock_create, mock_spotify, seed):
    result = runner.invoke(app, ["100", "--seed", seed])
    assert result.exit_code == 0
    mock_create.assert_called_once_with(seed=seed, reference_date=None)
    mock_spotify.assert_called_once()


def test_generate_invalid_provider(tmp_path):
    result = runner.invoke(app, ["100", "--seed", "42", "--provider", "napster", "-o", str(tmp_path)])
    assert result.exit_code == 2
