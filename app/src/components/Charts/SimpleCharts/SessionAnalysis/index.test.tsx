import { describe, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import * as useDBQueryModule from '../../../../hooks/useDBQuery'
import { SessionAnalysis } from './index'

describe('SessionAnalysis container', () => {
    it('renders empty state when data is undefined and not loading', () => {
        vi.spyOn(useDBQueryModule, 'useDBQueryFirst').mockReturnValue({
            data: undefined,
            isLoading: false,
            error: undefined,
        })
        render(<SessionAnalysis year={2025} />)
        screen.getByText('No data for this year')
    })
})
