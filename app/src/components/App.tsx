import { lazy, Suspense } from 'react'
import { ThemeProvider } from '../hooks/ThemeContext'
import { TracksyWrapper } from './TracksyWrapper'
import { ThemeToggle } from './ThemeToggle/ThemeToggle'

/**
 * Lets the dev toolbar run evals against the same engine the chat uses.
 *
 * Mounted inside this tree rather than as its own island so it provably shares
 * the engine singleton — a second island would work too, but "same module graph"
 * would then be an assumption rather than a fact. `import.meta.env.DEV` becomes
 * `false` in a build, so Rollup drops both the branch and the lazy import, and
 * `moon run app:assert-no-dev-code` fails if that ever stops holding.
 */
const EvalBridge = import.meta.env.DEV
    ? lazy(() =>
          import('./dev/EvalBridge').then((module) => ({
              default: module.EvalBridge,
          }))
      )
    : null

export function App() {
    return (
        <ThemeProvider>
            {EvalBridge && (
                <Suspense fallback={null}>
                    <EvalBridge />
                </Suspense>
            )}
            <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-950 relative transition-colors duration-300">
                {/* Theme toggle button */}
                <div className="absolute top-6 right-6 z-50">
                    <ThemeToggle />
                </div>

                {/* Main content area */}
                <div className="flex flex-1 items-center justify-center px-4 relative z-10">
                    <div className="max-w-4xl w-full mx-auto py-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 animate-fade-in">
                            <a
                                href={`${import.meta.env.BASE_URL}`}
                                className="bg-gradient-brand bg-clip-text text-transparent hover:opacity-80 transition-opacity drop-shadow-sm"
                            >
                                Tracksy
                            </a>
                        </h1>
                        <TracksyWrapper />
                    </div>
                </div>

                <footer className="relative z-10 pb-6 text-center text-sm text-gray-400 dark:text-slate-500">
                    <a
                        href="https://github.com/Gudsfile/tracksy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                    >
                        Music stats made with ❤️ & 🔐 · View on GitHub
                    </a>
                </footer>
            </div>
        </ThemeProvider>
    )
}
