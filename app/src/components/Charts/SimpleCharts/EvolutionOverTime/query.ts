import { TABLE } from '../../../../db/queries/constants'
import sqlQueryEvolutionOverTime from './EvolutionOverTime.sql?raw'

export type EvolutionResult = {
    stream_year: number
    stream_count: number
    ms_played: number
}

export function queryEvolutionOverTime(): string {
    return sqlQueryEvolutionOverTime.replaceAll('${table}', TABLE)
}
