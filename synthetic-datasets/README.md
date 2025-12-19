# Tracksy synthetic datasets generator

Generate test datasets to test the Tracksy application during development.

Already generated datasets are available on Hugging Face: [🤗 synthetic-datasets 🤗](https://huggingface.co/datasets/tracksy/synthetic-datasets/tree/main), but you can generate your own with:

```shell
cd synthetic-datasets
uv sync
uv generate 100
```

Find generated datasets in the `datasets` folder.

## 🚀 Project Structure

```text
/
├── datasets/
│   └── # datasets are generated here
├── synthetic_datasets/
│   └── # generator code
└── pyproject.toml
```

## 🧞 Commands

All commands are run from `tracksy/synthetic-datasets/`, from a terminal:

| **Command**                                   | **Action**                                                                                 |
| :---------------------------------------------| :----------------------------------------------------------------------------------------- |
| **`uv sync`**                                 | Installs the project dependencies using [uv](https://docs.astral.sh/uv)                    |
| ----------------------------------------------| ----------------------------------------------------                                       |
| **`uv run generate 100`**                     | Generates datasets for all providers with 100 lines each                                   |
| **`uv run generate 100 spotify`**             | Generates Spotify dataset with 100 lines                                                   |
| **`uv run generate 100 applemusic`**          | Generates Apple Music dataset with 100 lines                                               |
| **`uv run generate 100 deezer`**              | Generates Deezer dataset with 100 lines                                                    |
| `uv run python synthetic_datasets/app.py 100` | Generates datasets with 100 lines                                                          |
| ----------------------------------------------| ----------------------------------------------------                                       |
| **`uv run pytest`**                           | Runs the project tests using [pytest](https://docs.pytest.org)                             |
| **`uv run ruff format`**                      | Formats the files using [Ruff](https://docs.astral.sh/ruff)                                |
| **`uv run ruff check`**                       | Checks file formatting and linting using [Ruff linter](https://docs.astral.sh/ruff/linter) |
| **`uv run ty check`**                         | Checks the project for type errors using [ty](https://docs.astral.sh/ty)                   |

## 📊 Supported Providers

- **Spotify** - Generates `Streaming_History_Audio_*.json` files matching Spotify Extended Streaming History format
- **Apple Music** - Generates `Apple Music - Play History Daily Tracks.csv` matching Apple Music Data & Privacy export format
- **Deezer** - Generates `deezer-data_{user_id}.xlsx` with sheet "10_listeningHistory" matching Deezer GDPR export format
