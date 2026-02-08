# Tracksy synthetic datasets generator

Generate test datasets to test the Tracksy application during development.

Already generated datasets are available on Hugging Face: [🤗 synthetic-datasets 🤗](https://huggingface.co/datasets/tracksy/synthetic-datasets/tree/main), but you can generate your own with:

## ⏩ Quick Start

Run the generator locally with:

```bash
moon setup
moon run synthetic-datasets:generate -- 100
```

Find generated datasets in the `datasets` folder.

More details in [CONTRIBUTING.md development section](CONTRIBUTING.md#development)

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
