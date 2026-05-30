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


def test_generate_with_reference_date(tmp_path):
    result = runner.invoke(app, ["100", "--seed", "42", "--reference-date", "2026-01-15T01:02:03", "-o", str(tmp_path)])
    assert result.exit_code == 0
    assert "2026-01-15" in result.output


def test_generate_output_mentions_seed(tmp_path):
    result = runner.invoke(app, ["100", "--seed", "42", "-o", str(tmp_path)])
    assert result.exit_code == 0
    assert "42" in result.output


def test_generate_invalid_provider(tmp_path):
    result = runner.invoke(app, ["100", "--seed", "42", "--provider", "napster", "-o", str(tmp_path)])
    assert result.exit_code != 0
