import { useRef, useState, useEffect } from 'react'

interface RangeSliderProps {
    value: [number, number]
    onChange: (value: [number, number]) => void
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
    const sliderRef = useRef<HTMLDivElement>(null)
    const [dragging, setDragging] = useState<null | 0 | 1>(null)
    const [localValue, setLocalValue] = useState<[number, number]>(value)

    useEffect(() => {
        setLocalValue(value)
    }, [value])

    const getPercent = (val: number) => ((val - min) / (max - min)) * 100

    const updateValue = (posX: number) => {
        if (!sliderRef.current) return

        const { left, width } = sliderRef.current.getBoundingClientRect()
        let pct = ((posX - left) / width) * 100
        pct = Math.max(0, Math.min(100, pct))

        const val = Math.round(((pct / 100) * (max - min)) / step) * step + min

        if (dragging === 0) {
            const newMin = Math.min(val, localValue[1] - step)
            setLocalValue([newMin, localValue[1]])
            onChange([newMin, localValue[1]])
        } else if (dragging === 1) {
            const newMax = Math.max(val, localValue[0] + step)
            setLocalValue([localValue[0], newMax])
            onChange([localValue[0], newMax])
        }
    }

    const handleMouseMove = (e: MouseEvent) => {
        if (dragging !== null) {
            updateValue(e.clientX)
        }
    }

    const handleTouchMove = (e: TouchEvent) => {
        if (dragging !== null) {
            updateValue(e.touches[0].clientX)
        }
    }

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', () => setDragging(null))

        window.addEventListener('touchmove', handleTouchMove)
        window.addEventListener('touchend', () => setDragging(null))

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', () => setDragging(null))

            window.removeEventListener('touchmove', handleTouchMove)
            window.removeEventListener('touchend', () => setDragging(null))
        }
    })

    return (
        <div className="w-full relative space-y-4 my-8 px-2">
            <div
                className="relative backdrop-blur-md px-4 py-4 rounded-2xl transition-all duration-300"
                ref={sliderRef}
            >
                {/* Barre active */}
                <div
                    className="w-full h-2 rounded-full"
                    style={{
                        left: `0`,
                        right: `0`,
                        background: `linear-gradient(to right,
                      rgb(229, 231, 235) 0%,
                      rgb(229, 231, 235) ${getPercent(localValue[0])}%,
                      rgba(139, 92, 246, 0.8) ${getPercent(localValue[0])}%,
                      rgba(59, 130, 246, 0.8) ${getPercent(localValue[1])}%,
                      rgb(229, 231, 235) ${getPercent(localValue[1])}%,
                      rgb(229, 231, 235) 100%)`,
                    }}
                />

                {/* Thumb min */}
                <div
                    onMouseDown={() => setDragging(0)}
                    onTouchStart={() => setDragging(0)}
                    className="absolute w-5 h-5 rounded-full -translate-y-1/2 cursor-pointer shadow"
                    style={{
                        left: `${getPercent(localValue[0])}%`,
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: `linear-gradient(to right,
                              rgb(139, 92, 246) 0%,
                              rgb(59, 130, 246) 100%`,
                    }}
                />

                {/* Thumb max */}
                <div
                    onMouseDown={() => setDragging(1)}
                    onTouchStart={() => setDragging(1)}
                    className="absolute w-5 h-5 rounded-full -translate-y-1/2 cursor-pointer shadow"
                    style={{
                        left: `${getPercent(localValue[1])}%`,
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: `linear-gradient(to right,rgb(139, 92, 246) 0%,rgb(59, 130, 246) 100%`,
                    }}
                />
            </div>

            {/* Min/Max labels */}
            <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-gray-400">
                <span className="px-2 py-1 bg-gray-100 dark:bg-slate-800 rounded-lg">
                    {localValue[0]}
                </span>
                <span className="px-2 py-1 bg-gray-100 dark:bg-slate-800 rounded-lg">
                    {localValue[1]}
                </span>
            </div>
        </div>
    )
}
