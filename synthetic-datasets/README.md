# Tracksy synthetic datasets generator

[![uv](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/astral-sh/uv/main/assets/badge/v0.json)](https://github.com/astral-sh/uv) [![Ruff](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/astral-sh/ruff/main/assets/badge/v2.json)](https://github.com/astral-sh/ruff) [![ty](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/astral-sh/ty/main/assets/badge/v0.json)](https://github.com/astral-sh/ty)

Generate test datasets to test the Tracksy application during development.

Already generated datasets are available on Hugging Face: [🤗 synthetic-datasets 🤗](https://huggingface.co/datasets/tracksy/synthetic-datasets/tree/main). You can also generate your own:

## ⏩ Quick Start

Run the generator locally with:

```bash
moon setup
moon run synthetic-datasets:generate -- 100
```

Find generated datasets in the `datasets` folder.

More details in [CONTRIBUTING.md development section](../CONTRIBUTING.md#development)

## 🚀 Project Structure

```text
/
├── datasets/
│   └── # datasets are generated here
├── synthetic_datasets/
│   └── # generator code
└── pyproject.toml
```

## 📚 Help

View available options:

```bash
moon run synthetic-datasets:generate -- --help
```

## 🎯 Reproducible Generation

The generator supports seed-based reproducible generation for consistent test results.

Generate with specific seed for reproducibility:

```bash
moon run synthetic-datasets:generate -- 100 --seed 42
```

Generate dataset specifically for e2e tests (uses a fixed seed and number of records):

```bash
moon run synthetic-datasets:generate-e2e
```

## 🔒 E2E Dataset Integrity Check

The CI verifies that `generate-e2e` produces byte-for-byte identical output across runs. The SHA256 hashes of both output files are hardcoded in `datasets-test-synthetic.yml`.

If the hash check fails, it means the generator output changed. Before updating the expected hashes:

1. Identify what caused the change (generator logic, seed, library version bump, etc.)
2. Determine if the change is intentional
3. If yes: update `EXPECTED_JSON_HASH` and `EXPECTED_ZIP_HASH` in `datasets-test-synthetic.yml` with the new hashes printed in the CI logs, and justify the change in the PR description
4. If no: fix the generator so it produces the expected output again
