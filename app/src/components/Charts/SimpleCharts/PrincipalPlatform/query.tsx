import { TABLE } from '../../../../db/queries/constants'

export type PlatformResult = {
    platform: string
    stream_count: number
    pct: number
}

export function queryPrincipalPlatform(): string {
    return `
    WITH normalized_platforms AS (
      SELECT
        CASE
          WHEN LOWER(platform) LIKE 'android%' AND LOWER(platform) NOT LIKE '%tv%' THEN 'Android OS'
          WHEN LOWER(platform) LIKE '%android_tv%' OR LOWER(platform) LIKE '%android tv%' THEN 'Android TV'
          WHEN LOWER(platform) LIKE '%google cast%' OR LOWER(platform) LIKE '%chromecast%' THEN 'Chromecast'
          WHEN LOWER(platform) LIKE 'ios%' OR LOWER(platform) LIKE '%partner ios%' THEN 'iOS'
          WHEN LOWER(platform) LIKE 'osx%' OR LOWER(platform) LIKE 'os x%' THEN 'MacOS'
          WHEN LOWER(platform) LIKE 'sonos_%' OR LOWER(platform) LIKE '%partner sonos%' THEN 'Sonos'
          WHEN LOWER(platform) LIKE '%webos_tv%' OR LOWER(platform) LIKE '%webos tv%' THEN 'WebOS TV'
          WHEN LOWER(platform) LIKE 'webplayer%' OR LOWER(platform) LIKE 'web_player%' OR LOWER(platform) LIKE '%spotify web_player%' THEN 'WebPlayer'
          WHEN LOWER(platform) LIKE 'windows%' THEN 'Windows'
          ELSE 'Others'
        END as platform
      FROM ${TABLE}
      WHERE platform IS NOT NULL
    ),
    platform_counts AS (
      SELECT
        platform,
        COUNT(*) as stream_count,
        COUNT(*)::DOUBLE / (SELECT COUNT(*) FROM ${TABLE} WHERE platform IS NOT NULL)::DOUBLE * 100 as pct
      FROM normalized_platforms
      GROUP BY platform
    ),
    top_platforms AS (
      SELECT
        platform,
        stream_count,
        pct,
        ROW_NUMBER() OVER (ORDER BY stream_count DESC) as rank
      FROM platform_counts
      WHERE platform != 'Others'
    ),
    other_platforms AS (
      SELECT
        'Others' as platform,
        SUM(stream_count) as stream_count,
        SUM(pct) as pct
      FROM (
        SELECT * FROM top_platforms WHERE rank > 3
        UNION ALL
        SELECT platform, stream_count, pct, 999 as rank FROM platform_counts WHERE platform = 'Others'
      )
    )
    SELECT
      platform,
      stream_count::DOUBLE as stream_count,
      pct
    FROM (
      SELECT platform, stream_count, pct FROM top_platforms WHERE rank <= 3
      UNION ALL
      SELECT platform, stream_count, pct FROM other_platforms WHERE stream_count > 0
    )
    ORDER BY 
      CASE WHEN platform = 'Others' THEN 1 ELSE 0 END,
      stream_count DESC
  `
}
