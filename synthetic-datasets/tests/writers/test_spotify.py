import json
from pathlib import Path
from unittest.mock import patch

from synthetic_datasets.writers.spotify import SpotifyWriter, write_json, write_zip


def test_write_json(tmp_path, streaming_record):
    # given
    out_file = tmp_path / "test.json"
    # when
    write_json(out_file, [streaming_record])
    # then
    with open(out_file) as f:
        data = json.load(f)
    assert data == json.loads("[" + streaming_record.model_dump_json() + "]")


@patch("synthetic_datasets.writers.spotify.write_json", wraps=write_json)
def test_write_zip(spy_write_json, tmp_path, streaming_record):
    # given
    files = {"file1.json": [streaming_record, streaming_record], "file2.json": [streaming_record]}
    zip_path = tmp_path / "test.zip"
    # when
    write_zip(zip_path, files, base_zipped_folder="folder")
    # then
    assert spy_write_json.call_count == 2
    assert spy_write_json.call_args_list[0].args == (
        Path(f"{tmp_path}/temp_json_files/file1.json"),
        [streaming_record, streaming_record],
    )
    assert spy_write_json.call_args_list[1].args == (Path(f"{tmp_path}/temp_json_files/file2.json"), [streaming_record])

    import zipfile

    with zipfile.ZipFile(zip_path) as z:
        assert "folder/file1.json" in z.namelist()
        assert "folder/file2.json" in z.namelist()


@patch("synthetic_datasets.writers.spotify.write_json")
@patch("synthetic_datasets.writers.spotify.write_zip")
def test_spotify_writer_write_calls_helpers(mock_write_zip, mock_write_json, streaming_record):
    # given
    writer = SpotifyWriter(output_dir=Path("tmp_path"))
    streaming_records = [streaming_record] * 10
    # when
    writer.write(streaming_records)
    # then
    assert mock_write_json.called
    assert mock_write_json.call_args.args == (Path("tmp_path/spotify/Streaming_History_Audio_2006-2025_10.json"), streaming_records)
    assert mock_write_zip.called
    assert mock_write_zip.call_args.args == (
        Path("tmp_path/spotify/streamings_10.zip"),
        {"Streaming_History_Audio_2006-2025_1.json": streaming_records},
        "Spotify Extended Streaming History",
    )
