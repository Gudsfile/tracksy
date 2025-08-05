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
| :-------------------------------------------- | :----------------------------------------------------------------------------------------- |
| **`uv sync`**                                 | Installs the project dependencies using [uv](https://docs.astral.sh/uv)                    |
| --------------------------------------------- | ----------------------------------------------------                                       |
| **`uv run generate 100`**                     | Generates a dataset with 100 lines                                                         |
| `uv run python synthetic_datasets/app.py 100` | Generates a dataset with 100 lines                                                         |
| --------------------------------------------- | ----------------------------------------------------                                       |
| **`uv run pytest`**                           | Runs the project tests using [pytest](https://docs.pytest.org)                             |
| **`uv run ruff format`**                      | Formats the files using [Ruff](https://docs.astral.sh/ruff)                                |
| **`uv run ruff check`**                       | Checks file formatting and linting using [Ruff linter](https://docs.astral.sh/ruff/linter) |
| **`uv run ty check`**                         | Checks the project for type errors using [ty](https://docs.astral.sh/ty)                   |
