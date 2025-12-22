# Tracksy E2E Tests

Tracksy e2e is an end-to-end testing suite built with [Playwright](https://playwright.dev).

## ⏩ Quick Start

Run the tests locally with:

```bash
moon setup
moon run e2e:install-browsers
moon run e2e:test-dev
```

Run in interactive UI mode:

```bash
moon run e2e:test-ui
```

### Other Commands

- `moon run e2e:codegen`: Generate tests by recording actions.
- `moon run e2e:show-report`: View the last test report.

> [!NOTE]
> commands `moon run e2e:test-ui` and `moon run e2e:test-dev` starts the application dev server (`moon run app:dev`) first then runs the tests.
