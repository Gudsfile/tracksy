import React from 'react'

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
    return (
        <div className="space-y-2">
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-500">
                <span>{min}</span>
                <span>{value}</span>
                <span>{max}</span>
            </div>
        </div>
    )
}
