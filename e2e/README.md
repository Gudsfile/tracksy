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
- `moon run e2e:generate-readme-gif`: Regenerate the demo GIF shown in the root README (requires `ffmpeg`, and `gifsicle` optionally for a smaller file).

> [!NOTE]
> `moon run e2e:test-ui` and `moon run e2e:test-dev` start the application dev server (`moon run app:dev`) first, then run the tests.
