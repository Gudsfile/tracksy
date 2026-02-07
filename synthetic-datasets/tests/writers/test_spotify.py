import hashlib
import json
import zipfile
from pathlib import Path
from unittest.mock import patch

from synthetic_datasets.writers.spotify import SpotifyWriter, write_json, write_zip


def test_write_json(tmp_path, streaming_record):
    # given
    out_file = tmp_path / "test.json"
    # when
    write_json(out_file, [streaming_record], False)
    # then
    with open(out_file) as f:
        data = json.load(f)
    assert data == json.loads("[" + streaming_record.model_dump_json() + "]")


def test_write_json_deterministic(tmp_path, streaming_record):
    # given
    path_1 = tmp_path / "test1.zip"
    path_2 = tmp_path / "test2.zip"
    path_3 = tmp_path / "test3.zip"
    # when - create two identical json files
    write_json(path_1, [streaming_record], True)
    write_json(path_2, [streaming_record], True)
    write_json(path_3, [streaming_record], False)
    # then - they should have the same sha (it is acceptable to say they are byte-for-byte identical)
    assert (
        hashlib.sha256(open(path_1, "rb").read()).hexdigest() == hashlib.sha256(open(path_2, "rb").read()).hexdigest()
    )
    assert (
        hashlib.sha256(open(path_1, "rb").read()).hexdigest() != hashlib.sha256(open(path_3, "rb").read()).hexdigest()
    )


def test_write_zip(tmp_path, streaming_record):
    # given
    files = {"file1.json": [streaming_record, streaming_record], "file2.json": [streaming_record]}
    zip_path = tmp_path / "test.zip"
    # when
    write_zip(zip_path, files, base_zipped_folder="folder", deterministic=False)
    # then
    assert zip_path.exists()
    with zipfile.ZipFile(zip_path) as z:
        assert "folder/file1.json" in z.namelist()
        assert "folder/file2.json" in z.namelist()

        file1_content = json.loads(z.read("folder/file1.json").decode())
        file2_content = json.loads(z.read("folder/file2.json").decode())

        assert len(file1_content) == 2
        assert len(file2_content) == 1


def test_write_zip_deterministic(tmp_path, streaming_record):
    # given
    files = {"data.json": [streaming_record]}
    zip_path_1 = tmp_path / "test1.zip"
    zip_path_2 = tmp_path / "test2.zip"
    zip_path_3 = tmp_path / "test3.zip"
    # when - create two identical ZIP files
    write_zip(zip_path_1, files, base_zipped_folder="folder", deterministic=True)
    write_zip(zip_path_2, files, base_zipped_folder="folder", deterministic=True)
    write_zip(zip_path_3, files, base_zipped_folder="folder", deterministic=False)
    # then - they should have the same sha (it is acceptable to say they are byte-for-byte identical)
    assert (
        hashlib.sha256(open(zip_path_1, "rb").read()).hexdigest()
        == hashlib.sha256(open(zip_path_2, "rb").read()).hexdigest()
    )
    assert (
        hashlib.sha256(open(zip_path_1, "rb").read()).hexdigest()
        != hashlib.sha256(open(zip_path_3, "rb").read()).hexdigest()
    )


@patch("synthetic_datasets.writers.spotify.write_json")
@patch("synthetic_datasets.writers.spotify.write_zip")
def test_spotify_writer_write_calls_helpers(mock_write_zip, mock_write_json, streaming_record):
    # given
    writer = SpotifyWriter(output_dir=Path("tmp_path"))
    streaming_records = [streaming_record] * 10
    deterministic = False
    # when
    writer.write(streaming_records, deterministic=deterministic)
    # then
    assert mock_write_json.called
    assert mock_write_json.call_args.args == (
        Path("tmp_path/spotify/streamings_10.json"),
        streaming_records,
        deterministic,
    )
    assert mock_write_zip.called
    assert mock_write_zip.call_args.args == (
        Path("tmp_path/spotify/streamings_10.zip"),
        {"Streaming_History_Audio_2006-2025_1.json": streaming_records},
        "Spotify Extended Streaming History",
        deterministic,
    )
