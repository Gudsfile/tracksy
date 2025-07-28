import { useState, useEffect } from 'react'

interface SpotifyAuthConfig {
    clientId: string
    redirectUri: string
    scopes: string[]
}

export const useSpotifyAuth = (config: SpotifyAuthConfig) => {
    const [accessToken, setAccessToken] = useState<string | null>(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    // The PKCE authorization flow starts with the creation of a code verifier.
    // A code verifier is a high-entropy cryptographic random string with a length between 43 and 128 characters.
    const generateCodeVerifier = () => {
        const array = new Uint8Array(64)
        window.crypto.getRandomValues(array)
        return btoa(String.fromCharCode(...array))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '')
    }

    // Generate a code challenge for PKCE.
    // See https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow
    const generateCodeChallenge = async (codeVerifier: string) => {
        const encoder = new TextEncoder()
        const data = encoder.encode(codeVerifier)
        const digest = await window.crypto.subtle.digest('SHA-256', data)
        return btoa(String.fromCharCode(...new Uint8Array(digest)))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '')
    }

    const login = async () => {
        setIsLoading(true)
        try {
            const codeVerifier = generateCodeVerifier()
            const codeChallenge = await generateCodeChallenge(codeVerifier)

            // Store the code verifier in localStorage for later use.
            // This is necessary for the PKCE flow.
            localStorage.setItem('spotify_code_verifier', codeVerifier)

            const params = new URLSearchParams({
                response_type: 'code',
                client_id: config.clientId,
                scope: config.scopes.join(' '),
                redirect_uri: config.redirectUri,
                code_challenge_method: 'S256',
                code_challenge: codeChallenge,
            })

            window.location.href = `https://accounts.spotify.com/authorize?${params}`
        } catch (error) {
            console.error('Error during authentication:', error)
            setIsLoading(false)
        }
    }

    const exchangeCodeForToken = async (code: string) => {
        const codeVerifier = localStorage.getItem('spotify_code_verifier')
        if (!codeVerifier) throw new Error('Code verifier not found')

        setIsLoading(true)
        try {
            const response = await fetch(
                'https://accounts.spotify.com/api/token',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        grant_type: 'authorization_code',
                        code,
                        redirect_uri: config.redirectUri,
                        client_id: config.clientId,
                        code_verifier: codeVerifier,
                    }),
                }
            )

            const data = await response.json()
            if (data.access_token) {
                setAccessToken(data.access_token)
                setIsAuthenticated(true)
                localStorage.setItem('spotify_access_token', data.access_token)
                localStorage.removeItem('spotify_code_verifier')

                // Also store the refresh token if available.
                if (data.refresh_token) {
                    localStorage.setItem(
                        'spotify_refresh_token',
                        data.refresh_token
                    )
                }
            } else {
                throw new Error('Token exchange failed.')
            }
        } catch (error) {
            console.error('Error during token exchange:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const logout = () => {
        setAccessToken(null)
        setIsAuthenticated(false)
        localStorage.removeItem('spotify_access_token')
        localStorage.removeItem('spotify_refresh_token')
        localStorage.removeItem('spotify_code_verifier')
    }

    // Check the URL for the authorization code.
    // This is called when the user is redirected back to the app after login.
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')

        if (code) {
            exchangeCodeForToken(code)
            // Clean up the URL
            window.history.replaceState(
                {},
                document.title,
                window.location.pathname
            )
        }
    }, [])

    useEffect(() => {
        const storedToken = localStorage.getItem('spotify_access_token')
        if (storedToken) {
            setAccessToken(storedToken)
            setIsAuthenticated(true)
        }
    }, [])

    return {
        isAuthenticated,
        accessToken,
        isLoading,
        login,
        logout,
    }
}
