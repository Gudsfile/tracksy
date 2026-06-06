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

## Datasets

Tests run against a fixed synthetic dataset generated with:

```bash
moon run synthetic-datasets:generate-e2e
```

1000 records, fixed seed — deterministic test expectations. `e2e:test-dev` runs this automatically as a dep.
