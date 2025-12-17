# Contributing to Tracksy

Thank you for your interest in contributing to Tracksy!

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

1. **Create a Feature Branch**: Always work on a separate branch from `main`

   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make Your Changes**: Implement your feature or fix with clear, focused commits

3. **Rebase Before Submitting**: Before creating a pull request, rebase your branch onto the latest `main`

   ```bash
   git fetch origin
   git rebase origin/main
   ```

4. **Submit Pull Request**: Create a PR with a clear description of your changes

5. **Address Feedback**: Make any requested changes and force-push if needed

   ```bash
   git push --force-with-lease origin feat/your-feature-name
   ```

6. **Merge**: Once approved, we'll use "Rebase and merge" to integrate your changes

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
    moon run synthetic-datasets:generate  # Generate new datasets
    moon run synthetic-datasets:test      # Run python tests
    ```

> [!NOTE]
> ensure `proto` is in your PATH to use `uv` `pnpm` and python and Node.js tools.
> `export PATH="$HOME/.proto/shims:$HOME/.proto/bin:$PATH"`