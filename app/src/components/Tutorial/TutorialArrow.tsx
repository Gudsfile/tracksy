import React from 'react'
import type { TutorialStep } from './types'

interface TutorialArrowProps {
    position: TutorialStep['position']
}

export const TutorialArrow: React.FC<TutorialArrowProps> = ({ position }) => {
    const getArrowClasses = () => {
        const baseClasses = 'absolute w-4 h-4 bg-blue-600 transform rotate-45'

        switch (position) {
            case 'top':
                return `${baseClasses} -bottom-2 left-1/2 -translate-x-1/2`
            case 'bottom':
                return `${baseClasses} -top-2 left-1/2 -translate-x-1/2`
            case 'left':
                return `${baseClasses} -right-2 top-1/2 -translate-y-1/2`
            case 'right':
                return `${baseClasses} -left-2 top-1/2 -translate-y-1/2`
            default:
                return ''
        }
    }

    if (position === 'center') return null

    return <div className={getArrowClasses()} />
}
