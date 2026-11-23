# Contributing to Tracksy

Thank you for your interest in contributing to Tracksy!

> [!NOTE]
> If you have contributed to this project, you are welcome to add yourself to the contributors list using the [bot](https://allcontributors.org).
>
> Sometimes contributions may be missed or made in the past before the list was updated. If you believe you should be listed, feel free to add yourself or open an issue/PR to request being added.
> We aim to recognize everyone’s work, but we also understand that some people may prefer not to appear in the list. If you would like to be added (or removed), just let us know.

## Getting Started

Before you start contributing, please take a moment to read through this guide to understand our development workflow and conventions.

## Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for our commit messages. This convention helps us maintain a clear and consistent project history and could enable automated changelog generation.

### Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- **feat**: A new feature for the user
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools and libraries

### Examples

```
feat(charts): add new streaming trends visualization

fix(auth): resolve Spotify authentication timeout issue

docs: update installation instructions in README

chore(deps): update dependencies to latest versions
```

## Merge Strategy

We use **rebase and merge** as our preferred merge strategy. This approach helps maintain a clean, linear project history.

### Workflow

Contributions go through a fork of the repository: you don't need any access rights on `Gudsfile/tracksy` to contribute.

1. **Pick an Issue**: Look for an existing [issue](https://github.com/Gudsfile/tracksy/issues) (the `➡️ good first issue` and `➡️ help wanted` labels are a good start) and comment to say you're working on it. For larger changes, open an issue first to discuss the approach.

2. **Fork and Clone**: Fork the repository from the GitHub UI, then clone your fork

   ```bash
   git clone git@github.com:<your-username>/tracksy.git
   cd tracksy
   ```

   Or, with the [GitHub CLI](https://cli.github.com/):

   ```bash
   gh repo fork Gudsfile/tracksy --clone
   ```

3. **Create a Feature Branch**: Always work on a separate branch from `main`, one branch per issue

   ```bash
   git checkout -b feat/your-feature-name
   ```

4. **Make Your Changes**: Set up your environment (see [Development](#development)), implement your feature or fix with clear, focused commits, and make sure the tests and quality checks pass

5. **Rebase Before Submitting**: Before creating a pull request, sync your fork with the "Sync fork" button on GitHub (or `gh repo sync <your-username>/tracksy`), then rebase your branch onto the latest `main`

   ```bash
   git fetch origin
   git rebase origin/main
   git push --force-with-lease origin feat/your-feature-name
   ```

6. **Submit Pull Request**: Open a PR from `<your-username>:feat/your-feature-name` to `Gudsfile/tracksy:main`, fill in every section of the [pull request template](.github/pull_request_template.md), and keep "Allow edits by maintainers" checked

7. **Address Feedback**: Make any requested changes and force-push if needed

   ```bash
   git push --force-with-lease origin feat/your-feature-name
   ```

8. **Merge**: Once approved, we'll use "Rebase and merge" to integrate your changes. You can then sync your fork and delete your branch

### Pull Requests from a Fork

- **CI approval**: if this is your first contribution, a maintainer may need to approve the GitHub Actions run before the checks start on your PR.
- **Secrets**: workflows triggered by a fork don't have access to the repository secrets, and their token is read-only, so the app preview deployment doesn't run for PRs from a fork. Run the tests and quality checks locally before pushing.

### Important Notes

- Keep your commits focused and atomic
- Squash related commits if they represent a single logical change

## Testing Best Practices

We strive to maintain high-quality tests that are robust and easy to maintain.

### Mocks and Spies

- **Avoid `vi.mock()`**: We have configured ESLint to restrict the usage of `vi.mock()`. This global mocking strategy can lead to tests that are hard to understand and debug, and often breaks type safety.
- **Prefer `vi.spyOn()`**: Instead, use `vi.spyOn()` to mock specific methods or functions. This allows for:
  - Better type inference and safety.
  - More granular control over what is being mocked.
  - Easier restoration of original implementations (`mockRestore`).

#### Example

**❌ Avoid:**

```ts
vi.mock('../db/queries', () => ({
    getUser: vi.fn(),
}))
```

**✅ Prefer:**

```ts
import * as queries from '../db/queries'

vi.spyOn(queries, 'getUser').mockResolvedValue(mockUser)
```

### Development

This repository uses [Moon](https://moonrepo.dev/) to manage the workspace and tasks.

#### Setup

To get started, you don't need to install Node.js, Python, or pnpm manually. Moon handles the toolchain for you.

1. **Install Moon**:

    ```bash
    # MacOS / Linux
    curl -fsSL https://moonrepo.dev/install/moon.sh | bash

    # Windows
    irm https://moonrepo.dev/install/moon.ps1 | iex
    ```

2. **Initialize the workspace**:

    ```bash
    # This downloads the configured Node.js and Python versions
    moon setup
    ```

3. **Install the pre-commit hooks**:

    ```bash
    # This installs the Git hooks defined in .moon/workspace.yml
    moon sync hooks
    ```

#### Available Commands

Run tasks across the entire monorepo or for specific projects.

- **Run all tests**:

    ```bash
    moon run :test
    ```

- **Web App (`app`)**:

    ```bash
    moon run app:dev    # Start dev server
    moon run app:build  # Build for production
    moon run app:lint   # Lint code
    ```

- **Datasets (`synthetic-datasets`)**:

    ```bash
    moon run synthetic-datasets:generate -- 1000 --provider spotify             # Generate Spotify dataset
    moon run synthetic-datasets:generate -- 1000 --provider spotify --provider deezer  # Multiple providers
    moon run synthetic-datasets:generate -- 1000 --all-providers                # All providers
    moon run synthetic-datasets:generate-e2e                                    # Predictable e2e dataset
    moon run synthetic-datasets:generate -- --help                              # View all options
    moon run synthetic-datasets:test                                            # Run Python tests
    ```

- **Blog (`blog`)**:

    ```bash
    moon run blog:dev    # Start dev server
    moon run blog:build  # Build for production
    moon run blog:new-post -- decisions/<slug>.md  # Create a new ADR
    ```

- **E2E (`e2e`)**:

    ```bash
    moon run e2e:install-browsers # Install Playwright browsers
    moon run e2e:test-dev # Run tests alongside app dev server
    moon run e2e:test-ui # Run tests in interactive UI mode
    moon run e2e:codegen # Generate tests by recording actions
    moon run e2e:show-report # View the last test report
    moon run e2e:test    # Run tests against given url
    ```

> [!NOTE]
> Ensure `proto` is in your PATH to use `uv` `pnpm` and python and Node.js tools.
> `export PATH="$HOME/.proto/shims:$HOME/.proto/bin:$PATH"`

> [!NOTE]
> `moon run e2e:test-ui` and `moon run e2e:test-dev` start the application dev server (`moon run app:dev`) first, then run the tests.

## Architecture Decision Records (ADRs)

Significant technical decisions are documented as ADRs in `blog/content/decisions/`. These records capture the context, options considered, and rationale behind choices so future contributors understand *why* the project is built the way it is.

To create a new ADR:

```bash
moon run blog:new-post -- decisions/<slug>.md
```

For example:

```bash
moon run blog:new-post -- decisions/sql-formatting-tooling.md
```

This creates a new file at `blog/content/decisions/<slug>.md` with the Hugo frontmatter pre-filled. Edit the file to add the decision context, considered options, and outcome. Follow the structure of existing ADRs as a template.
