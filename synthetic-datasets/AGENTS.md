# Synthetic Datasets — AGENTS.md

Python scripts for synthetic music streaming history generation.

[Root AGENTS.md](../AGENTS.md)

## Generate

Supported providers: `spotify`, `deezer`, `apple-music`, `custom` (default: `spotify`).

```bash
moon run synthetic-datasets:generate -- 100 --provider spotify                     # single provider
moon run synthetic-datasets:generate -- 100 --provider spotify --provider deezer   # multiple providers
moon run synthetic-datasets:generate -- 100 --all-providers                        # all providers
moon run synthetic-datasets:generate -- --seed 42                                  # deterministic output
moon run synthetic-datasets:generate -- --help                                     # full options + valid values
```

For raw uv commands (adding deps, etc.) — use sparingly:

```bash
moon run synthetic-datasets:uv -- add <package>
```

## Testing and Quality

```bash
moon run synthetic-datasets:test          # pytest
moon run synthetic-datasets:lint          # Ruff lint
moon run synthetic-datasets:lint-fix      # Auto-fix lint
moon run synthetic-datasets:format        # Ruff format
moon run synthetic-datasets:format-check  # Check format
moon run synthetic-datasets:typecheck     # ty type-check
```

All checks must pass before committing.

## Structure

| Path | Purpose |
|------|---------|
| `synthetic_datasets/` | Core generation library |
| `tests/` | pytest test suite |
| `datasets/` | Generated output (gitignored) |
