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


def test_generate_custom(tmp_path):
    result = runner.invoke(app, ["100", "--seed", "42", "--provider", "custom", "-o", str(tmp_path)])
    assert result.exit_code == 0
    assert (tmp_path / "custom").exists()


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


def test_log_config_output(tmp_path):
    result = runner.invoke(app, ["100", "--seed", "42", "-o", str(tmp_path)])
    assert result.exit_code == 0
    assert "Generation Configuration" in result.output
    assert "42" in result.output
    assert "provided" in result.output
    assert "derived from seed" in result.output


def test_all_providers_generates_all_outputs(tmp_path):
    result = runner.invoke(app, ["100", "--seed", "42", "--all-providers", "-o", str(tmp_path)])
    assert result.exit_code == 0
    assert (tmp_path / "spotify").exists()
    assert (tmp_path / "deezer").exists()
    assert (tmp_path / "apple_music").exists()
    assert (tmp_path / "custom").exists()


def test_all_providers_conflicts_with_provider(tmp_path):
    result = runner.invoke(
        app,
        ["100", "--seed", "42", "--all-providers", "--provider", "spotify", "-o", str(tmp_path)],
        env={"TERM": "dumb"},
    )
    assert result.exit_code == 2
    assert "Cannot use --all-providers with --provider" in result.output


@patch("synthetic_datasets.app._spotify")
@patch("synthetic_datasets.app._apple_music")
@patch("synthetic_datasets.app._deezer")
@patch("synthetic_datasets.app._custom")
def test_all_providers_continues_on_failure(mock_custom, mock_deezer, mock_apple, mock_spotify, tmp_path):
    mock_spotify.side_effect = RuntimeError("spotify failed")
    result = runner.invoke(app, ["100", "--seed", "42", "--all-providers", "-o", str(tmp_path)])
    assert result.exit_code != 0
    assert "Error generating spotify" in result.output
    mock_deezer.assert_called_once()
    mock_apple.assert_called_once()
    mock_custom.assert_called_once()


def test_help_mentions_all_providers():
    result = runner.invoke(app, ["--help"], env={"TERM": "dumb"})
    assert result.exit_code == 0
    assert "all-providers" in result.output


def test_generate_multiple_providers(tmp_path):
    result = runner.invoke(
        app,
        ["100", "--seed", "42", "--provider", "spotify", "--provider", "deezer", "-o", str(tmp_path)],
    )
    assert result.exit_code == 0
    assert (tmp_path / "spotify").exists()
    assert (tmp_path / "deezer").exists()


@patch("synthetic_datasets.app._deezer")
@patch("synthetic_datasets.app._spotify")
def test_multiple_providers_continues_on_failure(mock_spotify, mock_deezer, tmp_path):
    mock_spotify.side_effect = RuntimeError("spotify failed")
    result = runner.invoke(
        app,
        ["100", "--seed", "42", "--provider", "spotify", "--provider", "deezer", "-o", str(tmp_path)],
        env={"TERM": "dumb"},
    )
    assert result.exit_code != 0
    assert "Error generating spotify" in result.output
    mock_deezer.assert_called_once()


def test_multiple_providers_conflict_with_all_providers(tmp_path):
    result = runner.invoke(
        app,
        [
            "100",
            "--seed",
            "42",
            "--all-providers",
            "--provider",
            "spotify",
            "--provider",
            "deezer",
            "-o",
            str(tmp_path),
        ],
        env={"TERM": "dumb"},
    )
    assert result.exit_code == 2
    assert "Cannot use --all-providers with --provider" in result.output
