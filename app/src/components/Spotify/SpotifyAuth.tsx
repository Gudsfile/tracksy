import { useSpotifyAuth } from '../../hooks/useSpotifyAuth'

const SPOTIFY_CONFIG = {
    clientId: import.meta.env.PUBLIC_SPOTIFY_CLIENT_ID || '',
    redirectUri:
        typeof window !== 'undefined' ? `${window.location.origin}/` : '',
    scopes: [],
}

export const SpotifyAuth = () => {
    const { isAuthenticated, isLoading, login, logout } =
        useSpotifyAuth(SPOTIFY_CONFIG)

    if (isLoading) {
        return (
            <div className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium py-2 px-4 rounded-lg">
                Connecting...
            </div>
        )
    }

    if (isAuthenticated) {
        return (
            <div className="flex items-center gap-2">
                <div className="text-green-600 dark:text-green-400 font-medium text-sm">
                    ✅ Connected to Spotify
                </div>
                <button
                    onClick={logout}
                    className="bg-red-500 hover:bg-red-600 text-white font-medium py-1 px-3 rounded text-sm transition-colors duration-200"
                >
                    Logout
                </button>
            </div>
        )
    }

    return (
        <button
            onClick={login}
            className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
        >
            Login to Spotify
        </button>
    )
}
