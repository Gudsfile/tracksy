---
title: "Top10 Race Bar Chart Race"
date: 2026-05-22T01:00:21+02:00
draft: true
---

## 1. Objective

Improve the Top10Race bar chart race for clarity, usability, and extensibility.

Target users: Tracksy users exploring their listening history over time.

---

## 2. Problems to Solve

| # | Problem | Source |
|---|---------|--------|
| P1 | Play/Pause button is text, not icon — looks heavy | User feedback |
| P2 | Numbers beside bars have no unit — meaning unclear | User feedback |
| P3 | Time progression unclear (day? week? month?) | User feedback |
| P4 | Animation feels abrupt / not smooth | User feedback |
| P5 | No way to switch between Artists / Tracks / Albums | Owner reflection |
| P6 | Missing days are silently skipped | Owner reflection |
| P7 | Stream-by-stream granularity unexplored | Owner reflection |

---

## 3. In-Scope Changes (v1)

### 3.0 Consistency with SimpleCharts

#### 3.0.1 `question` prop

Add question to `ChartCard` usage in `index.tsx`:
> `"Who dominated my listening, and when did they rise?"`

#### 3.0.2 Empty state

Replace `return null` in `Top10RaceView` with `<ChartCardEmpty />` when no data.

#### 3.0.3 `headerActions` slot in `ChartCard`

Add optional `headerActions?: ReactNode` prop to `ChartCard` (shared component). Rendered right-aligned in the header row, beside the title. Used by Top10Race for the entity switch tabs.

```tsx
// ChartCard header becomes:
<div className="flex items-center justify-between mb-3">
  <h3 className="text-lg font-semibold flex items-center gap-2">
    {emoji && <span>{emoji}</span>}
    {title}
  </h3>
  {headerActions && <div>{headerActions}</div>}
</div>
```

**Note:** `font-mono` on the date display in `Top10RaceView` is intentional — classic bar chart race "counter" effect. Not an error.

**Acceptance criteria:**
- `ChartCard` renders `headerActions` when provided, without breaking existing usages
- `Top10Race` shows `<ChartCardEmpty />` when data is empty
- Question displays in italic below title

---

### 3.1 Play/Pause → icon button

Replace text labels `Play`, `Pause`, `Replay` with SVG icons (standard ▶ ⏸ ↺).
Remove Prev/Next step buttons — the slider covers the same use case (frame-by-frame stepping via slow drag or keyboard arrow keys on focused input). Removing them reduces control clutter without losing capability.
Tooltip (`title`) attribute must remain for accessibility.

**Acceptance criteria:**
- No text in the play/pause/replay button
- Icon changes correctly between states (playing / paused / ended)
- Tooltip present on hover
- Prev/Next buttons removed

---

### 3.2 Metric label: "streams"

The number shown to the right of each bar = cumulative stream count.
Add unit label so users understand the value.

**Options considered:**
- `1 722 streams` — verbose
- `1 722 ▶` — compact, possibly unclear
- `1 722` + tooltip "cumulative streams" — clean but requires hover
- Column header `streams` above the chart — best balance

**Decision:** Add a small `streams` label as a column header aligned to the right side (where numbers appear). Keep per-row number as-is. No change to per-row display.

**Acceptance criteria:**
- "streams" label visible above number column
- Consistent with vocabulary used in SimpleCharts (use "streams" not "écoutes")
- Label does not reflow bars

**Future consideration:** Minutes played (`ms_played / 60000`) as an optional secondary metric — deferred to v2 to avoid overloading the view.

---

### 3.3 Entity switch: Artists / Tracks / Albums

Add a control to switch the chart between three entity types:
- **Artists** (current)
- **Tracks**
- **Albums**

**UI pattern:** Tabs passed via `headerActions` prop into `ChartCard` header (see 3.0.3). Rationale: entity selection is a high-level "what to show" decision made once per session — semantically distinct from playback controls ("how to play"). Mixing both in the same row creates a flat, confusing hierarchy.

