import { useEffect, useState } from 'react'
import { getDB } from '../../db/getDB'
import type { DuckdbApp as DuckdbAppType } from '../../db/setupDB'

export function DuckDBShell() {
    const [db, setDb] = useState<DuckdbAppType | null>(null)
    const [query, setQuery] = useState('SELECT 42 AS answer;')
    const [results, setResults] = useState<{
        columns: string[]
        rows: string[][]
    } | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [history, setHistory] = useState<string[]>([])

    useEffect(() => {
        const initDB = async () => {
            const db = await getDB()
            setDb(db)
        }
        initDB()
    }, [])

    const runQuery = async () => {
        if (!db) return
        setLoading(true)
        try {
            const result = await db.conn.query(query)

            if (!result) {
                throw new Error('Pas de résultat.')
            }

            setResults({
                columns: result.schema.fields.map((field) => field.name),
                rows: result
                    .toArray()
                    .map((row) => Object.values(row).map(String)),
            })

            results?.rows.map((row, idx) => {
                console.log(`coucou ${row}, ${idx}`)
                return
            })

            setHistory((prev) => [query, ...prev.slice(0, 19)]) // Max 20

            setError(null)
        } catch (err: any) {
            setResults(null)
            setError(err.message || 'Erreur inconnue')
        } finally {
            setLoading(false)
        }
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
                maxWidth: '100%',
                width: '800px',
                margin: '0 auto',
            }}
        >
            <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                rows={4}
                style={{
                    width: '100%',
                    backgroundColor: '#2a2a3d',
                    color: '#f8f8f2',
                    border: '1px solid #444',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    resize: 'vertical',
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
            {loading && (
                <div
                    style={{
                        marginTop: '0.5rem',
                        color: 'var(--text)',
                        fontStyle: 'italic',
                    }}
                >
                    Exécution en cours...
                </div>
            )}

            {error && (
                <div
                    style={{
                        marginTop: '1rem',
                        backgroundColor: '#ffdddd',
                        color: '#700',
                        padding: '0.5rem',
                        borderRadius: '4px',
                        border: '1px solid #e00',
                    }}
                >
                    Erreur SQL : {error}
                </div>
            )}
            {results && (
                <div
                    style={{
                        marginTop: '1rem',
                        overflowX: 'auto',
                        maxHeight: '400px',
                        overflowY: 'auto',
                        border: '1px solid #444',
                        borderRadius: '4px',
                    }}
                >
                    <table
                        style={{
                            minWidth: '100%',
                            borderCollapse: 'collapse',
                            backgroundColor: '#2a2a3d',
                            color: '#e0e0e0',
                        }}
                    >
                        <thead>
                            <tr>
                                {results.columns.map((name, idx) => (
                                    <th key={idx}>{name}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {results.rows.map((row, idx) => (
                                <tr key={idx}>
                                    {row.map((cell, jdx) => (
                                        <td
                                            key={jdx}
                                            style={{
                                                border: '1px solid #444',
                                                padding: '0.5rem',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {cell}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {history.length > 0 && (
                <div
                    style={{
                        marginTop: '1rem',
                        borderTop: '1px solid var(--border)',
                        paddingTop: '0.5rem',
                    }}
                >
                    <h4 style={{ marginBottom: '0.5rem' }}>
                        Historique des requêtes
                    </h4>
                    <ul style={{ paddingLeft: '1rem', fontSize: '0.9rem' }}>
                        {history.map((item, idx) => (
                            <li key={idx}>
                                <button
                                    onClick={() => setQuery(item)}
                                    style={{
                                        background: 'none',
                                        color: 'var(--accent-light)',
                                        border: 'none',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        padding: 0,
                                    }}
                                >
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
