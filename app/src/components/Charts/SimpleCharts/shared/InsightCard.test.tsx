import { describe, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { InsightCard } from './InsightCard'

describe('InsightCard Component', () => {
    it('renders children correctly', () => {
        render(
            <InsightCard>
                <span>Test Insight Content</span>
            </InsightCard>
        )

        screen.getByText('Test Insight Content')
    })
})
