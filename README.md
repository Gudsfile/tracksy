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

### 🚀 Upload your data

Go to [Tracksy](https://gudsfile.github.io/tracksy/) and upload your file, or hit the demo button.

Your data stays local. Nothing is sent anywhere. You can also [self-host Tracksy](#installation).

### 👀 Visualize your data

Once uploaded, explore interactive graphs about your listening habits. 🎉

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
