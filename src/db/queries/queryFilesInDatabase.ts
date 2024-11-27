
import { getDB } from "../getDB";

export type Results = {
  master_metadata_track_name: string;
  total_ms_played: number;
  count_play: number;
}[];

const TABLE = "spotitable";

const DROP_TABLE_QUERY = `DROP TABLE IF EXISTS ${TABLE}`;
const TRACK_METRICS_QUERY = `
WITH
metrics_by_track AS (
    SELECT
        spotify_track_uri,
        sum(ms_played)::int AS total_ms_played,
        count(*)::int as count_play
    FROM ${TABLE}
    GROUP BY spotify_track_uri
)
SELECT
    master_metadata_track_name,
    total_ms_played,
    count_play
FROM ${TABLE}
INNER JOIN metrics_by_track USING (spotify_track_uri)
GROUP BY ALL
ORDER BY
    count_play DESC,
    total_ms_played DESC,
    master_metadata_track_name ASC
`;

export async function queryFilesInDatabase(
  files: FileList
): Promise<Results | undefined> {
  const { db, conn } = await getDB();

  if (!db || !conn) {
    throw new Error("No database found");
  }

  if (files.length < 1) {
    console.error("No data");
    throw new Error("No data to process");
  }

  const file = files[0];
  console.warn("Multiple file processing is not yet implemented.");
  console.warn(`Only ${file.name} is taken into account.`);

  await conn.query(DROP_TABLE_QUERY);

  const reader = new FileReader();
  const fileText = await new Promise<string>((resolve, reject) => {
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });

  await db.registerFileText("spotify.json", fileText);
  await conn.insertJSONFromPath("spotify.json", { name: TABLE });
  // TODO prefer to use arrow than js object
  // const table = arrow.tableFromJSON(data);

  const results = await conn.query(TRACK_METRICS_QUERY);
  await conn.close();
  return results.toArray().map((row) => row.toJSON());
}
