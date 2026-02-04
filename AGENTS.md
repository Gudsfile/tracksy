# AGENTS.md

## Project Overview

Tracksy is a privacy-first music streaming data visualization tool. Monorepo managed by [Moon](https://moonrepo.dev/) with three components:

- **`app/`**: Astro + React web app using DuckDB WASM for client-side data processing
- **`synthetic-datasets/`**: Python scripts for synthetic music streaming history generation
- **`blog/`**: Gohugo-based site

**Tech Stack:**

- **App:** Astro, React, TypeScript, TailwindCSS, DuckDB WASM, Vitest
- **Synthetic Datasets:** Python, Faker, Pandas, NumPy, Pydantic, pytest, Ruff, ty
- **Blog:** Gohugo

**Privacy:** All data processing happens client-side in the browser.

## Setup

Initialize workspace:

```bash
moon setup  # Downloads Node.js, Python, and dependencies
```

## Dev Environment Tips

- Use `moon run app:dev` to start the web app dev server
- Use `moon run blog:dev` to start the blog dev server
- Use `moon run synthetic-datasets:generate -- 100` to generate 100 test records
- Use `moon run synthetic-datasets:generate -- --help` to show help for generating test records
- Run `moon run :test` to run all tests across the monorepo
- Check `app/moon.yml`, `blog/moon.yml`, and `synthetic-datasets/moon.yml` for available tasks
- The project uses TypeScript strict mode, ESLint, and Prettier
- Components: `.astro` files for static content, `.tsx` for interactive React components
- Follow Astro's islands architecture pattern

## Code Style

- TypeScript strict mode enabled
- Use Prettier for formatting: `moon run app:format`
- Lint before committing: `moon run app:lint`
- File naming: kebab-case for files, PascalCase for components, camelCase for functions
- Keep components focused and single-purpose
- Separate business logic from UI components

## Testing Instructions

### App testing

- Run `moon run app:test` to run all tests for the app
- Run `moon run app:test-coverage` for coverage report
- Use `moon run app:test-watch` for watch mode during development
- Focus on specific test: `moon run app:test -- -t "<test name>"`
- Focus on specific test file: `moon run app:test -- <file path : src/component.test.ts>`
- All tests must pass before committing
- **IMPORTANT:** Use `vi.spyOn()` instead of `vi.mock()` for mocking (ESLint enforced)

  ```ts
  // ❌ Bad
  vi.mock("../db/queries", () => ({ getUser: vi.fn() }));

  // ✅ Good
  import * as queries from "../db/queries";
  vi.spyOn(queries, "getUser").mockResolvedValue(mockUser);
  ```

- Add or update tests for any code changes, even if not explicitly requested
- Fix all type errors and lint issues before submitting

#### Astro Testing

As Astro outputs raw HTML, it is possible to write end-to-end tests using the output of the build step. Any end-to-end tests written previously might work out-of-the-box if you have been able to match the markup of your CRA site. Testing libraries such as Jest and React Testing Library can be imported and used in Astro to test your React components.

See Astro’s [testing guide](https://docs.astro.build/en/guides/testing/) for more.


### End-to-End Testing

Tracksy e2e is an end-to-end testing suite built with Playwright.

Refer to [E2E README](e2e/README.md) and [Playwright documentation](https://playwright.dev/docs/intro) for more information.


## CI/CD

- Find CI workflows in `.github/workflows/`

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
2. Make focused, atomic commits following conventions above
3. Before submitting, rebase on latest main:

   ```bash
   git fetch origin
   git rebase origin/main
   ```

4. Run quality checks:

   ```bash
   moon run app:lint
   moon run app:test
   moon run app:format-check
   ```

5. All tests must pass before merging
6. Use **rebase and merge** strategy (enforced)
7. Squash related commits representing single logical changes

## Architecture Notes

- **Data Flow:** User uploads Spotify JSON → Client-side processing with `libarchive.js` → DuckDB WASM → Observable Plot/D3.js visualization
- **Key Directories:**
  - `app/src/components/`: React and Astro components
  - `app/src/pages/`: Astro page routes
  - `app/src/db/`: DuckDB queries and database logic
  - `synthetic-datasets/`: Python test data generation

## Environment Variables

See `app/.env.example` for required configuration.

## Security Considerations

- **No server-side data storage** - All processing is client-side
- **No external API calls** with user data
- Review `SECURITY.md` for vulnerability reporting
- Run `moon run app:audit` to check for dependency vulnerabilities

## Additional Resources

- [Contributing Guide](CONTRIBUTING.md)
- [App-specific README](app/README.md)
- [Datasets README](synthetic-datasets/README.md)
- [Moon Documentation](https://moonrepo.dev/docs)
- [Astro Documentation](https://docs.astro.build)
- [DuckDB WASM](https://duckdb.org/docs/api/wasm)
