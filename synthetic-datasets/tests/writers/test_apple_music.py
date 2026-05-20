import csv
from datetime import datetime

from synthetic_datasets.writers.apple_music import COLUMNS, AppleMusicWriter


def test_write_creates_file(tmp_path, apple_music_record):
    # given
    reference_date = datetime(2026, 2, 8)
    writer = AppleMusicWriter(output_dir=tmp_path, reference_date=reference_date)
    # when
    writer.write([apple_music_record])
    # then
    assert writer.output_path.exists()


def test_write_csv_headers(tmp_path, apple_music_record):
    # given
    writer = AppleMusicWriter(output_dir=tmp_path, reference_date=datetime(2026, 2, 8))
    # when
    writer.write([apple_music_record])
    # then
    with open(writer.output_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        assert reader.fieldnames == COLUMNS


def test_write_csv_row_count(tmp_path, apple_music_record):
    # given
    writer = AppleMusicWriter(output_dir=tmp_path, reference_date=datetime(2026, 2, 8))
    num_records = 5
    records = [apple_music_record] * num_records
    # when
    writer.write(records)
    # then
    with open(writer.output_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = list(reader)
    assert len(rows) == num_records


def test_write_csv_timestamp_format(tmp_path, apple_music_record):
    # given
    writer = AppleMusicWriter(output_dir=tmp_path, reference_date=datetime(2026, 2, 8))
    # when
    writer.write([apple_music_record])
    # then
    with open(writer.output_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        row = next(reader)
    ts_str = row["Event Start Timestamp"]
    parsed = datetime.strptime(ts_str, "%Y-%m-%dT%H:%M:%S.000Z")
    assert parsed is not None


def test_write_creates_output_directory(tmp_path, apple_music_record):
    # given
    nested_dir = tmp_path / "nested" / "output"
    writer = AppleMusicWriter(output_dir=nested_dir, reference_date=datetime(2026, 2, 8))
    # when
    writer.write([apple_music_record])
    # then
    assert writer.output_path.exists()


def test_write_csv_output_path(tmp_path, apple_music_record):
    # given
    writer = AppleMusicWriter(output_dir=tmp_path, reference_date=datetime(2026, 2, 8))
    # then
    assert writer.output_path.name == "Apple Music Play Activity.csv"
    assert writer.output_path.parent.name == "apple_music"


def test_write_csv_record_values(tmp_path, apple_music_record):
    # given
    writer = AppleMusicWriter(output_dir=tmp_path, reference_date=datetime(2026, 2, 8))
    # when
    writer.write([apple_music_record])
    # then
    with open(writer.output_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        row = next(reader)
    assert row["Song Name"] == apple_music_record.song_name
    assert row["Media Type"] == apple_music_record.media_type
    assert row["Play Duration Milliseconds"] == str(apple_music_record.play_duration_ms)
    assert row["Container Artist Name"] == ""
