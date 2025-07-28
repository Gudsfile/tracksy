export interface TutorialStep {
    id: number
    title: string
    content: string
    target?: string
    position: 'top' | 'bottom' | 'left' | 'right' | 'center'
    arrow?: boolean
}

export const TUTORIAL_STORAGE_KEY = 'tracksy-tutorial-seen'

export const getElementPosition = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect()
    return {
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
        bottom: rect.bottom + window.scrollY,
        right: rect.right + window.scrollX,
    }
}

export const calculateTooltipPosition = (
    targetElement: HTMLElement,
    position: TutorialStep['position']
) => {
    const rect = targetElement.getBoundingClientRect()
    const scrollY = window.scrollY
    const scrollX = window.scrollX

    switch (position) {
        case 'top':
            return {
                top: rect.top + scrollY - 20,
                left: rect.left + scrollX + rect.width / 2,
                transform: 'translate(-50%, -100%)',
            }
        case 'bottom':
            return {
                top: rect.bottom + scrollY + 20,
                left: rect.left + scrollX + rect.width / 2,
                transform: 'translate(-50%, 0)',
            }
        case 'left':
            return {
                top: rect.top + scrollY + rect.height / 2,
                left: rect.left + scrollX - 20,
                transform: 'translate(-100%, -50%)',
            }
        case 'right':
            return {
                top: rect.top + scrollY + rect.height / 2,
                left: rect.right + scrollX + 20,
                transform: 'translate(0, -50%)',
            }
        default:
            return {
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                position: 'fixed' as const,
            }
    }
}
