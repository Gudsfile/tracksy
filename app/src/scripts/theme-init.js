// Prevent flash of unstyled content (FOUC) by applying theme before page render
// Based on Tailwind's recommended dark mode pattern
;(function () {
    try {
        const theme = localStorage.getItem('tracksy-theme') || 'system'
        const isSystemDark =
            theme === 'system' &&
            window.matchMedia('(prefers-color-scheme: dark)').matches
        const shouldBeDark = theme === 'dark' || isSystemDark

        document.documentElement.classList.toggle('dark', shouldBeDark)
    } catch (e) {
        // Silently fail if localStorage is unavailable
    }
})()
