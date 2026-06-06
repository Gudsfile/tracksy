"""Ephemeral acceptance tests for persona-driven chart classifications.

These tests demonstrate that the persona system triggers meaningful
SimpleView chart classifications. They are removed before merge.

To revive them after removal, check out the commit that added this file.
The sha is recorded in the PR description.

Queries replicate app SQL (app/src/db/) via DuckDB locally.
"""

import json
import os
import tempfile
from collections.abc import Generator
from datetime import datetime
from typing import NamedTuple

import duckdb
import pytest

from synthetic_datasets.config import GenerationConfig
from synthetic_datasets.factories.spotify import SpotifyFactory
from synthetic_datasets.personas import (
    CURRENT_ERA,
    MORNING_COMMUTER,
    NIGHT_OWL,
    SETTLED_LISTENER,
)


class _E2EContext(NamedTuple):
    con: duckdb.DuckDBPyConnection
    factory: SpotifyFactory


E2E_SEED = 653265
E2E_REFERENCE_DATE = datetime(2026, 1, 15, 1, 2, 3)
E2E_NUM_RECORDS = 1000

# Classification thresholds -- kept in sync with app/src/components/Charts/
# SimpleCharts/SessionAnalysis/SessionAnalysis.tsx
SESSION_EXPRESS_THRESHOLD_MS = 1_200_000  # avg < 20 min
SESSION_MARATHON_THRESHOLD_MS = 3_600_000  # avg >= 60 min

# Thresholds -- kept in sync with classifySkipRate.ts
SKIP_PATIENT_THRESHOLD = 75  # complete_pct > 75% = Patient
SKIP_IMPATIENT_THRESHOLD = 50  # complete_pct < 50% = Impatient


def _canonical_row(r):
    d = r.model_dump(mode="json")
    return {
        "ts": d["ts"],
        "ms_played": d["ms_played"],
        "reason_end": d["reason_end"],
        "artist_name": d["master_metadata_album_artist_name"],
        "track_name": d["master_metadata_track_name"],
        "album_name": d["master_metadata_album_album_name"],
        "track_uri": d["spotify_track_uri"],
        "shuffle": d["shuffle"],
        "skipped": d["skipped"],
        "platform": d["platform"],
    }


@pytest.fixture(scope="module")
def e2e_ctx() -> Generator[_E2EContext, None, None]:
    config = GenerationConfig(seed=E2E_SEED, reference_date=E2E_REFERENCE_DATE)
    factory = SpotifyFactory(E2E_NUM_RECORDS, config)
    records = factory.create_streaming_history()

    rows = [_canonical_row(r) for r in records]
    with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as f:
        json.dump(rows, f)
        fname = f.name

    con = duckdb.connect()
    con.execute(f"CREATE TABLE music_streams AS SELECT * FROM read_json_auto('{fname}')")
    os.unlink(fname)

    # sessions table -- replicates app/src/db/stream_sessions.sql
    con.execute("""
        CREATE TABLE stream_sessions AS
        WITH ordered AS (
            SELECT ts, ms_played,
                lag(ts) OVER (ORDER BY ts) AS prev_ts
            FROM music_streams
            WHERE ts IS NOT NULL
        ),
        session_starts AS (
            SELECT ts, ms_played,
                CASE
                    WHEN prev_ts IS NULL
                        OR date_diff('minute', prev_ts::timestamp, ts::timestamp) > 15
                    THEN 1 ELSE 0
                END AS is_new_session
            FROM ordered
        ),
        session_ids AS (
            SELECT ts, ms_played,
                sum(is_new_session) OVER (ORDER BY ts ROWS UNBOUNDED PRECEDING) AS session_id
            FROM session_starts
        )
        SELECT
            session_id,
            count(*)::double AS track_count,
            sum(ms_played)::double AS duration_ms,
            min(ts) AS session_start,
            max(ts) AS session_end
        FROM session_ids
        GROUP BY session_id
        HAVING count(*) > 1
        ORDER BY session_start
    """)

    yield _E2EContext(con=con, factory=factory)
    con.close()