**Implementation approach:**
- Single `Top10RaceView` component parameterized with `entityType: 'artists' | 'tracks' | 'albums'`
- Switch triggers a new DB query
- State resets to frame 0 on entity change
- `Top10AlbumsEvolution` and `Top10TracksEvolution` are **separate charts that remain untouched** — they show different things (static top N, not a bar chart race). The entity switch here requires **new SQL files** written specifically for daily-granularity bar race data, added inside `Top10Race/`. No code is shared or moved from those directories.

**Acceptance criteria:**
- Tabs visible in ChartCard header for all 3 entity types
- Changing entity resets playback to start
- Query re-runs on entity change
- Labels in bars update correctly (artist name → track name → album name)

---

### 3.4 Slider: real date labels

Replace generic `Start` / `End` labels with the actual first and last frame dates.
Users currently have no idea what time range the slider covers.

**Acceptance criteria:**
- Left label = date of first frame (e.g., `janv. 2021`)
- Right label = date of last frame (e.g., `déc. 2023`)
- Format: short month + year (`MMM YYYY`)

---

### 3.5 Time granularity indicator

Currently: 1 frame = 1 day that has data. Users don't know this.

**Short-term fix (v1):** Add a small static label near the date display showing the current granularity.

**Acceptance criteria:**
- Granularity label visible next to date (e.g., `17 janvier 2021 · daily`)

---

## 4. Target Layout (v1)

```
┌──────────────────────────────────────────────────────────────┐
│ 🏎️  Top 10 Race   [Artistes] [Titres] [Albums]               │  ← ChartCard header
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  17 janvier 2021 · daily    [0.5x | 1x | 2x | 4x]   ⏸      │
│                                                              │
│  janv. 2021 ───────────●──────────── déc. 2023             │
│                                                   streams    │
│  #1 Columbine ████████████████████████  1 722              │
│  ...                                                        │
└──────────────────────────────────────────────────────────────┘
```

**Control hierarchy:**
- Level 1 (ChartCard header): entity type — set once, high-level
- Level 2 (animation row): speed + play/pause — set-and-forget + primary action
- Level 3 (slider): timeline scrubbing — secondary navigation

---

## 5. Open Questions (require analysis before implementation)

### OQ-1: Missing days — skip or interpolate?

**Current behavior:** Days without listens are absent from the frame list. A week of silence = jump in the date display.

**Options:**
- A) Keep skip — simpler, data-accurate, user may notice jump
- B) Fill gaps — insert frames with unchanged scores for missing days — smoother timeline but adds frames (perf impact?)
- C) Hybrid — fill gaps only when gap > N days (e.g., 3)

**Decision needed before implementing granularity feature (OQ-2).**

---

### OQ-2: Frame granularity — stream-by-stream vs configurable

**Current behavior:** 1 frame = 1 calendar day.

**Stream-by-stream:**
- Pro: Maximum animation fluidity
- Con: Could be 50,000+ frames for a year of history → perf analysis required
- Must benchmark: frame computation time, React re-render rate at high speed

**Configurable granularity (D / W / M / Y):**
- Pro: User controls trade-off between resolution and speed
- UI: Segmented control `[D | W | M | Y]` placed next to the date/granularity label (not in the playback controls row). Rationale: granularity is a "what" setting (like entity type) — changing it resets the entire animation and recomputes frames, which is a heavy state change. A segmented control makes all options visible at once, unlike a cyclic button that hides the current choice. Cyclic buttons suit lightweight continuous changes (speed); segmented controls suit mode switches with distinct consequences (granularity).
- Con: More SQL complexity (GROUP BY week, month, year)
- Requires OQ-1 decision first (what does "fill gaps" mean per granularity?)

**Action:** Benchmark stream-by-stream with realistic dataset (synthetic, ~50k rows). If p95 frame generation < 100ms and render stable at 60fps, stream-by-stream is viable. Otherwise, implement configurable granularity.

---

## 6. Out of Scope (explicitly)

- Minutes played as primary metric (v2)
- Changing Top10 depth (N ≠ 10)
- Custom color themes per artist
- Export / share frame as image

---

## 7. Architecture

