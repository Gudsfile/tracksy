import { describe, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChartHero } from './ChartHero'

describe('ChartHero Component', () => {
    it('renders label and emoji correctly', () => {
        render(<ChartHero label="Test Label" emoji="🚀" />)

        screen.getByText('Test Label')
        screen.getByText('🚀')
    })

    it('renders sublabel when provided', () => {
        render(
            <ChartHero label="Test Label" sublabel="Test Sublabel" emoji="🚀" />
        )

        screen.getByText('Test Sublabel')
    })
})
