import { useState, useCallback } from 'react'
import { getDB } from '../../db/getDB'

const MAX_ROWS = 1000
const MAX_HISTORY = 20

export function DuckDBShell() {
    const [query, setQuery] = useState(
        'SELECT 42 AS answer;\n-- tips: use `show tables` to… show tables'
    )
    const [results, setResults] = useState<
        { columns: string[]; rows: string[][]; totalRows: number } | undefined
    >()
    const [error, setError] = useState<string | undefined>()
    const [loading, setLoading] = useState(false)
    const [history, setHistory] = useState<string[]>([])

    const runQuery = useCallback(async () => {
        setLoading(true)
        setError(undefined)

        try {
            const { conn } = await getDB()
            const result = await conn.query(query)

            if (!result) throw new Error('No result.')

            setResults({
                columns: result.schema.fields.map((field) => field.name),
                rows: result
                    .toArray()
                    .map((row) => Object.values(row).map(String))
                    .slice(0, MAX_ROWS),
                totalRows: result.numRows,
            })

            // Only last 20 different queries are saved in the history
            setHistory((prev) => [
                query,
                ...prev
                    .filter((item) => item !== query)
                    .slice(0, MAX_HISTORY - 1),
            ])
        } catch (err: Error | unknown) {
            setResults(undefined)
            setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setLoading(false)
        }
    }, [query])

    return (
        <div className="group p-6 my-4 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-300/60 dark:border-slate-700/50 text-gray-900 dark:text-gray-100">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                ⌨️ DuckDB Shell
            </h3>

            <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                rows={4}
                className="bg-gray-200 dark:bg-slate-700/50 rounded-lg text-sm"
                style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    resize: 'vertical',
                    fontFamily: 'monospace',
                }}
            />

            <div className="grid grid-cols-3">
                <button
                    onClick={runQuery}
                    className="bg-brand-purple rounded-lg text-gray-100 cursor-pointer col-start-2"
                    style={{
                        marginTop: '0.5rem',
                        padding: '0.5rem 1rem',
                    }}
                >
                    Run query
                </button>
            </div>

            {loading && (
                <p className="mt-2 italic font-mono">Run in progress…</p>
            )}

            {error && (
                <div className="mt-4 rounded border border-red-600 bg-red-100 p-2 font-mono text-red-900">
                    SQL Error: {error}
                </div>
            )}

            {results && (
                <section className="mt-4">
                    <p className="mb-2 text-sm">
                        {results.rows.length} / {results.totalRows} rows
                        displayed
                    </p>

                    <div className="max-h-[400px] overflow-auto rounded border border-gray-600 font-mono">
                        <table className="min-w-full border-collapse">
                            <thead className="sticky top-0 bg-gray-100 dark:bg-slate-800">
                                <tr>
                                    {results.columns.map((name) => (
                                        <th
                                            key={name}
                                            className="border border-gray-600 px-2 py-1 text-left text-sm font-semibold"
                                        >
                                            {name}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {results.rows.map((row, rowIdx) => (
                                    <tr
                                        key={rowIdx}
                                        className="odd:bg-gray-50 dark:odd:bg-slate-800/50"
                                    >
                                        {row.map((cell, cellIdx) => (
                                            <td
                                                key={cellIdx}
                                                className="whitespace-nowrap border border-gray-600 px-2 py-1 text-sm"
                                            >
                                                {cell}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {history.length > 0 && (
                <div className="mt-4 border-t pt-2">
                    <h4 className="mb-2">Query history (max {MAX_HISTORY})</h4>
                    <ul className="font-mono text-sm">
                        {history.map((item, idx) => (
                            <li key={idx}>
                                <button onClick={() => setQuery(item)}>
                                    {item.length > 80
                                        ? item.slice(0, 80) + '…'
                                        : item}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}
