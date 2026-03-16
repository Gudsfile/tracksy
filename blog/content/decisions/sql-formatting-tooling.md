---
date: 2026-03-14
title: "SQL Formatting Tooling for App Queries"
---

## Context and Problem Statement

The app embeds DuckDB SQL queries to process user streaming data client-side. These queries were previously written as TypeScript template literals directly inside `.tsx` files, which made it impractical to apply SQL-specific formatting or linting — they were just strings from the toolchain's perspective.

As part of a refactoring effort, SQL queries have been extracted into dedicated `.sql` files (e.g., `ArtistLoyalty.sql`, `ConcentrationScore.sql`). This new structure makes it possible to apply consistent formatting and linting rules across all SQL in the project.

We need a tool to enforce that consistency, with the following requirements:

- Support for the DuckDB SQL dialect
- Formatter and/or linter capabilities
- Easy integration into the existing Moon-based monorepo workflow and CI pipeline
- Low configuration overhead, keeping the toolchain simple

## Considered Options

### Option 1: sqlfluff

The de-facto standard Python-based SQL linter and formatter. Extremely widely adopted.

**Pros:**

- DuckDB dialect supported (inherits PostgreSQL parser — which DuckDB uses internally)
- Very large community
- Extensive auto-fix capabilities and highly configurable rule set
- Actively maintained

**Cons:**

- Requires a non-Node.js runtime (Python) — adds a specific setup tool to manage in the monorepo
- Relatively complex hierarchical configuration

### Option 2: sqruff

A Rust-based SQL linter and formatter inspired by sqlfluff. Distributed as a standalone binary (also installable via pip, or Cargo).

**Pros:**

- DuckDB dialect supported
- Extensive auto-fix capabilities and highly configurable rule set
- Actively maintained
- Faster than sqlfluff

**Cons:**

- Requires a non-Node.js runtime (Rust binary) — adds a specific setup tool to manage in the monorepo
- DuckDB dialect support is newer and may lag behind on edge cases (e.g., niche DuckDB-specific syntax)
- Relatively complex hierarchical configuration
- Smaller community than sqlfluff and and less mature project than sqlfluff

### Option 3: sql-formatter

A JavaScript/Node.js library (npm package) that reformats SQL output.

**Pros:**

- DuckDB dialect supported
- No additional runtime: Node.js is already required by the app
- Simple JSON-based configuration
- Project maintained

**Cons:**

- Formatter only — no linting rules or style enforcement
- Basic whitespace reformatting without the ability to catch SQL anti-patterns or enforce conventions

### Option 4: No dedicated formatter

Continue writing SQL manually, relying on individual editor plugins for formatting.

**Pros:**

- No tooling to install, configure, or maintain
- No CI overhead

**Cons:**

- Inconsistent formatting across contributors and editors
- No mechanism to enforce standards in CI
- Harder to review SQL diffs when style varies

## Decision Outcome

Chosen option: **sqruff**, because the project appeals to us, the Rust-based approach aligns with our interest in exploring performant tooling, and it covers our core needs. Both sqruff and sqlfluff require adding a non-Node.js runtime to the app toolchain. Using `uvx` with Moon tasks lets us run sqruff without polluting the app's direct dependencies.

## More Information

- [sqruff GitHub Repository](https://github.com/quarylabs/sqruff)
- [sqlfluff GitHub Repository](https://github.com/sqlfluff/sqlfluff)
- [sql-formatter GitHub Repository](https://github.com/sql-formatter-org/sql-formatter)
