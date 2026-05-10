import { render, screen } from '@testing-library/react'
import { describe, it } from 'vitest'
import { ChartCardEmpty } from './ChartCardEmpty'

describe('ChartCardEmpty', () => {
    it('renders the empty state message', () => {
        render(<ChartCardEmpty />)
        screen.getByText('No data for this year')
    })
})
