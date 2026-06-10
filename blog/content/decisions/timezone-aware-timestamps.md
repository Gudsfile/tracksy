---
date: 2026-06-11
draft: true
title: "Timezone-Aware Timestamps for Streaming Data"
---

## Context and Problem Statement

Spotify exports streaming history with timestamps (`ts`) in UTC, losing the user's local timezone offset in the process. Time-sensitive visualisations — hourly listening distribution, session analysis, morning/evening/night favourite artists — are computed against UTC time, which may differ from the user's actual local time by several hours. A user in UTC+2 who listened at 1:00 AM local time has a `ts` value of 23:00 the previous day in UTC, causing that stream to be attributed to the wrong date and hour.

No field in the exported dataset can reliably reconstruct the original offset: `country` maps to multiple timezones and is distorted by VPN usage; `ip_addr` requires embedding and maintaining an IP-to-timezone database, which conflicts with the project's privacy-first, no-external-dependency principle.

## Considered Options

### Option 1: Infer timezone from the `country` field

Map each stream's `country` value to a timezone using a bundled country→TZ mapping.

**Pros:**

- Uses data already present in the dataset
- Covers the common case of a user who rarely travels

**Cons:**

- Many countries span multiple timezones (USA, Russia, Brazil, Australia…)
- VPN usage distorts the country value
- Requires bundling and maintaining a mapping table

### Option 2: Infer timezone from the `ip_addr` field

Use a bundled IP geolocation database to map each stream's IP address to a timezone.

**Pros:**

- More granular than country-level inference

**Cons:**

- Requires embedding a large IP→TZ database client-side
- VPN usage makes IP-based inference unreliable
- Maintenance burden; conflicts with the privacy-first principle

### Option 3: Apply offset at query time via template variable

Store the UTC `ts` column as-is and inject a `${tzOffsetMinutes}` template variable into every SQL query, replacing `ts::timestamp` with `(ts::timestamp + INTERVAL ${tzOffsetMinutes} MINUTE)`.

**Pros:**

- No schema change
- Raw data fully preserved

**Cons:**

- All ~50 SQL files and TypeScript inline queries require modification
- All `ts::date` usages are also affected (streams around midnight shift dates), so no query is truly "safe" — the scope is universal

### Option 4: Two-column approach (`ts` UTC + `ts_local`)

Keep `ts` as the immutable UTC source of truth and add a `ts_local` column computed at insert time.

**Pros:**

- Chart queries read `ts_local` with no offset arithmetic
- On timezone change: a single `UPDATE` statement recalculates `ts_local`

**Cons:**

- The `UPDATE` must know the previously applied offset to reverse it before applying the new one, requiring the original `ts` to be preserved anyway
- Precomputed tables must still be rebuilt on timezone change
- Extra column in the schema

### Option 5: DuckDB view `music_streams` over raw table `music_streams_raw`

Store raw data in `music_streams_raw` (UTC, never modified). Create a DuckDB view named `music_streams` that exposes the same schema with `ts` shifted by the user's timezone offset. All existing queries transparently use the view via the `${table}` template variable.

**Pros:**

- Zero changes to the ~50 existing SQL files
- Raw UTC data preserved and fully reversible
- Clean separation: raw source vs. timezone-adjusted query surface
- On timezone change: recreate the view and rebuild precomputed tables (already a known operation triggered on every import)

**Cons:**

- View must be recreated whenever the timezone offset changes, which also triggers a precompute rebuild
- The timezone approximation remains imperfect: users who listened in multiple timezones (travel, relocation) will still see some misattributed streams

## Decision Outcome

Chosen option: **Option 5 — DuckDB view**, because it requires zero changes to existing SQL queries, preserves the raw UTC data as an immutable source of truth, and reuses the existing precompute lifecycle. The timezone offset defaults to the browser's local timezone (`Intl.DateTimeFormat().resolvedOptions().timeZone`) and can be overridden in settings.

### Consequences

* Good, because all existing chart queries work without modification
* Good, because the raw data is never mutated and the offset can be changed or removed at any time
* Good, because the override mechanism (settings UI + precompute rebuild) is self-contained and client-side
* Bad, because users who consumed music across multiple timezones will still see approximated results — this limitation is documented in the UI with an informational message on time-sensitive charts
* Bad, because a timezone change triggers a full precompute rebuild, which adds latency in the settings flow

## More Information

- [Issue #203 — The time counted is not the actual listening time](https://github.com/Gudsfile/tracksy/issues/203)
