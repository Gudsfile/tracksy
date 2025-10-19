import { ThemeProvider } from '../hooks/ThemeContext'
import { TracksyWrapper } from './TracksyWrapper'
import { ThemeToggle } from './ThemeToggle/ThemeToggle'

export function App() {
    return (
        <ThemeProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 relative">
                {/* Theme toggle button */}
                <div className="absolute top-4 right-4">
                    <ThemeToggle />
                </div>

                {/* Main content area */}
                <div className="flex items-center justify-center min-h-screen">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-xl font-bold text-center mb-4 dark:text-white">
                            Tracksy
                        </h1>
                        <TracksyWrapper />
                    </div>
                </div>
            </div>
        </ThemeProvider>
    )
}
