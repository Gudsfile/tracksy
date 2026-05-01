import { describe, it, vi, expect, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { FunFacts } from '.'

import * as query from '../../../../db/queries/queryDB'
import * as db from '../../../../db/getDB'
import { FunFactResult } from './queries'

const allFactTitles = [
    '🌅 Musical Breakfast',
    '☀️ Afternoon Boost',
    '🌆 Calm Return',
    '🌙 Musical Insomnia',
    '🌙 Night Champion',
    '🎉 Weekend Vibes',
    '⏰ Peak Hour',
    '📅 Favorite Day',
    '❤️ Absolute Loyalty',
    '🎸 Monthly Subscription',
    '🕰️ Nostalgic Return',
    '🕰️ Forgotten Artist',
    '🎧 Binge Listener',
    '🔥 Unbeatable Streak',
    '🌈 Variety Day',
    '⭐ One-Hit Wonder',
    '🏃 Marathon',
    '🎵 Recent Discovery',
    '🔁 Current Obsession',
    '🎉 Musical Anniversary',
    '🦖 The Very First',
    '🔮 Listening Proposition',
    '🫂 Most Comforting Album',
    '🎲 Fun Fact',
]

describe('FunFacts Component', () => {
    beforeEach(() => {
        vi.spyOn(query, 'queryDBAsJSON').mockImplementation(
            async (sql: string) => {
                const match = sql.match(/'([a-z_]+)'\s+as\s+fact_type/)
                if (!match) return []
                return [
                    {
                        fact_type: match[1],
                        main_text: `Test ${match[1]}`,
                        value: 1,
                        unit: 'streams',
                    },
                ] as FunFactResult[]
            }
        )

        vi.spyOn(db, 'getDB').mockResolvedValue({
            db: vi.fn(),
            conn: vi.fn(),
        } as unknown as Awaited<ReturnType<typeof db.getDB>>)
    })

    it('should render a fun fact', async () => {
        render(<FunFacts />)

        await waitFor(
            () => {
                const hasTitle = allFactTitles.some((title) => {
                    try {
                        screen.getByText(title)
                        return true
                    } catch {
                        return false
                    }
                })
                expect(hasTitle).toBe(true)
            },
            { timeout: 3000 }
        )
    })

    it('should have a refresh button', async () => {
        render(<FunFacts />)

        await waitFor(() => {
            const button = screen.getByTitle('New fact')
            expect(button).toBeDefined()
        })
    })

    it('should refresh to a different fact when clicking refresh', async () => {
        const { container } = render(<FunFacts />)

        await waitFor(() => {
            expect(container.textContent).toBeTruthy()
        })

        const firstFact = container.textContent

        fireEvent.click(screen.getByTitle('New fact'))

        await waitFor(
            () => {
                expect(container.textContent).not.toBe(firstFact)
            },
            { timeout: 2000 }
        )

        const secondFact = container.textContent

        expect(secondFact).not.toBe(firstFact)
    })
})
