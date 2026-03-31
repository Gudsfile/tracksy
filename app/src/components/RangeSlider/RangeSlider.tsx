import React, { useEffect, useRef, useState } from 'react'

interface RangeSliderProps {
    value: number | undefined
    onChange: (value: number | undefined) => void
    min: number
    max: number
    step: number
}

export function RangeSlider({
    value,
    onChange,
    min,
    max,
    step,
}: RangeSliderProps) {
    const [thumbPosition, setThumbPosition] = useState(0)
    const sliderRef = useRef<HTMLInputElement>(null)

    const sliderMin = min - 1
    const internalValue = value ?? sliderMin

    useEffect(() => {
        if (sliderRef.current) {
            const percent = (internalValue - sliderMin) / (max - sliderMin)
            const thumbWidth = 20
            const sliderWidth = sliderRef.current.offsetWidth
            const availableWidth = sliderWidth - thumbWidth
            setThumbPosition(thumbWidth / 2 + percent * availableWidth)
        }
    }, [internalValue, sliderMin, max])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = Number(e.target.value)
        onChange(v === sliderMin ? undefined : v)
    }

    const fillPercent = ((internalValue - sliderMin) / (max - sliderMin)) * 100

    return (
        <div className="w-full relative space-y-4 my-8 px-2">
            <div className="relative backdrop-blur-md px-4 py-4 rounded-2xl transition-all duration-300">
                {/* Year badge */}
                <div
                    className="absolute -top-12 px-4 py-2 text-base font-bold text-white bg-gradient-brand rounded-xl shadow-glow transition-all duration-300"
                    style={{
                        left: `${thumbPosition}px`,
                        transform: 'translateX(-50%)',
                    }}
                >
                    {value === undefined ? 'All' : value}
                </div>

                {/* Slider */}
                <input
                    ref={sliderRef}
                    type="range"
                    min={sliderMin}
                    max={max}
                    step={step}
                    value={internalValue}
                    onChange={handleChange}
                    className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer slider-thumb transition-all duration-200"
                    style={{
                        background: `linear-gradient(to right,
                            rgba(139, 92, 246, 0.8) 0%,
                            rgba(59, 130, 246, 0.8) ${fillPercent}%,
                            rgb(229, 231, 235) ${fillPercent}%,
                            rgb(229, 231, 235) 100%)`,
                    }}
                />
            </div>

            {/* Min/Max labels */}
            <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-gray-400">
                <span className="px-2 py-1 bg-gray-100 dark:bg-slate-800 rounded-lg">
                    All
                </span>
                <span className="px-2 py-1 bg-gray-100 dark:bg-slate-800 rounded-lg">
                    {max}
                </span>
            </div>
        </div>
    )
}
