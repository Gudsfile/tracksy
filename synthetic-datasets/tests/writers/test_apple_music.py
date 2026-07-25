import csv
import io
from datetime import datetime
from zipfile import ZipFile

from synthetic_datasets.models.apple_music import AppleMusicRecord
from synthetic_datasets.writers.apple_music import (
    ACTIVITY_FOLDER,
    COLUMNS,
    COMBINED_BATCHES,
    COMBINED_ZIP_NAME,
    CSV_NAME,
    EXPORT_ZIP_NAME,
    EXPORT_ZIP_STEM,
    MEDIA_SERVICES_ZIP_NAME,
    AppleMusicWriter,
)


def _open_media_services_zip(export_zip: ZipFile) -> ZipFile:
    """Given a language_dependent_name.zip, return its inner Apple_Media_Services.zip."""
    assert export_zip.namelist() == [MEDIA_SERVICES_ZIP_NAME]
    inner_bytes = export_zip.read(MEDIA_SERVICES_ZIP_NAME)
    return ZipFile(io.BytesIO(inner_bytes))


def _read_csv_rows(export_zip: ZipFile) -> list[dict[str, str]]:
    media_zip = _open_media_services_zip(export_zip)
    csv_bytes = media_zip.read(f"{ACTIVITY_FOLDER}/{CSV_NAME}")
    reader = csv.DictReader(io.StringIO(csv_bytes.decode("utf-8")))
    return list(reader)


def _read_flat_csv_rows(path) -> list[dict[str, str]]:
    with open(path, encoding="utf-8") as f:
        return list(csv.DictReader(f))


# --- outputs are always all three -------------------------------------------------


def test_write_creates_all_three_outputs(tmp_path, apple_music_record):
    # given
    writer = AppleMusicWriter(output_dir=tmp_path, reference_date=datetime(2026, 2, 8))
    # when
    writer.write([apple_music_record])
    # then
    assert writer.csv_path.exists()
    assert writer.csv_path.name == CSV_NAME
    assert writer.csv_path.parent.name == "apple_music"
    assert writer.export_zip_path.exists()
    assert writer.export_zip_path.name == EXPORT_ZIP_NAME
    assert writer.combined_zip_path.exists()
    assert writer.combined_zip_path.name == COMBINED_ZIP_NAME


def test_write_creates_output_directory(tmp_path, apple_music_record):
    # given
    nested_dir = tmp_path / "nested" / "output"
    writer = AppleMusicWriter(output_dir=nested_dir, reference_date=datetime(2026, 2, 8))
    # when
    writer.write([apple_music_record])
    # then
    assert writer.csv_path.exists()
    assert writer.export_zip_path.exists()
    assert writer.combined_zip_path.exists()


# --- flat CSV ---------------------------------------------------------------------


