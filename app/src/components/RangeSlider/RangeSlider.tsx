import React, { useEffect, useRef, useState } from 'react'
import HSRangeSlider from '@preline/range-slider'

interface RangeSliderProps {
    range: [number, number]
    min: number
    max: number
    onRangeChange: React.Dispatch<
        React.SetStateAction<{ start: number; end: number }>
    >
    step: number
}

export function RangeSlider({
    range,
    onRangeChange,
    min,
    max,
    step,
}: RangeSliderProps) {
    const sliderRef = useRef<HTMLDivElement>(null)
    const [rangeTmp, setRangeTmp] = useState<[number, number]>([2006, 2026])

    useEffect(() => {
        if (!sliderRef.current) return

        const slider = new HSRangeSlider(sliderRef.current)

        const onChange = (e: any) => {
            const values: [number, number] = e.detail.value
            setRangeTmp(values)
            onRangeChange({ start: values[0], end: values[1] })
        }

        sliderRef.current.addEventListener('change', onChange)

        return () => {
            sliderRef.current?.removeEventListener('change', onChange)
        }
    }, [])

    return (
        <div className="w-full py-8">
            <label className="sr-only">Example range</label>
            <div
                ref={sliderRef}
                data-hs-range-slider={JSON.stringify({
                    start: rangeTmp,
                    range: { min: min, max: max },
                    connect: true,
                    pips: { mode: 'values', values: [2006, 2026], density: 10 },
                    tooltips: true,
                    step: step,
                    formatter: { type: 'integer' },
                    cssClasses: {
                        target: 'relative h-2 mb-10 rounded-full bg-gray-100 dark:bg-neutral-700',
                        base: 'size-full relative z-1',
                        origin: 'absolute top-0 end-0 size-full origin-[0_0] rounded-full',
                        handle: 'absolute top-1/2 end-0 size-4.5 bg-white dark:bg-neutral-800 border-4 border-blue-600 dark:border-blue-500 rounded-full cursor-pointer translate-x-2/4 -translate-y-2/4',
                        connects:
                            'relative z-0 size-full rounded-full overflow-hidden',
                        connect:
                            'absolute top-0 end-0 z-1 size-full origin-[0_0] bg-blue-600 dark:bg-blue-500',
                        touchArea: 'absolute -inset-1',
                        tooltip:
                            'bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-sm text-gray-800 dark:text-white py-1 px-2 rounded-lg mb-3 absolute bottom-full start-2/4 -translate-x-2/4',
                        pips: 'relative w-full h-10 mt-1',
                        value: 'absolute top-4 -translate-x-2/4 text-sm text-gray-400 dark:text-neutral-500',
                        marker: 'absolute border-s border-gray-400 dark:border-neutral-500',
                        markerNormal: 'h-2',
                        markerLarge: 'h-4',
                    },
                })}
            ></div>
        </div>
    )
}
