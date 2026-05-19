import json
from datetime import datetime
from pathlib import Path
from unittest.mock import patch

from synthetic_datasets.writers.funkwhale import FunkWhaleWriter, _serialize_listen


def test_write_creates_json_file(tmp_path, funkwhale_listen_record):
    writer = FunkWhaleWriter(output_dir=tmp_path, reference_date=datetime(2026, 2, 8))
    writer.write([funkwhale_listen_record])

    out_file = tmp_path / "funkwhale" / "funkwhale-history.json"
    assert out_file.exists()

    data = json.loads(out_file.read_text())
    assert isinstance(data, list)
    assert len(data) == 1


def test_write_correct_fields(tmp_path, funkwhale_listen_record):
    writer = FunkWhaleWriter(output_dir=tmp_path, reference_date=datetime(2026, 2, 8))
    writer.write([funkwhale_listen_record])

    out_file = tmp_path / "funkwhale" / "funkwhale-history.json"
    data = json.loads(out_file.read_text())
    record = data[0]

    assert record["id"] == funkwhale_listen_record.id
    assert "creation_date" in record
    assert "track" in record
    assert record["track"]["title"] == funkwhale_listen_record.track.title
    assert record["track"]["artist"]["name"] == funkwhale_listen_record.track.artist.name
    assert record["track"]["album"]["title"] == funkwhale_listen_record.track.album.title
    assert record["track"]["duration"] == funkwhale_listen_record.track.duration


def test_creation_date_format(tmp_path, funkwhale_listen_record):
    writer = FunkWhaleWriter(output_dir=tmp_path, reference_date=datetime(2026, 2, 8))
    writer.write([funkwhale_listen_record])

    out_file = tmp_path / "funkwhale" / "funkwhale-history.json"
    data = json.loads(out_file.read_text())

    creation_date = data[0]["creation_date"]
    assert creation_date.endswith(".000Z"), f"Expected ISO format ending in .000Z, got: {creation_date}"


def test_write_multiple_records(tmp_path, funkwhale_listen_record):
    records = [funkwhale_listen_record] * 5
    writer = FunkWhaleWriter(output_dir=tmp_path, reference_date=datetime(2026, 2, 8))
    writer.write(records)

    out_file = tmp_path / "funkwhale" / "funkwhale-history.json"
    data = json.loads(out_file.read_text())
    assert len(data) == 5


def test_writer_creates_output_directory(tmp_path, funkwhale_listen_record):
    nested_dir = tmp_path / "nested" / "output"
    writer = FunkWhaleWriter(output_dir=nested_dir, reference_date=datetime(2026, 2, 8))
    writer.write([funkwhale_listen_record])

    out_file = nested_dir / "funkwhale" / "funkwhale-history.json"
    assert out_file.exists()
