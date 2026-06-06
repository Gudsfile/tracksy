# App — AGENTS.md

Astro + React web app. DuckDB WASM for client-side data processing.

[Root AGENTS.md](../AGENTS.md)

## Dev

```bash
moon run app:dev            # Start dev server
moon run app:build          # Type-check + build
moon run app:preview        # Preview production build
```

For raw pnpm commands (adding deps, etc.) — use sparingly:

```bash
moon run app:pnpm -- add <package>
```

## Code Style

- TypeScript strict mode
- File naming: kebab-case files, PascalCase components, camelCase functions
- Components: `.astro` for static content, `.tsx` for interactive React
- Follow Astro's islands architecture pattern
- Components: focused, single-purpose; separate business logic from UI

Quality checks:

```bash
moon run app:format          # Format with Prettier
moon run app:format-check    # Check formatting
moon run app:lint            # ESLint
moon run app:lint-fix        # Auto-fix lint
moon run app:lint-sql        # SQL lint (sqruff)
moon run app:lint-fix-sql    # Auto-fix SQL lint
moon run app:typecheck       # TypeScript type-check
```

## Testing

```bash
moon run app:test                          # Run all tests
moon run app:test-coverage                 # Coverage report
moon run app:test -- -t "<test name>"      # Focus a specific test
moon run app:test -- <file path>           # Focus a specific file
```

All tests must pass before committing. Add/update tests for any code changes.

**IMPORTANT:** Use `vi.spyOn()` not `vi.mock()` (ESLint enforced):

```ts
// Bad
vi.mock('../db/queries', () => ({ getUser: vi.fn() }))

// Good
import * as queries from '../db/queries'
vi.spyOn(queries, 'getUser').mockResolvedValue(mockUser)
```

Astro outputs raw HTML — e2e tests can use build output. Vitest and React Testing Library for React component tests. See Astro's [testing guide](https://docs.astro.build/en/guides/testing/).

## Architecture

**Data Flow:** User uploads file → `StreamProvider` detects format + parses → DuckDB WASM → Observable Plot/D3.js visualization

Supported formats:

- Spotify: ZIP or JSON (`Streaming_History_Audio_*.json`)
- Deezer: XLSX (`deezer-data_\d{10}.xlsx`), sheet `10_listeningHistory`, parsed via DuckDB Excel extension

**StreamProvider pattern:** `src/streamProvider/` — extensible adapter for multi-source support. Each provider implements `filePattern`, `readFile()`, `transform()` → canonical `StreamRecord` objects. Register new providers in `index.ts`.

**Key Directories:**

| Path                  | Purpose                             |
| --------------------- | ----------------------------------- |
| `src/components/`     | React and Astro components          |
| `src/pages/`          | Astro page routes                   |
| `src/db/`             | DuckDB queries and database logic   |
| `src/streamProvider/` | Provider adapters (Spotify, Deezer) |

## Environment Variables

See `.env.example` for required config.
