import React, { useEffect, useRef, useState } from 'react'

interface RangeSliderProps {
    value: number
    onChange: React.Dispatch<React.SetStateAction<number>>
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

    useEffect(() => {
        if (sliderRef.current) {
            const percent = (value - min) / (max - min)
            const thumbWidth = 20
            const sliderWidth = sliderRef.current.offsetWidth
            const availableWidth = sliderWidth - thumbWidth
            setThumbPosition(thumbWidth / 2 + percent * availableWidth)
        }
    }, [value, min, max])

    return (
        <div className="w-full relative space-y-2">
            <div className="relative">
                <div
                    className="absolute -top-9 px-2 py-1 text-sm font-semibold text-white bg-blue-600 rounded"
                    style={{
                        left: `${thumbPosition}px`,
                        transform: 'translateX(-50%)',
                    }}
                >
                    {value}
                </div>

                <input
                    ref={sliderRef}
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="w-full"
                />
            </div>

            <div className="flex justify-between text-sm text-gray-500">
                <span>{min}</span>
                <span>{max}</span>
            </div>
        </div>
    )
}
