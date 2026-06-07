<div align="center">

# Tracksy

**Visualize and understand how you listen to music, without sharing your data.**

The same old song? Late at night? Only in summer? Tracksy helps you answer these questions.

[![Astro](https://img.shields.io/badge/-Astro-AF56E6?logo=Astro&logoColor=FFFFFF&label=Built%20with&labelColor=000000)](https://github.com/withastro/astro) [![DuckDB](https://img.shields.io/badge/-DuckDB-FCF550?logo=DuckDB&label=Powered%20by&labelColor=000000)](https://github.com/duckdb/duckdb) [![Datasets](https://img.shields.io/badge/-available-F8D44E?logo=Hugging%20Face&label=Datasets&labelColor=000000)](https://huggingface.co/datasets/tracksy/synthetic-datasets)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE) [![Deploy](https://github.com/gudsfile/tracksy/actions/workflows/app-deploy-live.yml/badge.svg)](https://github.com/gudsfile/tracksy/actions/workflows/app-deploy-live.yml) [![Datasets CI](https://github.com/gudsfile/tracksy/actions/workflows/datasets-generate-synthetic.yml/badge.svg)](https://github.com/gudsfile/tracksy/actions/workflows/datasets-generate-synthetic.yml)

![Tracksy demo](.github/img/tracksy_demo.gif)

</div>

---

Tracksy is a **privacy-first** music streaming data visualization tool. All processing happens in your browser. Your data never leaves your device.

- 🎵 Supports **Spotify**, **Deezer**, and **any source** via custom CSV
- 🦆 Powered by **DuckDB WASM**: SQL in the browser, zero server
- 🔒 **No account. No upload. No tracking.**

## Usage

### ⬇️ Download your data

**You can skip this step** and use the demo button on the home page to explore with pre-generated data.

Or bring your own data:

<details>
<summary>Spotify</summary>
<br>

1. Request your data on [your Spotify account](https://www.spotify.com/account/privacy/)
   - Select "_Extended streaming history_"
   - Click "_Request data_"
   - **Confirm** via the email from Spotify
2. Wait a few days
3. Download the `.zip` file from the email

</details>

<details>
<summary>Deezer</summary>
<br>

1. Request your data on [your Deezer account](https://www.deezer.com)
   - Go to "_Account settings_"
   - Scroll to "_My personal data_"
   - Click "_Request my data_"
   - **Confirm** by entering the code sent by email
2. Wait a few days
3. Download the `.xlsx` file from the email

</details>

<details>
<summary>Apple Music (experimental)</summary>
<br>

> [!IMPORTANT]
> Apple Music support is experimental. The export format has significant limitations: artist name is not included in the data, which means artist-based charts will not populate. Some data quality issues may affect visualizations. Use at your own discretion.

1. Sign in at [privacy.apple.com](https://privacy.apple.com) and request a copy of your data.
  - Click "_Request a copy of your data_"
  - Select "_Apple Media Services information_" in the data categories
  - Submit the request
2. Wait a few days
3. Download and extract the ZIP you receive by email
4. Inside the archive, navigate to `Apple Music Activity/` and find `Apple Music Play Activity.csv`.
5. If the data is in a nested ZIP (e.g. `Apple_Media_Services.zip`), upload the outer ZIP directly, Tracksy extracts it automatically.

</details>

<details>
<summary>JellyFin (experimental)</summary>
<br>

**Requires the [Playback Reporting plugin](https://github.com/jellyfin/jellyfin-plugin-playbackreporting).**

1. In JellyFin, go to "_Dashboard_" > "_Plugins_" and install "Playback Reporting" if not already installed
2. After some listening activity has been recorded, go to "_Dashboard_" > "_Playback Report_"
3. Click "_Export as CSV_" to download `playback_report.csv`

> [!IMPORTANT]
> Artist and album names are not included in the plugin export. Charts based on artist or album will not be populated for JellyFin data.

</details>

<details>
<summary>Any other source</summary>
<br>

Tracksy accepts data from **any source** as long as you format it as a CSV with the following columns:

| Column        | Type                | Description                      | Example                      |
| ------------- | ------------------- | -------------------------------- | ---------------------------- |
| `ts`          | ISO 8601 UTC string | Start of play                    | `2024-03-15T14:30:00.000Z`   |
| `track_name`  | string              | Song title                       | `Le vent se lève`            |
| `artist_name` | string              | Artist (empty string if unknown) | `Veridis Project`            |
| `album_name`  | string              | Album (empty string if unknown)  | `Voir le soleil`             |
| `ms_played`   | integer ≥ 0         | Milliseconds played              | `213000`                     |
| `track_uri`   | string              | Stable identifier (any unique string) | `custom:veridis-project:le-vent-se-leve` |
| `platform`    | string              | Source label                     | `tidal`                      |

Save the file as **`tracksy-custom.csv`** (exact name required) and upload it to Tracksy.

> [!NOTE]
>
> Records with `ms_played < 30000` (less than 30 seconds) are filtered automatically.
>
> Use any stable string for `track_uri` - `custom:{artist}:{title}` works fine.

#### Example

```csv
ts,track_name,artist_name,album_name,ms_played,track_uri,platform
2024-03-15T14:30:00.000Z,Le vent se lève,Veridis Project,Voir le soleil,213000,custom:veridis-project:le-vent-se-leve,tidal
2024-03-15T14:33:53.000Z,Veridis Quo,Daft Punk,Discovery,243000,custom:daft-punk:veridis-quo,tidal
2024-03-15T14:38:06.000Z,my dey,Zubi,Dear Z,120000,custom:zubi:my-dey,tidal
```

#### Convert with a spreadsheet editor

Works with Excel, Google Sheets, LibreOffice Calc, or any equivalent.

1. Open your export file in your spreadsheet editor.
2. Rename each column header to match the required names: `ts`, `track_name`, `artist_name`, `album_name`, `ms_played`, `track_uri`, `platform`.
3. Make sure `ts` is formatted as ISO 8601 UTC (e.g. `2024-03-15T14:30:00.000Z`). If it is a date/time cell, format it as plain text first.
4. If your source has no unique track ID, add a `track_uri` column with a formula like `="custom:"&[artist column]&":"&[title column]`.
5. Delete rows where the play duration is under 30 seconds (30 000 ms).
6. Export as CSV with UTF-8 encoding.
7. Rename the saved file to `tracksy-custom.csv`.

#### Convert with DuckDB CLI

If your source data is already in CSV or JSON, [DuckDB CLI](https://duckdb.org/docs/installation/) can reshape it in one query:

```sql
COPY (
    SELECT
        your_timestamp_col                                        AS ts,
        your_title_col                                            AS track_name,
        your_artist_col                                           AS artist_name,
        your_album_col                                            AS album_name,
        your_duration_ms_col                                      AS ms_played,
        'custom:' || your_artist_col || ':' || your_title_col     AS track_uri,
        'my-source'                                               AS platform
    FROM read_csv('your-export.csv', header = true)
    WHERE your_duration_ms_col >= 30000
) TO 'tracksy-custom.csv' (HEADER, DELIMITER ',');
```

Replace `read_csv` with `read_json`, `read_xlsx` [or other](https://duckdb.org/docs/current/data/data_sources) depending on your source.

</details>

### 🚀 Upload your data

Go to [Tracksy](https://gudsfile.github.io/tracksy/) and upload your file, or hit the demo button.

Your data stays local. Nothing is sent anywhere. You can also [self-host Tracksy](#installation).

### 👀 Visualize your data

Once uploaded, explore your listening habits across four views:

| View | Description |
|------|-------------|
| ✨ **Simple** | Curated and guided overview of your listening data |
| 🔬 **Lab** | Experimental insights and advanced visualizations |
| 💬 **Chat** | Conversational exploration using a built-in LLM |
| ⌨️ **Query** | Direct SQL-based exploration of the dataset |

## Project Structure

```text
/
├── app/                  # Astro + React frontend (DuckDB WASM)
├── blog/                 # Hugo static blog (ADRs and technical notes)
├── e2e/                  # Playwright end-to-end tests
└── synthetic-datasets/   # Python scripts for generating test data
```

| Directory | Description |
|-----------|-------------|
| [`app/`](app/) | Frontend. DuckDB WASM processes data client-side; nothing reaches a server. |
| [`blog/`](blog/) | Static blog with architectural decision records. |
| [`e2e/`](e2e/) | End-to-end test suite built with Playwright. |
| [`synthetic-datasets/`](synthetic-datasets/) | Generates synthetic Spotify/Deezer/Apple Music/Custom streaming histories for testing. |

## Installation

```bash
moon setup       # download Node.js, Python, and dependencies
moon run app:dev # start the dev server
```

More details in the [CONTRIBUTING.md development section](CONTRIBUTING.md#development).

## Roadmap

Tracksy is under active development. On the horizon:

- More visualizations and a simplified view for non-technical users
- Support for additional data sources (Funkwhale, etc.)

See [open issues](https://github.com/Gudsfile/tracksy/issues) for the full list.

## Contributing

Contributions are welcome! Open an issue or a pull request (read [CONTRIBUTING.md](CONTRIBUTING.md) first).

If you would like to be added to or removed from the contributors list, feel free to open an issue or a PR.

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Tarektouati"><img src="https://avatars.githubusercontent.com/u/19335073?v=4" width="100px;" alt=""/><br /><sub><b>Tarek Touati</b></sub></a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/bengeois"><img src="https://avatars.githubusercontent.com/u/20949060?v=4" width="100px;" alt=""/><br /><sub><b>Benjamin</b></sub></a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/noancloarec"><img src="https://avatars.githubusercontent.com/u/15016365?v=4" width="100px;" alt=""/><br /><sub><b>noancloarec</b></sub></a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://jeanphi-baconnais.gitlab.io/"><img src="https://avatars.githubusercontent.com/u/32639372?v=4" width="100px;" alt=""/><br /><sub><b>Jean-Phi Baconnais</b></sub></a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/arthurzenika"><img src="https://avatars.githubusercontent.com/u/445200?v=4" width="100px;" alt=""/><br /><sub><b>Arthur Lutz</b></sub></a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
