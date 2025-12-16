import { ThemeProvider } from '../hooks/ThemeContext'
import { TracksyWrapper } from './TracksyWrapper'
import { ThemeToggle } from './ThemeToggle/ThemeToggle'

export function App() {
    return (
        <ThemeProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-slate-950 relative transition-colors duration-300">
                {/* Theme toggle button */}
                <div className="absolute top-6 right-6 z-50">
                    <ThemeToggle />
                </div>

                {/* Main content area */}
                <div className="flex items-center justify-center min-h-screen px-4 relative z-10">
                    <div className="max-w-4xl w-full mx-auto py-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 animate-fade-in">
                            <a
                                href="/"
                                className="bg-gradient-brand bg-clip-text text-transparent hover:opacity-80 transition-opacity drop-shadow-sm"
                            >
                                Tracksy
                            </a>
                        </h1>
                        <TracksyWrapper />
                    </div>
                </div>
            </div>
        </ThemeProvider>
    )
}
