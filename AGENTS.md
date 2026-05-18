# AGENTS.md

## Project Overview
Tracksy: privacy-first music streaming data viz tool. Monorepo via [Moon](https://moonrepo.dev/), three components:

- **`app/`**: Astro + React web app, DuckDB WASM for client-side data processing
- **`synthetic-datasets/`**: Python scripts for synthetic music streaming history generation
- **`blog/`**: Gohugo-based site

**Tech Stack:**
- **App:** Astro, React, TypeScript, TailwindCSS, DuckDB WASM, Vitest
- **Synthetic Datasets:** Python, Faker, NumPy, openpyxl, Pydantic, pytest, Ruff, ty
- **Blog:** Gohugo

**Privacy:** All processing client-side in browser.

## Setup
Initialize workspace:

```bash
moon setup  # Downloads Node.js, Python, and dependencies
```

## Dev Environment Tips
- `moon run app:dev` — start web app dev server
- `moon run blog:dev` — start blog dev server
- `moon run synthetic-datasets:generate -- 100 --provider spotify` — generate 100 Spotify records
- `moon run synthetic-datasets:generate -- --seed 42` — generate deterministic records with seed
- `moon run synthetic-datasets:generate -- --help` — show generation help
- `moon run :test` — run all tests across monorepo
- Prefer moon tasks in `app/moon.yml` and `synthetic-datasets/moon.yml` over raw `moon run app:pnpm` or `moon run synthetic-datasets:uv`.

## Code Style
- TypeScript strict mode enabled
- Prettier: `moon run app:format`
- Lint before commit: `moon run app:lint`
- Components: `.astro` for static content, `.tsx` for interactive React components
- Follow Astro's islands architecture pattern
- File naming: kebab-case files, PascalCase components, camelCase functions
- Components: focused, single-purpose
- Separate business logic from UI components

## Testing Instructions

### App testing
- `moon run app:test` — run all app tests
- `moon run app:test-coverage` — coverage report
- Focus specific test: `moon run app:test -- -t "<test name>"`
- Focus specific file: `moon run app:test -- <file path : src/component.test.ts>`
- All tests must pass before committing
- **IMPORTANT:** Use `vi.spyOn()` not `vi.mock()` (ESLint enforced)
  ```ts
  // ❌ Bad
  vi.mock("../db/queries", () => ({ getUser: vi.fn() }));

  // ✅ Good
  import * as queries from "../db/queries";
  vi.spyOn(queries, "getUser").mockResolvedValue(mockUser);
  ```
- Add/update tests for any code changes, even if not requested
- Fix all type errors and lint issues before submitting

#### Astro Testing
Astro outputs raw HTML — e2e tests can use build output. Vitest and React Testing Library work for React component tests.

See Astro's [testing guide](https://docs.astro.build/en/guides/testing/).

### End-to-End Testing
Tracksy e2e built with Playwright.

See [E2E README](e2e/README.md) and [Playwright documentation](https://playwright.dev/docs/intro).

## CI/CD
- Workflows in `.github/workflows/`

## Commit Conventions
Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat(scope): description` - New feature
- `fix(scope): description` - Bug fix
- `docs: description` - Documentation changes
- `style: description` - Code formatting (no logic change)
- `refactor: description` - Code restructuring
- `test: description` - Test additions/corrections
- `chore: description` - Build/tooling changes

Examples:
```
feat(charts): add streaming trends visualization
fix(upload): resolve file parsing timeout
docs: update setup instructions
```

## PR Instructions
1. Create feature branch from `main`: `git checkout -b feat/your-feature-name`
2. Focused, atomic commits per conventions
3. Before submitting, rebase on latest main:
   ```bash
   git fetch origin
   git rebase origin/main
   ```
4. Quality checks:
   ```bash
   moon run app:lint
   moon run app:test
   moon run app:format-check
   ```
5. All tests must pass before merging
6. Use **rebase and merge** strategy (enforced)
7. Squash related commits for single logical changes

## Architecture Notes
- **Data Flow:** User uploads file → `StreamProvider` detects format + parses → DuckDB WASM → Observable Plot/D3.js visualization
  - Spotify: ZIP or JSON (`Streaming_History_Audio_*.json`)
  - Deezer: XLSX (`deezer-data_\d{10}.xlsx`), sheet `10_listeningHistory`, parsed via DuckDB Excel extension
- **StreamProvider pattern:** `app/src/streamProvider/` — extensible adapter for multi-source support. Each provider implements `filePattern`, `readFile()`, `transform()` → canonical `StreamRecord` objects. Register new providers in `index.ts`.
- **Key Directories:**
  - `app/src/components/`: React and Astro components
  - `app/src/pages/`: Astro page routes
  - `app/src/db/`: DuckDB queries and database logic
  - `app/src/streamProvider/`: Provider adapters (Spotify, Deezer)
  - `synthetic-datasets/`: Python test data generation (supports `--provider spotify|deezer`)

## Environment Variables
See `app/.env.example` for required config.

## Security Considerations
- **No server-side data storage** — all processing client-side
- **No external API calls** with user data
- Review `SECURITY.md` for vulnerability reporting
- `moon run app:audit` — check dependency vulnerabilities

## Additional Resources
- [Contributing Guide](CONTRIBUTING.md)
- [App-specific README](app/README.md)
- [Datasets README](synthetic-datasets/README.md)
- [Moon Documentation](https://moonrepo.dev/docs)
- [Astro Documentation](https://docs.astro.build)
- [DuckDB WASM](https://duckdb.org/docs/api/wasm)