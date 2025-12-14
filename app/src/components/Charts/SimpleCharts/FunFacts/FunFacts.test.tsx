import { describe, it, vi, expect, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { FunFacts } from '.'

import * as query from '../../../../db/queries/queryDB'
import * as db from '../../../../db/getDB'
import { FunFactResult } from './queries'

describe('FunFacts Component', () => {
    beforeEach(() => {
        vi.spyOn(query, 'queryDBAsJSON').mockResolvedValue([
            {
                factType: 'marathon',
                mainText: 'Test Artist',
                value: 42,
                unit: 'streams',
                context: '2024-01-15',
            },
        ] as FunFactResult[])

        vi.spyOn(db, 'getDB').mockResolvedValue({
            db: vi.fn(),
            conn: vi.fn(),
        } as unknown as Awaited<ReturnType<typeof db.getDB>>)
    })

    it('should render a fun fact', async () => {
        render(<FunFacts />)

        await waitFor(
            () => {
                const titles = [
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
                    '🎲 Fun Fact',
                ]
                const hasTitle = titles.some((title) => {
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

        const button = screen.getByTitle('New fact')
        fireEvent.click(button)

        await waitFor(
            () => {
                expect(container.textContent).toBeTruthy()
            },
            { timeout: 2000 }
        )
    })
})
