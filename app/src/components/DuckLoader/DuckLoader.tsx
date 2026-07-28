import { ProgressBar } from '../ProgressBar/ProgressBar'

const SIZE = 112
// The glyph only needs part of the box; the rest is headroom for the ripples.
const GLYPH_SIZE = SIZE * 0.62

/**
 * The duck emoji bobbing over two expanding ripples.
 *
 * The whole block is decorative and hidden from assistive tech — screen readers
 * announce 🦆 as "duck", which would talk over the loading status next to it.
 *
 * These are the app's only looping animations, so both honour the OS reduced-
 * motion setting: the duck simply holds still, but the ripples are hidden
 * outright. Their keyframes have no resting state, so an unanimated ripple is
 * not a faded-out one — it is an opaque ring at full scale, and two of them
 * overlapping is worse than no ripples at all. Same reason they go when `still`.
 */
function FloatingDuck({ still }: { still: boolean }) {
    const ripple = [
        'absolute bottom-1 h-3 w-3/4 rounded-[50%] border-2',
        'border-slate-300 dark:border-slate-600',
        still ? 'hidden' : 'animate-duck-ripple motion-reduce:hidden',
    ].join(' ')

    return (
        <div
            aria-hidden="true"
            className={`relative flex items-end justify-center ${
                still ? 'opacity-60 grayscale' : ''
            }`}
            style={{ width: SIZE, height: SIZE }}
        >
            <div className={ripple} />
            <div className={`${ripple} [animation-delay:1.2s]`} />
            <span
                // leading-none: the default line box adds slack around a ~70px
                // glyph and pushes the duck off-centre.
                className={`relative leading-none ${
                    still ? '' : 'animate-duck-bob motion-reduce:animate-none'
                }`}
                style={{ fontSize: GLYPH_SIZE }}
            >
                🦆
            </span>
        </div>
    )
}

type DuckLoaderProps = {
    /** Human-readable description of what is happening right now. */
    stage: string
    /** Omit or pass null when no real progress is known — the bar is hidden. */
    percent?: number | null
    error?: Error | null
    onRetry?: () => void
}

export function DuckLoader({
    stage,
    percent = null,
    error = null,
    onRetry,
}: DuckLoaderProps) {
    return (
        <div className="flex flex-col items-center justify-center gap-4 py-8 animate-fade-in motion-reduce:animate-none">
            <FloatingDuck still={error !== null} />

            {error ? (
                <div
                    role="alert"
                    className="flex flex-col items-center gap-3 text-center"
                >
                    <p className="text-gray-700 dark:text-slate-300">
                        The database engine failed to start.
                    </p>
                    {onRetry && (
                        <button
                            type="button"
                            onClick={onRetry}
                            className="rounded-lg bg-gradient-brand px-4 py-2 text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple"
                        >
                            Retry
                        </button>
                    )}
                    {/* Nothing else records this: the app has no telemetry, so
                        without it someone reporting "it won't load" has nothing
                        to paste. */}
                    {error.message && (
                        <details className="max-w-md text-sm text-gray-500 dark:text-slate-400">
                            <summary className="cursor-pointer">
                                Details
                            </summary>
                            <p className="mt-1 font-mono break-words text-left">
                                {error.message}
                            </p>
                        </details>
                    )}
                </div>
            ) : (
                <>
                    {/* The live region is the caption alone — `status` already
                        implies aria-live="polite". Putting it around the bar too
                        would make screen readers re-announce on every progress
                        event. */}
                    <p
                        role="status"
                        className="text-gray-600 dark:text-slate-300"
                    >
                        {stage}
                    </p>
                    {percent !== null && (
                        <ProgressBar
                            stage={stage}
                            percent={percent}
                            showLabel={false}
                        />
                    )}
                </>
            )}
        </div>
    )
}
