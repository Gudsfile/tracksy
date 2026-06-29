import { DuckDBShell } from '../DuckDBShell/DuckDBShell'

export function QueryView({
    initialQuery,
    onQueryConsumed,
}: {
    initialQuery?: string
    onQueryConsumed?: () => void
}) {
    return (
        <div className="flex flex-col gap-4 py-4">
            <DuckDBShell
                initialQuery={initialQuery}
                onQueryConsumed={onQueryConsumed}
            />
        </div>
    )
}
