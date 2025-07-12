# Tracksy synthetic datasets generator

Generate test data sets to test the Tracksy application during development.

Already generated datasets are available on Hugging Face : [synthetic-datasets](https://huggingface.co/datasets/tracksy-app/synthetic-datasets).
But you can generate your own with this project and find them in the `datasets` folder.

## 🚀 Project Structure

```text
/
├── datasets/
├── synthetic_datasets/
│   └── <filename>.py
└── pyproject.toml
```

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                                              | Action                                           |
| :--------------------------------------------------- | :----------------------------------------------- |
| `uv sync`                                            | Installs dependencies                            |
| `uv run hello 10`                                    | Generates a ten lines dataset                    |
