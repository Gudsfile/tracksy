import { it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryView } from './QueryView'
import * as db from '../../db/getDB'

beforeEach(() => {
    vi.spyOn(db, 'getDB').mockResolvedValue({
        db: vi.fn(),
        conn: { query: vi.fn() },
    } as unknown as Awaited<ReturnType<typeof db.getDB>>)
})

it('renders DuckDB Shell', () => {
    render(<QueryView />)
    screen.getByText('⌨️ DuckDB Shell')
    screen.getByRole('button', { name: /Run query/i })
})