def _rhythm(con, year):
    row = con.execute(f"""
        SELECT
            count(*) FILTER (WHERE hour(ts::timestamp) >= 6 AND hour(ts::timestamp) < 12) AS morning,
            count(*) FILTER (WHERE hour(ts::timestamp) >= 12 AND hour(ts::timestamp) < 18) AS afternoon,
            count(*) FILTER (WHERE hour(ts::timestamp) >= 18 AND hour(ts::timestamp) < 22) AS evening,
            count(*) FILTER (WHERE hour(ts::timestamp) >= 22 OR hour(ts::timestamp) < 6) AS night
        FROM music_streams WHERE year(ts::timestamp) = {year}
    """).fetchone()
    return dict(zip(["morning", "afternoon", "evening", "night"], row))


def _skip_rate(con, year):
    complete, skipped = con.execute(f"""
        SELECT
            count(*) FILTER (WHERE reason_end = 'trackdone') AS complete,
            count(*) FILTER (WHERE reason_end IN ('fwdbtn', 'click-row', 'clickrow')) AS skipped
        FROM music_streams WHERE year(ts::timestamp) = {year}
    """).fetchone()
    total = complete + skipped
    if total == 0:
        return 0.0, 100.0
    return skipped / total, complete / total * 100


def _avg_session_ms(con, year):
    row = con.execute(f"""
        SELECT avg(duration_ms)
        FROM stream_sessions
        WHERE year(session_start::timestamp) = {year}
    """).fetchone()
    return row[0]


def _new_vs_old(con, year):
    new, old = con.execute(f"""
        WITH artist_first_listen AS (
            SELECT artist_name, min(year(ts::timestamp)) AS first_year
            FROM music_streams WHERE artist_name IS NOT NULL
            GROUP BY artist_name
        ),
        classified AS (
            SELECT CASE WHEN f.first_year = {year} THEN 'new' ELSE 'old' END AS category
            FROM music_streams m
            INNER JOIN artist_first_listen f USING (artist_name)
            WHERE year(ts::timestamp) = {year} AND artist_name IS NOT NULL
        )
        SELECT
            count(*) FILTER (WHERE category = 'new') AS new_streams,
            count(*) FILTER (WHERE category = 'old') AS old_streams
        FROM classified
    """).fetchone()
    return new, old


def _chapter_year(factory, persona):
    return next(ch.year for ch in factory.chapters if ch.persona is persona)


def _ghost_year(factory):
    return next(ch.year for ch in factory.chapters if ch.persona is None)


class TestGlobalAssertions:
    def test_ghost_year_has_zero_records(self, e2e_ctx):
        year = _ghost_year(e2e_ctx.factory)
        (count,) = e2e_ctx.con.execute(
            f"SELECT count(*) FROM music_streams WHERE year(ts::timestamp) = {year}"
        ).fetchone()
        assert count == 0

    def test_oldest_active_year_is_trend_hunter(self, e2e_ctx):
        factory = e2e_ctx.factory
        active = [ch for ch in factory.chapters if ch.persona is not None]
        oldest_year = min(ch.year for ch in active)
        new, old = _new_vs_old(e2e_ctx.con, oldest_year)
        # First year: every artist is heard for the first time -> all new
        assert new > old, f"Expected Trend Hunter at oldest year {oldest_year}, got new={new} old={old}"

    def test_later_active_years_are_comfort_listeners(self, e2e_ctx):
        factory = e2e_ctx.factory
        active = [ch for ch in factory.chapters if ch.persona is not None]
        oldest_year = min(ch.year for ch in active)
        for ch in active:
            if ch.year == oldest_year:
                continue
            new, old = _new_vs_old(e2e_ctx.con, ch.year)
            if new + old == 0:
                continue
            assert old > new, f"Expected Comfort Listener at year {ch.year}, got new={new} old={old}"

    def test_night_owl_year_has_night_as_dominant_rhythm(self, e2e_ctx):
        year = _chapter_year(e2e_ctx.factory, NIGHT_OWL)
        rhythm = _rhythm(e2e_ctx.con, year)
        dominant = max(rhythm, key=rhythm.get)
        assert dominant == "night", f"Night Owl year {year}: expected night peak, got {rhythm}"

    def test_morning_commuter_year_has_morning_as_dominant_rhythm(self, e2e_ctx):
        year = _chapter_year(e2e_ctx.factory, MORNING_COMMUTER)
        rhythm = _rhythm(e2e_ctx.con, year)
        dominant = max(rhythm, key=rhythm.get)
        assert dominant == "morning", f"Commuter year {year}: expected morning peak, got {rhythm}"

    def test_settled_listener_year_has_afternoon_or_evening_rhythm(self, e2e_ctx):
        year = _chapter_year(e2e_ctx.factory, SETTLED_LISTENER)
        rhythm = _rhythm(e2e_ctx.con, year)
        dominant = max(rhythm, key=rhythm.get)
        assert dominant in {"afternoon", "evening"}, (
            f"Settled year {year}: expected afternoon/evening peak, got {rhythm}"
        )


