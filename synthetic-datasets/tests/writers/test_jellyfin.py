import csv
from datetime import datetime

from synthetic_datasets.writers.jellyfin import COLUMNS, JellyFinWriter


def test_write_creates_file(tmp_path, jellyfin_record):
    # given
    reference_date = datetime(2026, 2, 8)
    writer = JellyFinWriter(output_dir=tmp_path, reference_date=reference_date)
    # when
    writer.write([jellyfin_record])
    # then
    assert writer.output_path.exists()


def test_write_csv_headers(tmp_path, jellyfin_record):
    # given
    reference_date = datetime(2026, 2, 8)
    writer = JellyFinWriter(output_dir=tmp_path, reference_date=reference_date)
    # when
    writer.write([jellyfin_record])
    # then
    with open(writer.output_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        assert reader.fieldnames == COLUMNS


def test_write_csv_row_count(tmp_path, jellyfin_record):
    # given
    reference_date = datetime(2026, 2, 8)
    writer = JellyFinWriter(output_dir=tmp_path, reference_date=reference_date)
    num_records = 5
    records = [jellyfin_record] * num_records
    # when
    writer.write(records)
    # then
    with open(writer.output_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = list(reader)
    assert len(rows) == num_records


def test_write_csv_date_format(tmp_path, jellyfin_record):
    # given
    reference_date = datetime(2026, 2, 8)
    writer = JellyFinWriter(output_dir=tmp_path, reference_date=reference_date)
    # when
    writer.write([jellyfin_record])
    # then
    with open(writer.output_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        row = next(reader)
    # Expected format: "YYYY-MM-DD HH:MM:SS"
    date_str = row["DateCreated"]
    parsed = datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S")
    assert parsed is not None


def test_write_creates_output_directory(tmp_path, jellyfin_record):
    # given
    nested_dir = tmp_path / "nested" / "output"
    writer = JellyFinWriter(output_dir=nested_dir, reference_date=datetime(2026, 2, 8))
    # when
    writer.write([jellyfin_record])
    # then
    assert writer.output_path.exists()


def test_write_csv_output_path_is_playback_report(tmp_path, jellyfin_record):
    # given
    writer = JellyFinWriter(output_dir=tmp_path, reference_date=datetime(2026, 2, 8))
    # then
    assert writer.output_path.name == "playback_report.csv"
    assert writer.output_path.parent.name == "jellyfin"


def test_write_csv_record_values(tmp_path, jellyfin_record):
    # given
    writer = JellyFinWriter(output_dir=tmp_path, reference_date=datetime(2026, 2, 8))
    # when
    writer.write([jellyfin_record])
    # then
    with open(writer.output_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        row = next(reader)
    assert row["UserId"] == jellyfin_record.user_id
    assert row["ItemId"] == jellyfin_record.item_id
    assert row["ItemType"] == jellyfin_record.item_type
    assert row["ItemName"] == jellyfin_record.item_name
    assert row["PlaybackMethod"] == jellyfin_record.playback_method
    assert row["ClientName"] == jellyfin_record.client_name
    assert row["DeviceName"] == jellyfin_record.device_name
    assert row["PlayDuration"] == str(jellyfin_record.play_duration)
