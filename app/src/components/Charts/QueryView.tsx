import { DuckDBShell } from '../DuckDBShell/DuckDBShell'

export function QueryView() {
    return (
        <div className="flex flex-col gap-4 py-4">
            <DuckDBShell />
        </div>
    )
}
