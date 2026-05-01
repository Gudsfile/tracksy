# Security Policy

## Supported Versions

We only support updates to the 0.3.x versions of Tracksy.

| Version | Supported          |
| ------- | ------------------ |
| 0.3.0   | :white_check_mark: |
| < 0.3.0 | :x:                |

## Reporting a Vulnerability

If you discover a vulnerability in Tracksy, please do not post an issue on GitHub. 
Instead you should use [the private security reporting feature provided by Github on this project](https://github.com/Gudsfile/tracksy/security/advisories/new).

## Security Architecture

Tracksy is designed as a **privacy-first, client-side-only** application.

### No server-side data processing

All user data stays in the browser. There is no backend, no API, and no database server. Uploaded streaming history files are processed entirely within the user's browser session using [DuckDB WASM](https://duckdb.org/docs/api/wasm), which runs as a local in-memory database. No user data is ever transmitted to an external server.

### File upload handling

While uploaded files are checked against expected filename patterns and MIME types, these validations are intentionally lightweight and do not provide strong guarantees regarding file integrity or safety prior to processing.
