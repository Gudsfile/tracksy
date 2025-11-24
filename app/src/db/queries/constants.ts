export const TABLE = 'spotitable'

export const DROP_TABLE_QUERY = `DROP TABLE IF EXISTS ${TABLE}`

const MIN_STREAM_DURATION = 30000 // Spotify consider a stream as a play of at least 30 seconds
export const DELETE_SHORT_STREAMS_QUERY = `DELETE FROM ${TABLE} WHERE ms_played < ${MIN_STREAM_DURATION}`