```
app/src/components/Charts/LabCharts/Top10Race/
  index.tsx                    # Orchestrator: fetch + ChartCard wrapper (with entity tabs)
  Top10RaceView.tsx            # Animated bar chart (parameterized by entityType)
  query.ts                     # Unified query builder (artists | tracks | albums)
  Top10Race.sql                # Artists SQL (unchanged)
  Top10Tracks.sql              # NEW — daily-granularity bar race SQL for tracks
  Top10Albums.sql              # NEW — daily-granularity bar race SQL for albums
  Top10RaceView.test.tsx
  query.test.ts
```

`Top10AlbumsEvolution/` and `Top10TracksEvolution/` are separate charts showing different data (static rankings). They are untouched.

---

## 8. Testing Strategy

- Unit tests: `query.ts` — verify correct SQL substitution per entity type
- Unit tests: `ChartCard` — `headerActions` renders when provided, existing snapshots unchanged
- Component tests: `Top10RaceView` — render with fixture data, verify:
  - Correct entity labels shown (artist / track / album name)
  - Frame reset on entity switch
  - Icon states (play / pause / replay)
  - "streams" column header present
  - Granularity label present next to date
  - Slider shows real first/last frame dates
  - Prev/Next buttons absent
  - `<ChartCardEmpty />` shown when data is empty
  - Question text visible below title
- Use `vi.spyOn()` per project convention (never `vi.mock()`)
- All existing tests must remain green

---

## 9. Implementation Plan (proposed sequence)

Each item → separate PR or commit.

1. **3.0.3** — `headerActions` slot in `ChartCard`: shared component change, no visual regression on existing charts
2. **3.0.1 + 3.0.2** — `question` prop + `ChartCardEmpty` empty state: isolated, no logic change
3. **P1** — Icon button + remove Prev/Next: isolated, no logic change
4. **P2** — "streams" column header: CSS/layout only
5. **3.4** — Slider real date labels: read first/last frame from existing data
6. **3.5** — Granularity label next to date: label-only, no logic
7. **P5** — Entity switch tabs via `headerActions`: new state + query wiring
8. **OQ-1** — Decision + implementation (missing days)
9. **OQ-2** — Benchmark → decide granularity approach → implement

---

## 11. Future Directions — "Billboard Race" POC

### Concept

A variant of Top10Race based not on **cumulative stream counts**, but on **time spent in the top 10** — inspired by the Billboard 200.

Each period (weekly by default, to be validated — start by testing with 200 periods), compute the top 10 for that period. The chart animates the ranking evolution and displays on the right not a stream count but the **number of periods spent in the top 10**.

### Metrics displayed per bar

Two dimensions shown to the right of each bar:
- **Total**: number of periods (weeks) the entity appeared in any top 10 since the start
- **Streak**: current consecutive streak of periods in the top 10

Example: `14 wks · 6 streak`

### Differences vs current Top10Race

| | Top10Race (current) | Billboard Race (POC) |
|---|---|---|
| Bar metric | cumulative streams since start | weeks in the top 10 |
| Right value | stream count | total weeks + streak |
| Frame granularity | 1 frame = 1 day | 1 frame = 1 period (week?) |
| SQL | cumsum over daily_plays | count of periods where rank ≤ 10 |

### Open questions for the POC

- **Granularity**: week is the natural choice (Billboard), to be validated on real data. Test with 200 periods to assess readability.
- **Streak**: current streak or all-time max streak? Both make sense depending on the viewing moment.
- **Component**: dedicated new component (recommended) vs parameter on existing Top10Race. SQL logic and data model are different enough to justify a separate component.
- **Entities**: artists only for the POC, extend to tracks/albums if successful.

### Target component (provisional)

`Top10BillboardRace` — new component in `LabCharts/`, independent of `Top10Race/`.

---

## 10. Boundaries

| | Rule |
|---|---|
| Always | Reset frame index when entity or year changes |
| Always | Keep IntersectionObserver pause-when-hidden behavior |
| Always | Entity switch lives at ChartCard level, not in animation controls |
| Ask first | Any change to SQL query grouping logic |
| Never | Touch `Top10AlbumsEvolution/` or `Top10TracksEvolution/` — separate charts, different purpose |
| Never | Server-side data processing |
| Never | External API calls with user data |
