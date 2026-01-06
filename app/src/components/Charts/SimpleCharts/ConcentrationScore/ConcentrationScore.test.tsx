import { describe, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ConcentrationScore } from './ConcentrationScore'

describe('ConcentrationScore Component', () => {
    it.each([
        { top5_pct: 25, top10_pct: 40, top20_pct: 60 },
        { top5_pct: 1, top10_pct: 99, top20_pct: 0 },
    ])('renders correctly with data (%s)', (data) => {
        render(<ConcentrationScore data={data} />)

        screen.getByText('📊 Concentration Score')

        screen.getByText(`${data.top5_pct}.0%`)
        screen.getByText(`${data.top10_pct}.0%`)
        screen.getByText(`${data.top20_pct}.0%`)
    })
})
