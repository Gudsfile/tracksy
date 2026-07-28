# E2E — AGENTS.md

End-to-end test suite built with [Playwright](https://playwright.dev).

[Root AGENTS.md](../AGENTS.md)

## Quick Start

```bash
moon setup
moon run e2e:install-browsers
moon run e2e:test-dev
```

## Commands

- `moon run e2e:test-dev` — run all tests (starts `app:dev` first)
- `moon run e2e:test-ui` — interactive Playwright UI mode (starts `app:dev` first)
- `moon run e2e:codegen` — record actions to generate tests
- `moon run e2e:show-report` — view last test report
- `moon run e2e:generate-readme-gif` — regenerate the README demo GIF (starts `app:dev` first)

Quality checks:

```bash
moon run e2e:format          # Format with Prettier
moon run e2e:format-check    # Check formatting
```

## Datasets

Tests run against a fixed synthetic dataset generated with:

```bash
moon run synthetic-datasets:generate-e2e
```

1000 records, fixed seed — deterministic test expectations. `e2e:test-dev` runs this automatically as a dep.

## README demo GIF

`moon run e2e:generate-readme-gif` records the main demo flow (upload the deterministic dataset, browse the
Simple view, switch to the Lab view) with Playwright and writes an optimized GIF to `.github/img/tracksy_demo.gif`
(the path referenced by the root README). The task starts `app:dev` and generates the dataset automatically.

Requires **`ffmpeg`** (video → GIF) on the PATH; **`gifsicle`** is optional and shrinks the result further when
installed. The generation script lives in `scripts/generate-readme-gif.mts`.
