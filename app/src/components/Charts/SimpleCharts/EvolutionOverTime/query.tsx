import { TABLE } from '../../../../db/queries/constants'
import sqlQueryEvolutionOverTime from './EvolutionOverTime.sql?raw'

export type EvolutionResult = {
    year: number
    streams: number
    ms_played: number
}

export function queryEvolutionOverTime(): string {
    return sqlQueryEvolutionOverTime.replaceAll('${table}', TABLE)
}
