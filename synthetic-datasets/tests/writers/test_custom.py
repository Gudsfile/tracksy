import csv
from datetime import datetime

from synthetic_datasets.writers.custom import COLUMNS, CustomWriter


def test_write_creates_file(tmp_path, custom_streaming_record):
    writer = CustomWriter(output_dir=tmp_path)
    writer.write([custom_streaming_record])
    assert writer.output_path.exists()


def test_output_filename(tmp_path, custom_streaming_record):
    writer = CustomWriter(output_dir=tmp_path)
    writer.write([custom_streaming_record])
    assert writer.output_path.name == "tracksy-custom.csv"
    assert writer.output_path.parent.name == "custom"


def test_write_csv_headers(tmp_path, custom_streaming_record):
    writer = CustomWriter(output_dir=tmp_path)
    writer.write([custom_streaming_record])
    with open(writer.output_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        assert reader.fieldnames == COLUMNS


def test_write_csv_row_count(tmp_path, custom_streaming_record):
    writer = CustomWriter(output_dir=tmp_path)
    records = [custom_streaming_record] * 5
    writer.write(records)
    with open(writer.output_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        assert len(list(reader)) == 5


def test_write_creates_output_directory(tmp_path, custom_streaming_record):
    nested_dir = tmp_path / "nested" / "output"
    writer = CustomWriter(output_dir=nested_dir)
    writer.write([custom_streaming_record])
    assert writer.output_path.exists()


def test_write_csv_ts_format(tmp_path, custom_streaming_record):
    writer = CustomWriter(output_dir=tmp_path)
    writer.write([custom_streaming_record])
    with open(writer.output_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        row = next(reader)
    ts_str = row["ts"]
    assert ts_str.endswith("Z")
    datetime.strptime(ts_str, "%Y-%m-%dT%H:%M:%SZ")


def test_write_csv_record_values(tmp_path, custom_streaming_record):
    writer = CustomWriter(output_dir=tmp_path)
    writer.write([custom_streaming_record])
    with open(writer.output_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        row = next(reader)
    assert row["track_name"] == custom_streaming_record.track_name
    assert row["artist_name"] == custom_streaming_record.artist_name
    assert row["album_name"] == custom_streaming_record.album_name
    assert row["ms_played"] == str(custom_streaming_record.ms_played)
    assert row["track_uri"] == custom_streaming_record.track_uri
    assert row["platform"] == custom_streaming_record.platform
