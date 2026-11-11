/**
 * Clock handling.
 *
 * OTLP timestamps are nanoseconds since the Unix epoch. That range does not fit
 * in a JavaScript number (`1.7e18` against a safe limit of `9e15`), so they are
 * built as decimal strings by concatenation rather than multiplied — multiplying
 * would silently round away the low digits.
 *
 * A limit worth knowing: the *input* is epoch milliseconds as a double, and at
 * present-day epoch values (~1.7e12) only about 11 mantissa bits remain for the
 * fraction. Sub-millisecond resolution is therefore quantised to roughly 488 ns.
 * The nanosecond digits are exact for what the double holds, but the double
 * itself cannot represent a finer instant. That is far below any latency this
 * library is used to measure, and it is a property of the clock, not of the
 * conversion — but it does mean the last two nanosecond digits carry no
 * information.
 */

const NANOS_PER_MILLI = 1_000_000
const NANO_DIGITS = 6

/** Epoch milliseconds, with sub-millisecond precision where available. */
export type Clock = () => number

/**
 * `performance.timeOrigin + performance.now()` gives a monotonic, sub-millisecond
 * epoch time, so spans in the same run stay correctly ordered even if the wall
 * clock is adjusted mid-run. Falls back to `Date.now()` where it is unavailable.
 */
export const defaultClock: Clock = () => {
    if (
        typeof performance !== 'undefined' &&
        typeof performance.timeOrigin === 'number'
    ) {
        return performance.timeOrigin + performance.now()
    }
    return Date.now()
}

/** Converts epoch milliseconds to an OTLP nanosecond timestamp string. */
export function toUnixNano(epochMillis: number): string {
    const millis = Math.floor(epochMillis)
    let nanosWithinMilli = Math.round((epochMillis - millis) * NANOS_PER_MILLI)

    // Rounding can push the fraction to a full millisecond; carry it rather than
    // emitting an out-of-range `1000000` in the nanosecond digits.
    if (nanosWithinMilli >= NANOS_PER_MILLI) {
        return `${millis + 1}${'0'.repeat(NANO_DIGITS)}`
    }
    if (nanosWithinMilli < 0) {
        nanosWithinMilli = 0
    }

    return `${millis}${String(nanosWithinMilli).padStart(NANO_DIGITS, '0')}`
}
