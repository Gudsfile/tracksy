import { describe, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EvolutionOverTime } from './EvolutionOverTime'

describe('EvolutionOverTime Component', () => {
    it('renders correctly with data', async () => {
        const data = [
            { year: 2020, streams: 100 },
            { year: 2021, streams: 150 },
            { year: 2022, streams: 200 },
        ]

        render(<EvolutionOverTime data={data} />)

        screen.getByText('📈 Evolution')
        screen.getByText('2020: 100')
        screen.getByText('2021: 150')
        screen.getByText('2022: 200')
        screen.getByText('Total streams')
        screen.getByText('450')
    })
})
