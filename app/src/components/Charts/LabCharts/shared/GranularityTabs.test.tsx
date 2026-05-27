import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { GranularityTabs } from './GranularityTabs'

describe('GranularityTabs', () => {
    it('active button has correct active class', () => {
        render(
            <GranularityTabs
                value="month"
                available={['month', 'week', 'day']}
                onChange={vi.fn()}
            />
        )
        const monthBtn = screen.getByRole('button', { name: 'Month' })
        expect(monthBtn.className).toContain('bg-blue-500')
    })

    it('available buttons call onChange on click', () => {
        const onChange = vi.fn()
        render(
            <GranularityTabs
                value="month"
                available={['month', 'week', 'day']}
                onChange={onChange}
            />
        )
        fireEvent.click(screen.getByRole('button', { name: 'Week' }))
        expect(onChange).toHaveBeenCalledWith('week')
    })

    it('disabled buttons do not call onChange', () => {
        const onChange = vi.fn()
        render(
            <GranularityTabs
                value="month"
                available={['year', 'month']}
                onChange={onChange}
            />
        )
        const weekBtn = screen.getByRole('button', { name: 'Week' })
        expect((weekBtn as HTMLButtonElement).disabled).toBe(true)
        fireEvent.click(weekBtn)
        expect(onChange).not.toHaveBeenCalled()
    })
})
