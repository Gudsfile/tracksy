import { TABLE } from '../../../../db/queries/constants'

export type SkipRateResult = {
    complete_listens: number
    skipped_listens: number
}

export function querySkipRate(): string {
    return `
  SELECT
    COUNT(*) FILTER (WHERE reason_end = 'trackdone')::DOUBLE AS complete_listens,
    COUNT(*) FILTER (WHERE reason_end IN ('fwdbtn', 'click-row', 'clickrow'))::DOUBLE AS skipped_listens
  FROM ${TABLE}
  `
}
