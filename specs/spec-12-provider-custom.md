# Spec: Custom / Generic Provider

## Objective

Let users import listening history from **any source** — even sources Tracksy doesn't
natively support — by providing a simple CSV template with predefined column names that
map directly to Tracksy's internal `StreamRecord` format.

No UI column mapper. No server processing. The user reformats their data locally (in
Excel, Python, etc.) to match the template, then uploads the file.

**Success looks like:** a user exports data from Tidal, Last.fm, Navidrome, or a
home-grown scrobbler, fills in the template CSV, uploads `tracksy-custom.csv`, and sees
their listening history in Tracksy exactly like a native provider.

## Template format

**Filename:** `tracksy-custom.csv`
**Content-type:** `text/csv`

### Required columns

| Column | Type | Description | Example |
|---|---|---|---|
| `ts` | ISO 8601 string (UTC) | Start of play | `2024-03-15T14:30:00.000Z` |
| `track_name` | string | Song title | `Never Gonna Give You Up` |
| `artist_name` | string | Primary artist (empty string if unknown) | `Rick Astley` |
| `album_name` | string | Album (empty string if unknown) | `Whenever You Need Somebody` |
| `ms_played` | integer ≥ 0 | Milliseconds played | `213000` |
| `track_uri` | string | Unique ID for the track | `custom:rick-astley:ngr` |
| `platform` | string | Source platform label | `tidal` |

All columns are required. Rows that fail validation (missing required fields, `ms_played`
< 30 000) are silently dropped — same as all other providers.

### Notes

- `track_uri` only needs to be internally consistent for deduplication; any stable string
  works. Suggested format: `custom:{artist}:{title}` or a native ID from the source.
- `artist_name` and `album_name` may be empty strings — providers like JellyFin already
  do this.
- Records with `ms_played < 30000` are filtered (global 30 s rule). Skipped plays should
  be excluded by the user before upload, or set `ms_played` to the actual played
  duration.

## Implementation

### App

- New `CustomStreamProvider` in `app/src/streamProvider/CustomStreamProvider/`
- `filePattern = /^tracksy-custom\.csv$/i`
- `fileContentType = 'text/csv'`
- `readFile`: DuckDB `read_csv` (same pattern as JellyFin)
- `transform`: columns already match `StreamRecord` — direct passthrough + type coercion
- Register in `app/src/streamProvider/index.ts`
- README section: template download link or inline example, copy-paste instructions

### Synthetic datasets

- Not needed — users provide their own data. No factory/writer to generate.

## Open questions

None — format is entirely under our control.

## Success criteria

- [ ] `tracksy-custom.csv` with valid rows loads and displays charts identically to
      native providers
- [ ] Rows with `ms_played < 30000` are filtered
- [ ] Rows missing required columns are dropped silently
- [ ] README documents the column format with a worked example
- [ ] A downloadable CSV template (header-only) is linked or embedded in the UI

## Non-goals

- UI column mapper (drag-drop field assignment) — future work if demand exists
- Supporting custom XLSX or JSON — CSV only for v1
