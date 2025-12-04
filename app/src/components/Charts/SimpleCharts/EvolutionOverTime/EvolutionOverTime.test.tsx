import { describe, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EvolutionOverTime } from './EvolutionOverTime'

describe('EvolutionOverTime Component', () => {
    it('renders correctly with data', async () => {
        const data = [
            { year: 2020, streams: 100, ms_played: 60 * 60 * 1000 },
            { year: 2021, streams: 150, ms_played: 60 * 60 * 1000 },
            { year: 2022, streams: 200, ms_played: 60 * 60 * 1000 },
        ]

        render(<EvolutionOverTime data={data} />)

        screen.getByText('📈 Evolution')
        screen.getByText('2020 100 streams (1h 0m 0s)')
        screen.getByText('2021 150 streams (1h 0m 0s)')
        screen.getByText('2022 200 streams (1h 0m 0s)')
        screen.getByText('Total streams')
        screen.getByText('450')
    })
})
