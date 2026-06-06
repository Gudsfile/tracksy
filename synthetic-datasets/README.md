# Tracksy synthetic datasets generator

[![uv](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/astral-sh/uv/main/assets/badge/v0.json)](https://github.com/astral-sh/uv) [![Ruff](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/astral-sh/ruff/main/assets/badge/v2.json)](https://github.com/astral-sh/ruff) [![ty](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/astral-sh/ty/main/assets/badge/v0.json)](https://github.com/astral-sh/ty)

Generates deterministic synthetic streaming history for Tracksy testing and demo.

Already generated datasets are available on Hugging Face: [🤗 synthetic-datasets 🤗](https://huggingface.co/datasets/tracksy/synthetic-datasets/tree/main). You can also generate your own:

## ⏩ Quick Start

Run the generator locally with:

```bash
moon setup
moon run synthetic-datasets:generate -- 1000 --provider spotify
```

Find generated datasets in the `datasets` folder. Load the output file in the Tracksy app and inspect charts.

More details on installing `moon` in [CONTRIBUTING.md development section](../CONTRIBUTING.md#development)

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

## 🚶 Persona system

Each generated dataset spans five consecutive years driven by persona profiles:

| Position | Persona | Characteristic |
|---|---|---|
| 0-3 (shuffled) | NIGHT_OWL | Late-night, high skip, marathon sessions |
| 0-3 (shuffled) | MORNING_COMMUTER | Commute peaks, low skip, express sessions |
| 0-3 (shuffled) | SETTLED_LISTENER | Afternoon background, very low skip |
| 4 (always) | CURRENT_ERA | Partial year up to reference date |
| 1, 2, or 3 | Ghost | Empty year (no records) |

The chapter ordering is seed-dependent. Use `factory.chapters` to inspect the layout for a given seed.

### Persona field reference

```python
PersonaProfile(
    volume_weight=1.0,          # relative record count (higher = more records)
    hour_weights=(...,),        # 24 floats, index = hour of day (0=midnight)
    weekday_multipliers=(...,), # 7 floats, index 0 = Monday
    month_weights=(...,),       # 12 floats, index 0 = January
    skip_chance=0.30,           # fraction of events that are skipped
    shuffle_chance=0.50,        # fraction of Spotify events with shuffle=True
    inactivity_month_windows=(...,),  # full-month gaps available for selection
    inactivity_day_windows=(...,),    # day-range gaps available for selection
    n_month_gaps=1,             # how many month windows to select per chapter
    n_day_gap_windows=1,        # how many day windows to select per chapter
)
```

Weight arrays are normalized internally; only relative magnitudes matter.

### Constraints

- Any change to persona values changes all snapshot hashes.
- Changing `n_month_gaps`, `n_day_gap_windows` or the window lists requires updating the aggregate invariants in `_check_invariants()`.
- The module raises `ValueError` at import if invariants are violated.
 
## 🔒 E2E Dataset Integrity Check

The CI verifies that `generate-e2e` produces byte-for-byte identical output across runs. The SHA256 hashes of both output files are hardcoded in `datasets-test-synthetic.yml`.

Output is deterministic for a given platform, but hashes differ across platforms (macOS vs Linux, x86 vs ARM) due to differences in NumPy floating-point operations and Faker data ordering. Always get the reference hashes from CI logs, not from a local run.

If the hash check fails, it means the generator output changed. Before updating the expected hashes:

1. Identify what caused the change (generator logic, seed, library version bump, etc.)
2. Determine if the change is intentional
3. If yes: update `EXPECTED_JSON_HASH` and `EXPECTED_ZIP_HASH` in `datasets-test-synthetic.yml` with the new hashes printed in the CI logs, and justify the change in the PR description
4. If no: fix the generator so it produces the expected output again