def test_flat_csv_headers(tmp_path, apple_music_record):
    # given
    writer = AppleMusicWriter(output_dir=tmp_path, reference_date=datetime(2026, 2, 8))
    # when
    writer.write([apple_music_record])
    # then
    with open(writer.csv_path, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        assert reader.fieldnames == COLUMNS


def test_flat_csv_row_count(tmp_path, apple_music_record):
    # given
    writer = AppleMusicWriter(output_dir=tmp_path, reference_date=datetime(2026, 2, 8))
    num_records = 5
    records = [apple_music_record] * num_records
    # when
    writer.write(records)
    # then
    assert len(_read_flat_csv_rows(writer.csv_path)) == num_records


def test_flat_csv_record_values(tmp_path, apple_music_record):
    # given
    writer = AppleMusicWriter(output_dir=tmp_path, reference_date=datetime(2026, 2, 8))
    # when
    writer.write([apple_music_record])
    # then
    row = _read_flat_csv_rows(writer.csv_path)[0]
    assert row["Song Name"] == apple_music_record.song_name
    assert row["Album Name"] == apple_music_record.album_name
    assert row["Media Type"] == apple_music_record.media_type
    assert row["Play Duration Milliseconds"] == str(apple_music_record.play_duration_ms)
    assert row["Container Artist Name"] == ""
    assert row["Device Type"] == apple_music_record.device_type
    assert row["Container Origin Type"] == ""


def test_flat_csv_timestamp_format(tmp_path, apple_music_record):
    # given
    writer = AppleMusicWriter(output_dir=tmp_path, reference_date=datetime(2026, 2, 8))
    # when
    writer.write([apple_music_record])
    # then
    row = _read_flat_csv_rows(writer.csv_path)[0]
    parsed = datetime.strptime(row["Event Start Timestamp"], "%Y-%m-%dT%H:%M:%S.000Z")
    assert parsed is not None


# --- single nested export ZIP -----------------------------------------------------


def test_export_zip_nested_structure(tmp_path, apple_music_record):
    # given
    writer = AppleMusicWriter(output_dir=tmp_path, reference_date=datetime(2026, 2, 8))
    # when
    writer.write([apple_music_record])
    # then: language_dependent_name.zip -> Apple_Media_Services.zip -> folder/csv
    with ZipFile(writer.export_zip_path) as export_zip:
        assert export_zip.namelist() == [MEDIA_SERVICES_ZIP_NAME]
        media_zip = _open_media_services_zip(export_zip)
        assert media_zip.namelist() == [f"{ACTIVITY_FOLDER}/{CSV_NAME}"]


def test_export_zip_holds_all_records(tmp_path, apple_music_record):
    # given
    writer = AppleMusicWriter(output_dir=tmp_path, reference_date=datetime(2026, 2, 8))
    records = [apple_music_record] * 7
    # when
    writer.write(records)
    # then
    with ZipFile(writer.export_zip_path) as export_zip:
        rows = _read_csv_rows(export_zip)
    assert len(rows) == len(records)
    assert list(rows[0].keys()) == COLUMNS
    assert rows[0]["Song Name"] == apple_music_record.song_name


# --- combined multi-batch ZIP -----------------------------------------------------


def test_combined_zip_has_fixed_number_of_batches(tmp_path, apple_music_record):
    # given
    writer = AppleMusicWriter(output_dir=tmp_path, reference_date=datetime(2026, 2, 8))
    records = [apple_music_record] * (COMBINED_BATCHES * 3)
    # when
    writer.write(records)
    # then: a_zip_file.zip -> [language_dependent_name - Part 1 of N.zip; ...; Part N of N.zip]
    with ZipFile(writer.combined_zip_path) as combined:
        names = combined.namelist()
        assert names == [
            f"{EXPORT_ZIP_STEM} - Part {i} of {COMBINED_BATCHES}.zip" for i in range(1, COMBINED_BATCHES + 1)
        ]
        total_rows = 0
        for name in names:
            with ZipFile(io.BytesIO(combined.read(name))) as export_zip:
                # every batch is itself a valid nested export with a readable CSV
                total_rows += len(_read_csv_rows(export_zip))
    assert total_rows == len(records)


def test_combined_zip_batches_are_disjoint_and_cover_all_records(tmp_path):
    # given records tagged by a unique song name so batches can be checked for overlap
    records = [
        AppleMusicRecord(
            event_start_timestamp=datetime.fromisoformat("2020-08-07T11:48:23"),
            song_name=f"song-{i}",
            album_name="album",
            media_type="AUDIO",
            play_duration_ms=1000,
            device_type="IPHONE",
            container_origin_type=None,
        )
        for i in range(10)
    ]
    writer = AppleMusicWriter(output_dir=tmp_path, reference_date=datetime(2026, 2, 8))
    # when
    writer.write(records)
    # then
    seen: list[str] = []
    counts: list[int] = []
    with ZipFile(writer.combined_zip_path) as combined:
        for name in combined.namelist():
            with ZipFile(io.BytesIO(combined.read(name))) as export_zip:
                rows = _read_csv_rows(export_zip)
                counts.append(len(rows))
                seen.extend(row["Song Name"] for row in rows)
    # batch sizes derive from the constant so the test survives a change to COMBINED_BATCHES
    base, rem = divmod(len(records), COMBINED_BATCHES)
    assert counts == [base + 1] * rem + [base] * (COMBINED_BATCHES - rem)
    # disjoint slices whose union is exactly the full set
    assert len(seen) == len(set(seen)) == len(records)
    assert set(seen) == {f"song-{i}" for i in range(10)}


def test_combined_zip_handles_fewer_records_than_batches(tmp_path, apple_music_record):
    # given fewer records than batches, so the split yields empty batches (n=1 -> [1, 0, 0])
    records = [apple_music_record]
    assert len(records) < COMBINED_BATCHES
    writer = AppleMusicWriter(output_dir=tmp_path, reference_date=datetime(2026, 2, 8))
    # when
    writer.write(records)
    # then
    seen: list[str] = []
    counts: list[int] = []
    with ZipFile(writer.combined_zip_path) as combined:
        names = combined.namelist()
        # still exactly COMBINED_BATCHES nested exports, even though some hold no records
        assert names == [
            f"{EXPORT_ZIP_STEM} - Part {i} of {COMBINED_BATCHES}.zip" for i in range(1, COMBINED_BATCHES + 1)
        ]
        for name in names:
            with ZipFile(io.BytesIO(combined.read(name))) as export_zip:
                # each batch is a valid nested export: ..._K.zip -> Apple_Media_Services.zip -> folder/csv
                assert export_zip.namelist() == [MEDIA_SERVICES_ZIP_NAME]
                media_zip = _open_media_services_zip(export_zip)
                assert media_zip.namelist() == [f"{ACTIVITY_FOLDER}/{CSV_NAME}"]
                csv_bytes = media_zip.read(f"{ACTIVITY_FOLDER}/{CSV_NAME}")
                reader = csv.DictReader(io.StringIO(csv_bytes.decode("utf-8")))
                # even an empty batch is a valid header-only CSV (header present, no crash)
                assert reader.fieldnames == COLUMNS
                rows = list(reader)
                counts.append(len(rows))
                seen.extend(row["Song Name"] for row in rows)
    # the batches with no records produce header-only CSVs with 0 data rows
    assert counts.count(0) == COMBINED_BATCHES - len(records)
    # the disjoint union across batches is exactly the full input set
    assert len(seen) == len(set(seen)) == len(records)
    assert set(seen) == {r.song_name for r in records}


# --- determinism ------------------------------------------------------------------


def test_outputs_are_deterministic(tmp_path, apple_music_record):
    # given identical inputs and reference date
    ref = datetime(2026, 2, 8, 12, 30, 15)
    writer_a = AppleMusicWriter(output_dir=tmp_path / "a", reference_date=ref)
    writer_b = AppleMusicWriter(output_dir=tmp_path / "b", reference_date=ref)
    records = [apple_music_record] * 5
    # when
    writer_a.write(records)
    writer_b.write(records)
    # then
    assert writer_a.csv_path.read_bytes() == writer_b.csv_path.read_bytes()
    assert writer_a.export_zip_path.read_bytes() == writer_b.export_zip_path.read_bytes()
    assert writer_a.combined_zip_path.read_bytes() == writer_b.combined_zip_path.read_bytes()
