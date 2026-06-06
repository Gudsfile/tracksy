# AGENTS.md

## Project Overview

Tracksy: privacy-first music streaming data viz tool. Monorepo via [Moon](https://moonrepo.dev/).

| Component | Stack | Guide |
|-----------|-------|-------|
| `app/` | Astro, React, TypeScript, TailwindCSS, DuckDB WASM, Vitest | [app/AGENTS.md](app/AGENTS.md) |
| `synthetic-datasets/` | Python, Faker, NumPy, openpyxl, Pydantic, pytest, Ruff, ty | [synthetic-datasets/AGENTS.md](synthetic-datasets/AGENTS.md) |
| `blog/` | Gohugo | [blog/AGENTS.md](blog/AGENTS.md) |
| `e2e/` | Playwright | [e2e/AGENTS.md](e2e/AGENTS.md) |

**Privacy:** All processing client-side in browser. No server-side storage, no external API calls with user data.

## Setup

```bash
moon setup  # Downloads Node.js, Python, and dependencies
```

## Common Commands

- `moon run :test` — run all tests across monorepo
- `moon run app:dev` — start web app dev server
- `moon run blog:dev` — start blog dev server

## Commit Conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat(scope): description` — new feature
- `fix(scope): description` — bug fix
- `docs: description` — documentation changes
- `style: description` — code formatting (no logic change)
- `refactor: description` — code restructuring
- `test: description` — test additions/corrections
- `chore: description` — build/tooling changes

All tests and quality checks must pass before committing.

See sub-project AGENTS.md for format/lint/test/typecheck commands.

## PR Instructions

1. Feature branch from `main`: `git checkout -b feat/your-feature-name`
2. Focused, atomic commits per conventions above
3. Before submitting, rebase on latest main:
   ```bash
   git fetch origin && git rebase origin/main
   ```
4. Quality checks: see sub-project AGENTS.md for format/lint/test/typecheck commands
5. All tests must pass before merging
6. Use **rebase and merge** strategy (enforced)

PRs use the template at [`.github/pull_request_template.md`](.github/pull_request_template.md). Fill all sections. Issues and PRs use labels defined in [`.github/labels.yml`](.github/labels.yml) — apply the relevant ones.

## CI/CD

Workflows in `.github/workflows/`.

## Security

- No server-side data storage — all processing client-side
- No external API calls with user data
- Review `SECURITY.md` for vulnerability reporting
- `moon run app:audit` — check dependency vulnerabilities

## Additional Resources

- [Contributing Guide](CONTRIBUTING.md)
- [Moon Documentation](https://moonrepo.dev/docs)
