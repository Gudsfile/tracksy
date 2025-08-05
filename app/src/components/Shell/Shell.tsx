import { useEffect, useState } from 'react'
import { getDB } from '../../db/getDB'
import type { DuckdbApp as DuckdbAppType } from '../../db/setupDB'

export function DuckDBShell() {
    const [db, setDb] = useState<DuckdbAppType | null>(null)
    const [query, setQuery] = useState('SELECT 42 AS answer;')
    const [results, setResults] = useState<string[][] | null>(null)

    useEffect(() => {
        const initDB = async () => {
            const db = await getDB()
            setDb(db)
        }
        initDB()
    }, [])

    const runQuery = async () => {
        if (!db) return
        const result = await db.conn.query(query)
        setResults(
            result.toArray().map((row) => Object.values(row).map(String))
        )
    }

    return (
        <div
            style={{
                backgroundColor: '#1e1e2f',
                padding: '1rem',
                borderRadius: '8px',
                color: '#e0e0e0',
                fontSize: '0.95rem',
                fontFamily: 'monospace',
            }}
        >
            <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                rows={4}
                cols={60}
                style={{
                    width: '100%',
                    backgroundColor: '#2a2a3d',
                    color: '#f8f8f2',
                    border: '1px solid #444',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    fontSize: '1rem',
                }}
            />
            <br />
            <button
                onClick={runQuery}
                style={{
                    marginTop: '0.5rem',
                    backgroundColor: 'rgb(var(--accent))',
                    color: '#fff',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                }}
            >
                Exécuter
            </button>

            {results && (
                <table
                    style={{
                        marginTop: '1rem',
                        width: '100%',
                        borderCollapse: 'collapse',
                        backgroundColor: '#2a2a3d',
                        color: '#e0e0e0',
                    }}
                >
                    <tbody>
                        {results.map((row, idx) => (
                            <tr key={idx}>
                                {row.map((cell, jdx) => (
                                    <td
                                        key={jdx}
                                        style={{
                                            border: '1px solid #444',
                                            padding: '0.5rem',
                                        }}
                                    >
                                        {cell}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    )
}
