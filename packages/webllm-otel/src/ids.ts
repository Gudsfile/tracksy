/**
 * Trace and span identifiers, generated in the shape OTLP expects.
 *
 * Producing them natively — rather than minting friendlier ids and converting at
 * export time — means there is never a mapping layer between the in-memory trace
 * store and the wire format, and no chance of the two disagreeing.
 *
 * @see https://opentelemetry.io/docs/specs/otel/trace/api/#spancontext
 */

const TRACE_ID_BYTES = 16
const SPAN_ID_BYTES = 8

function randomHex(byteLength: number): string {
    const bytes = new Uint8Array(byteLength)
    crypto.getRandomValues(bytes)
    // An all-zero id is explicitly invalid in the spec and is silently dropped by
    // some collectors. The odds are negligible, but the guard costs one pass and
    // removes the failure mode rather than leaving it to chance.
    if (bytes.every((byte) => byte === 0)) {
        bytes[0] = 1
    }
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(
        ''
    )
}

/** A 16-byte trace id, hex-encoded to 32 characters. */
export function newTraceId(): string {
    return randomHex(TRACE_ID_BYTES)
}

/** An 8-byte span id, hex-encoded to 16 characters. */
export function newSpanId(): string {
    return randomHex(SPAN_ID_BYTES)
}
