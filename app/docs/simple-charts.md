# SimpleView Chart Catalog

Navigation reference: component directory → card title → what it shows → SQL source.

Render order follows `SimpleView.tsx`. Year-filtered means the chart responds to the year slider.

---

## Top Lists

| Component    | Card Title  | What it shows                               | SQL source       | Year-filtered |
| ------------ | ----------- | ------------------------------------------- | ---------------- | ------------- |
| `TopTracks`  | Top Tracks  | Top tracks by stream count and time played  | `TopTracks.sql`  | ✓             |
| `TopArtists` | Top Artists | Top artists by stream count and time played | `TopArtists.sql` | ✓             |
| `TopAlbums`  | Top Albums  | Top albums by stream count and time played  | `TopAlbums.sql`  | ✓             |

## Activity

| Component         | Card Title         | What it shows                                            | SQL source            | Year-filtered |
| ----------------- | ------------------ | -------------------------------------------------------- | --------------------- | ------------- |
| `CalendarHeatmap` | Listening activity | Daily stream count as a GitHub-style heatmap             | `CalendarHeatmap.sql` | ✓             |
| `HourlyStreams`   | Around the Clock   | Stream count distribution across the 24 hours of the day | `HourlyStreams.sql`   | ✓             |

## Listening Habits

| Component            | Card Title         | What it shows                                                                   | SQL source               | Year-filtered |
| -------------------- | ------------------ | ------------------------------------------------------------------------------- | ------------------------ | ------------- |
| `ConcentrationScore` | Focus Mode         | Share of streams going to the top 5, 10, and 20 artists                         | `ConcentrationScore.sql` | ✓             |
| `ListeningRhythm`    | Daily Vibes        | Stream count split across morning, afternoon, evening, and night                | `ListeningRhythm.sql`    | ✓             |
| `Regularity`         | Consistency Meter  | Active listening days, total days, and longest pause in the period              | `Regularity.sql`         | ✓             |
| `EvolutionOverTime`  | Soundtrack Growth  | Stream count and hours played per calendar year (all-time)                      | `EvolutionOverTime.sql`  | ✗             |
| `SeasonalPatterns`   | Seasonal Mood      | Stream count split across the four seasons                                      | `SeasonalPatterns.sql`   | ✓             |
| `NewVsOld`           | Fresh vs Familiar  | Share of streams to artists heard for the first time vs previously known        | `NewVsOld.sql`           | ✓             |
| `ArtistLoyalty`      | Artist Loyalty     | Artists bucketed by total stream count (1, 2-10, 11-100, …)                     | `ArtistLoyalty.sql`      | ✓             |
| `SkipRate`           | Skip Mood          | Ratio of completed listens to skipped tracks                                    | `SkipRate.sql`           | ✓             |
| `RepeatBehavior`     | Replay Energy      | Consecutive same-track repeat sequences: count, max, and most-replayed track    | `RepeatBehavior.sql`     | ✓             |
| `SessionAnalysis`    | Listening sessions | Listening session stats (gaps > 15 min split sessions): count, longest, average | `SessionAnalysis.sql`    | ✓             |

## Preferences

| Component           | Card Title         | What it shows                                    | SQL source              | Year-filtered |
| ------------------- | ------------------ | ------------------------------------------------ | ----------------------- | ------------- |
| `PrincipalPlatform` | Your Sound Machine | Top streaming platform by share of total streams | `PrincipalPlatform.sql` | ✓             |
| `FavoriteWeekday`   | Your Power Day     | Most active day of the week by stream count      | `FavoriteWeekday.sql`   | ✓             |

## Records

| Component          | Card Title   | What it shows                                                     | SQL source             | Year-filtered |
| ------------------ | ------------ | ----------------------------------------------------------------- | ---------------------- | ------------- |
| `UnbeatableStreak` | On a Roll    | Longest consecutive daily listening streak (start date, end date) | `UnbeatableStreak.sql` | ✓             |
| `BingeListener`    | Deep Dive    | Heaviest listening day by total hours played                      | `BingeListener.sql`    | ✓             |
| `VarietyDay`       | Eclectic Day | Most musically diverse day by distinct artist count               | `VarietyDay.sql`       | ✓             |

## Fun Facts

| Component  | Card Title | What it shows                                         | Year-filtered |
| ---------- | ---------- | ----------------------------------------------------- | ------------- |
| `FunFacts` | (rotating) | Random rotating fact card drawn from ~20 fact queries | ✗             |

---

## Naming notes

Directory names are technical and descriptive (`ConcentrationScore`, `ListeningRhythm`). Card titles are user-facing and evocative ("Focus Mode", "Daily Vibes"). This split is intentional — no renames are needed.

`EvolutionOverTime` is the only chart that does not respond to the year slider. It always shows the full all-time yearly trend, which is its purpose.
