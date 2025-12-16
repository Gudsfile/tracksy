'use client'

import React, { useEffect, useRef, useState } from 'react'
import * as Plot from '@observablehq/plot'
import dayjs from 'dayjs'
import { StreaksQueryResult } from './query'

interface Props {
    data: StreaksQueryResult[]
}

export function Streaks({ data }: Props) {
    const ref = useRef<HTMLDivElement>(null)
    const [sliderPos, setSliderPos] = useState(0)
    const windowSize = 365

    const processedData = React.useMemo(() => {
        if (!data || data.length === 0) return []

        const playedDates = Array.from(
            new Set(data.map((item) => dayjs(item.day).format('YYYY-MM-DD')))
        ).sort()

        const start = dayjs(playedDates[0])
        const end = dayjs(playedDates[playedDates.length - 1])
        const allDates: string[] = []

        let current = start
        while (current.isBefore(end) || current.isSame(end)) {
            allDates.push(current.format('YYYY-MM-DD'))
            current = current.add(1, 'day')
        }

        const fullData = allDates.map((date) => ({
            day: date,
            played: playedDates.includes(date) ? 1 : 0,
        }))

        let currentStreak = 0
        return fullData.map(({ day, played }) => {
            if (played === 1) {
                currentStreak += 1
            } else {
                currentStreak = 0
            }
            return { day, streak: currentStreak }
        })
    }, [data])

    const maxStreak = React.useMemo(() => {
        if (processedData.length === 0) return 0
        return Math.max(...processedData.map((d) => d.streak))
    }, [processedData])

    const maxPos = Math.max(0, processedData.length - windowSize)
    const visibleData = processedData.slice(sliderPos, sliderPos + windowSize)

    useEffect(() => {
        if (!ref.current || visibleData.length === 0) return

        const width = ref.current.clientWidth
        const height = 300

        const parsedData = visibleData.map((d) => ({
            ...d,
            date: new Date(d.day),
        }))

        ref.current.innerHTML = ''

        const plot = Plot.plot({
            width,
            height,
            y: {
                label: 'Streak',
                zero: true,
                nice: true,
                grid: true,
                domain: [0, maxStreak],
            },
            x: {
                label: 'Date',
                tickFormat: (d: Date) => dayjs(d).format('MM-DD'),
                nice: true,
                type: 'time',
            },
            marks: [
                Plot.area(parsedData, {
                    x1: 'date',
                    y1: 'streak',
                    curve: 'monotone-x',
                    fill: '#6366f1',
                    fillOpacity: 0.3,
                    stroke: '#4f46e5',
                    strokeWidth: 1,
                }),
                Plot.line(parsedData, {
                    x: (d) => d.date,
                    y: (d) => d.streak,
                    curve: 'monotone-x',
                    stroke: '#4f46e5',
                    strokeWidth: 2,
                    tip: true,
                }),
            ],
        })

        ref.current.appendChild(plot)
    }, [visibleData])

    return (
        <div style={{ width: '100%' }}>
            <div ref={ref} />
            {processedData.length > windowSize && (
                <input
                    type="range"
                    min={0}
                    max={maxPos}
                    value={sliderPos}
                    onChange={(e) => setSliderPos(Number(e.target.value))}
                    style={{ width: '100%', marginTop: 8 }}
                    aria-label="Zoom timeline slider"
                />
            )}
        </div>
    )
}
