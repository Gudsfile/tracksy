import React, { useEffect, useRef, useState } from 'react'

interface RangeSliderProps {
    value: number | [number, number]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onChange: (value: any) => void
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
    const isRange = Array.isArray(value)
    const [thumbPosition, setThumbPosition] = useState(0)
    const [secondThumbPosition, setSecondThumbPosition] = useState(0)
    const sliderRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (sliderRef.current) {
            const thumbWidth = 20
            const sliderWidth = sliderRef.current.offsetWidth
            const availableWidth = sliderWidth - thumbWidth

            if (isRange) {
                const [val1, val2] = value as [number, number]
                const percent1 = (val1 - min) / (max - min)
                const percent2 = (val2 - min) / (max - min)
                setThumbPosition(thumbWidth / 2 + percent1 * availableWidth)
                setSecondThumbPosition(
                    thumbWidth / 2 + percent2 * availableWidth
                )
            } else {
                const percent = ((value as number) - min) / (max - min)
                setThumbPosition(thumbWidth / 2 + percent * availableWidth)
            }
        }
    }, [value, min, max, isRange])

    const currentValue = isRange
        ? (value as [number, number])[1]
        : (value as number)
    const progress = isRange
        ? (((value as [number, number])[1] - (value as [number, number])[0]) /
              (max - min)) *
          100
        : (((value as number) - min) / (max - min)) * 100
    const startProgress = isRange
        ? (((value as [number, number])[0] - min) / (max - min)) * 100
        : 0

    return (
        <div className="w-full relative space-y-4 my-8 px-2">
            <div className="relative backdrop-blur-md px-4 py-6 rounded-2xl transition-all duration-300 overflow-visible">
                {/* Year badge(s) */}
                {isRange ? (
                    <>
                        <div
                            className="absolute px-4 py-2 text-base font-bold text-white bg-gradient-brand rounded-xl shadow-glow transition-all duration-300"
                            style={{
                                left: `${thumbPosition}px`,
                                top: '-2.5rem',
                                transform: 'translateX(-50%)',
                            }}
                        >
                            {(value as [number, number])[0]}
                        </div>
                        <div
                            className="absolute px-4 py-2 text-base font-bold text-white bg-gradient-brand rounded-xl shadow-glow transition-all duration-300"
                            style={{
                                left: `${secondThumbPosition}px`,
                                top: '-2.5rem',
                                transform: 'translateX(-50%)',
                            }}
                        >
                            {(value as [number, number])[1]}
                        </div>
                    </>
                ) : (
                    <div
                        className="absolute px-4 py-2 text-base font-bold text-white bg-gradient-brand rounded-xl shadow-glow transition-all duration-300"
                        style={{
                            left: `${thumbPosition}px`,
                            top: '-2.5rem',
                            transform: 'translateX(-50%)',
                        }}
                    >
                        {value}
                    </div>
                )}

                {/* Slider */}
                <input
                    ref={sliderRef}
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={currentValue}
                    onChange={(e) => {
                        const newVal = Number(e.target.value)
                        if (isRange) {
                            const [currentMin, currentMax] = value as [
                                number,
                                number,
                            ]
                            if (
                                Math.abs(newVal - currentMin) <
                                Math.abs(newVal - currentMax)
                            ) {
                                ;(
                                    onChange as (
                                        val: number | [number, number]
                                    ) => void
                                )([newVal, currentMax])
                            } else {
                                ;(
                                    onChange as (
                                        val: number | [number, number]
                                    ) => void
                                )([currentMin, newVal])
                            }
                        } else {
                            ;(
                                onChange as (
                                    val: number | [number, number]
                                ) => void
                            )(newVal)
                        }
                    }}
                    className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer slider-thumb transition-all duration-200"
                    style={{
                        background: isRange
                            ? `linear-gradient(to right,
                                rgb(229, 231, 235) ${startProgress}%,
                                rgba(59, 130, 246, 0.8) ${startProgress}%,
                                rgba(59, 130, 246, 0.8) ${startProgress + progress}%,
                                rgb(229, 231, 235) ${startProgress + progress}%,
                                rgb(229, 231, 235) 100%)`
                            : `linear-gradient(to right,
                                rgba(139, 92, 246, 0.8) 0%,
                                rgba(59, 130, 246, 0.8) ${progress * 100}%,
                                rgb(229, 231, 235) ${progress * 100}%,
                                rgb(229, 231, 235) 100%)`,
                    }}
                />
            </div>

            {/* Min/Max labels */}
            <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-gray-400">
                <span className="px-2 py-1 bg-gray-100 dark:bg-slate-800 rounded-lg">
                    {min}
                </span>
                <span className="px-2 py-1 bg-gray-100 dark:bg-slate-800 rounded-lg">
                    {max}
                </span>
            </div>
        </div>
    )
}
