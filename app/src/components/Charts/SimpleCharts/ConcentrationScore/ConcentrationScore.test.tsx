import { describe, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ConcentrationScore } from './ConcentrationScore'

describe('ConcentrationScore Component', () => {
    it('renders correctly with data', async () => {
        const data = {
            top5_pct: 25,
            top10_pct: 40,
            top20_pct: 60,
        }

        render(<ConcentrationScore data={data} />)

        screen.getByText('📊 Concentration Score')

        screen.getByText('25.0%')
        screen.getByText('40.0%')
        screen.getByText('60.0%')
    })
})