class TestPerPersonaAssertions:
    def test_night_owl_skip_rate(self, e2e_ctx):
        year = _chapter_year(e2e_ctx.factory, NIGHT_OWL)
        skip_rate, _ = _skip_rate(e2e_ctx.con, year)
        # Night Owl skip_chance = 0.45; statistical tolerance
        assert skip_rate > 0.30, f"Night Owl year {year}: expected skip_rate > 0.30, got {skip_rate:.3f}"

    def test_morning_commuter_skip_rate(self, e2e_ctx):
        year = _chapter_year(e2e_ctx.factory, MORNING_COMMUTER)
        skip_rate, _ = _skip_rate(e2e_ctx.con, year)
        # Morning Commuter skip_chance = 0.18
        assert skip_rate < 0.25, f"Commuter year {year}: expected skip_rate < 0.25, got {skip_rate:.3f}"

    def test_settled_listener_skip_rate(self, e2e_ctx):
        year = _chapter_year(e2e_ctx.factory, SETTLED_LISTENER)
        skip_rate, _ = _skip_rate(e2e_ctx.con, year)
        # Settled Listener skip_chance = 0.08
        assert skip_rate < 0.15, f"Settled year {year}: expected skip_rate < 0.15, got {skip_rate:.3f}"

    def test_night_owl_skips_more_than_settled_listener(self, e2e_ctx):
        factory = e2e_ctx.factory
        owl_rate, _ = _skip_rate(e2e_ctx.con, _chapter_year(factory, NIGHT_OWL))
        settled_rate, _ = _skip_rate(e2e_ctx.con, _chapter_year(factory, SETTLED_LISTENER))
        assert owl_rate > settled_rate, (
            f"Night Owl skip_rate ({owl_rate:.3f}) should exceed Settled ({settled_rate:.3f})"
        )

    def test_current_era_has_records_within_reference_date(self, e2e_ctx):
        factory = e2e_ctx.factory
        year = _chapter_year(factory, CURRENT_ERA)
        ref_date = E2E_REFERENCE_DATE.date().isoformat()
        (count,) = e2e_ctx.con.execute(
            f"SELECT count(*) FROM music_streams WHERE year(ts::timestamp) = {year}"
        ).fetchone()
        assert count >= 1, f"Current Era year {year} has no records"
        # Factory clamps to reference_date.date(); events on that day may have any hour
        (beyond,) = e2e_ctx.con.execute(
            f"SELECT count(*) FROM music_streams WHERE date_trunc('day', ts::timestamp) > '{ref_date}'"
        ).fetchone()
        assert beyond == 0, f"{beyond} records fall after reference date {ref_date}"

    def test_sessions_exist_for_all_active_years(self, e2e_ctx):
        factory = e2e_ctx.factory
        for ch in factory.chapters:
            if ch.persona is None:
                continue
            avg_ms = _avg_session_ms(e2e_ctx.con, ch.year)
            assert avg_ms is not None and avg_ms > 0, f"No sessions found for year {ch.year} ({ch.persona.name})"
