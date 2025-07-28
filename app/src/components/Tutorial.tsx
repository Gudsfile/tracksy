import React, { useState, useEffect } from 'react'

interface TutorialStep {
    id: number
    title: string
    content: string
    target?: string // Sélecteur CSS de l'élément à mettre en évidence
    position: 'top' | 'bottom' | 'left' | 'right' | 'center'
    arrow?: boolean
}

const tutorialSteps: TutorialStep[] = [
    {
        id: 1,
        title: 'Bienvenue sur Tracksy !',
        content:
            "Tracksy vous permet d'analyser vos données d'écoute Spotify. Ce tutoriel vous guidera à travers les fonctionnalités principales.",
        position: 'center',
        arrow: false,
    },
    {
        id: 2,
        title: 'Zone de téléchargement',
        content:
            'Glissez-déposez vos fichiers de données Spotify ici ou cliquez pour les sélectionner. Vous pouvez télécharger vos données depuis votre compte Spotify.',
        target: '[data-tutorial="dropzone"]',
        position: 'top',
        arrow: true,
    },
    {
        id: 3,
        title: 'Connexion Spotify',
        content:
            'Connectez-vous à votre compte Spotify pour obtenir des informations supplémentaires sur vos pistes et artistes préférés.',
        target: '[data-tutorial="spotify-auth"]',
        position: 'bottom',
        arrow: true,
    },
    {
        id: 4,
        title: 'Analyse des données',
        content:
            "Une fois vos fichiers téléchargés, Tracksy analysera automatiquement vos habitudes d'écoute et générera des graphiques interactifs.",
        target: '[data-tutorial="dropzone"]',
        position: 'bottom',
        arrow: true,
    },
    {
        id: 5,
        title: "C'est parti !",
        content:
            "Vous êtes maintenant prêt à découvrir vos statistiques d'écoute Spotify. Commencez par télécharger vos données !",
        position: 'center',
        arrow: false,
    },
]

export const Tutorial: React.FC = () => {
    const [isActive, setIsActive] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)
    const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)

    // Vérifier si c'est la première visite
    useEffect(() => {
        const hasSeenTutorial = localStorage.getItem('tracksy-tutorial-seen')
        if (!hasSeenTutorial) {
            setIsActive(true)
        }
    }, [])

    // Mettre à jour l'élément cible quand l'étape change
    useEffect(() => {
        if (isActive && tutorialSteps[currentStep]?.target) {
            const element = document.querySelector(
                tutorialSteps[currentStep].target!
            ) as HTMLElement
            setTargetElement(element)
        } else {
            setTargetElement(null)
        }
    }, [currentStep, isActive])

    const nextStep = () => {
        if (currentStep < tutorialSteps.length - 1) {
            setCurrentStep(currentStep + 1)
        } else {
            closeTutorial()
        }
    }

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
        }
    }

    const closeTutorial = () => {
        setIsActive(false)
        setCurrentStep(0)
        setTargetElement(null)
        localStorage.setItem('tracksy-tutorial-seen', 'true')
    }

    const startTutorial = () => {
        setIsActive(true)
        setCurrentStep(0)
    }

    const getTooltipPosition = () => {
        if (!targetElement) return {}

        const rect = targetElement.getBoundingClientRect()
        const step = tutorialSteps[currentStep]

        switch (step.position) {
            case 'top':
                return {
                    top: rect.top - 20,
                    left: rect.left + rect.width / 2,
                    transform: 'translate(-50%, -100%)',
                }
            case 'bottom':
                return {
                    top: rect.bottom + 20,
                    left: rect.left + rect.width / 2,
                    transform: 'translate(-50%, 0)',
                }
            case 'left':
                return {
                    top: rect.top + rect.height / 2,
                    left: rect.left - 20,
                    transform: 'translate(-100%, -50%)',
                }
            case 'right':
                return {
                    top: rect.top + rect.height / 2,
                    left: rect.right + 20,
                    transform: 'translate(0, -50%)',
                }
            default:
                return {
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                }
        }
    }

    const getArrowClasses = () => {
        const step = tutorialSteps[currentStep]
        const baseClasses = 'absolute w-4 h-4 bg-blue-600 transform rotate-45'

        switch (step.position) {
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

    if (!isActive) {
        return (
            <button
                onClick={startTutorial}
                className="fixed bottom-4 left-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors duration-200 z-40"
                title="Revoir le tutoriel"
            >
                <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
            </button>
        )
    }

    const currentStepData = tutorialSteps[currentStep]

    return (
        <>
            {/* Overlay sombre */}
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50" />

            {/* Highlight de l'élément cible */}
            {targetElement && (
                <div
                    className="fixed bg-white bg-opacity-20 border-2 border-blue-400 rounded-lg pointer-events-none z-50 transition-all duration-300"
                    style={{
                        top: targetElement.offsetTop - 8,
                        left: targetElement.offsetLeft - 8,
                        width: targetElement.offsetWidth + 16,
                        height: targetElement.offsetHeight + 16,
                    }}
                />
            )}

            {/* Tooltip du tutoriel */}
            <div
                className="fixed z-50 max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-6"
                style={
                    currentStepData.position === 'center'
                        ? {
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                          }
                        : getTooltipPosition()
                }
            >
                {/* Flèche */}
                {currentStepData.arrow &&
                    currentStepData.position !== 'center' && (
                        <div className={getArrowClasses()} />
                    )}

                {/* Contenu */}
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {currentStepData.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                        {currentStepData.content}
                    </p>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                    <div className="flex space-x-1">
                        {tutorialSteps.map((_, index) => (
                            <div
                                key={index}
                                className={`w-2 h-2 rounded-full ${
                                    index === currentStep
                                        ? 'bg-blue-600'
                                        : 'bg-gray-300'
                                }`}
                            />
                        ))}
                    </div>

                    <div className="flex space-x-2">
                        {currentStep > 0 && (
                            <button
                                onClick={prevStep}
                                className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                            >
                                Précédent
                            </button>
                        )}
                        <button
                            onClick={nextStep}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors duration-200"
                        >
                            {currentStep === tutorialSteps.length - 1
                                ? 'Terminer'
                                : 'Suivant'}
                        </button>
                    </div>
                </div>

                {/* Bouton fermer */}
                <button
                    onClick={closeTutorial}
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            </div>
        </>
    )
}
