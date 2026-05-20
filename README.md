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

- 🎵 Supports **Spotify** and **Deezer** streaming history
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
<summary>Apple Music ⚠️ Experimental</summary>
<br>

> **Warning**
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
<summary>Any other source</summary>
<br>

Tracksy accepts data from **any source** as long as you format it as a CSV with the following columns:

| Column        | Type                | Description                      | Example                      |
| ------------- | ------------------- | -------------------------------- | ---------------------------- |
| `ts`          | ISO 8601 UTC string | Start of play                    | `2024-03-15T14:30:00.000Z`   |
| `track_name`  | string              | Song title                       | `Never Gonna Give You Up`    |
| `artist_name` | string              | Artist (empty string if unknown) | `Rick Astley`                |
| `album_name`  | string              | Album (empty string if unknown)  | `Whenever You Need Somebody` |
| `ms_played`   | integer ≥ 0         | Milliseconds played              | `213000`                     |
| `track_uri`   | string              | Stable unique ID for the track   | `custom:rick-astley:ngru`    |
| `platform`    | string              | Source label                     | `tidal`                      |

Save the file as **`tracksy-custom.csv`** (exact name required) and upload it to Tracksy.

> Records with `ms_played < 30000` (less than 30 seconds) are filtered automatically.
> Use any stable string for `track_uri` — `custom:{artist}:{title}` works fine.

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
| [`synthetic-datasets/`](synthetic-datasets/) | Generates synthetic Spotify/Deezer streaming histories for testing. |

## Installation

```bash
moon setup       # download Node.js, Python, and dependencies
moon run app:dev # start the dev server
```

More details in the [CONTRIBUTING.md development section](CONTRIBUTING.md#development).

## Roadmap

Tracksy is under active development. On the horizon:

- More visualizations and a simplified view for non-technical users
- Support for additional data sources (Apple Music, Funkwhale, etc.)

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
