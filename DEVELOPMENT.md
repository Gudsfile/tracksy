# Development Guide

Welcome to the Tracksy development guide! This document will help you set up your development environment.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**
- **pnpm**
- **Git**
- A **Spotify account** (for Spotify API integration)

For Python development (synthetic datasets):

- **Python** (v3.x)
- **uv** - Fast Python package installer and resolver

## Setting Up Your Development Environment

1. **Clone the repository**

   ```bash
   git clone https://github.com/Gudsfile/tracksy.git
   cd tracksy
   ```

2. **Install dependencies**

   For the app:

   ```bash
   cd app
   pnpm install
   ```

   For synthetic datasets:

   ```bash
   cd synthetic-datasets
   uv sync
   ```

3. **Configure environment variables**

   Copy the example environment file and configure it:

   ```bash
   cd app
   cp .env.example .env
   ```

   Now edit `.env` and configure the required variables (see [Spotify API Configuration](#spotify-api-configuration) below).

## Spotify API Configuration

Tracksy uses the Spotify Web API for features.

End users of the production Tracksy app (at [tracksy-app.web.app](https://tracksy-app.web.app)) do **not** need to create their own Spotify app. The production deployment uses a centralized Spotify Client ID.

If you're **contributing to Tracksy** and want to test Spotify integration features locally, you'll need to create your own Spotify Developer app.

### Retrieving Your Spotify Client ID for Local Development

Follow these steps to create a Spotify app and retrieve your Client ID for local development:

1. **Log in to the Spotify Developer Dashboard**

   Go to [https://developer.spotify.com/dashboard](https://developer.spotify.com/dashboard) and log in with your Spotify account.

2. **Create a new app**

   - Click the **"Create an App"** button
   - Fill in the required information:
     - **App Name**: Choose a name for your development app (e.g., "Tracksy Local Dev")
     - **App Description**: Brief description (e.g., "Local development instance of Tracksy")
   - Click **"CREATE"**
   - You'll be redirected to your app overview page

3. **Configure Redirect URIs**

   - On your app overview page, you'll see your **Client ID** displayed
   - Click the **"Edit Settings"** button
   - In the settings dialog:
     - **Website**: Optional, you can add the GitHub repository URL if desired
     - **Redirect URIs**: Add `http://localhost:4321/` (this is where Spotify will redirect after authentication)
   - Click **"SAVE"**

4. **Copy your Client ID**

   - Back on the app overview page, copy your **Client ID**

5. **Configure your environment**

   Open the `.env` file in the `app/` directory and update the `PUBLIC_SPOTIFY_CLIENT_ID` variable:

   ```bash
   PUBLIC_SPOTIFY_CLIENT_ID=your_actual_client_id_here
   ```

   Replace `your_actual_client_id_here` with the Client ID you copied from the Spotify Dashboard.

### Important Notes

- **Client Secret**: You do NOT need the Client Secret. Tracksy uses the PKCE (Proof Key for Code Exchange) flow, which is designed for public clients and only requires the Client ID.
- **Redirect URI**: Make sure to use `http://localhost:4321/` for local development.
- **Scopes**: Currently, Tracksy doesn't request any specific Spotify API scopes, but this may change as new features are added.

## Additional Resources

- [Spotify Web API Documentation](https://developer.spotify.com/documentation/web-api)
- [Spotify App Settings Guide](https://developer.spotify.com/documentation/web-api/concepts/apps)
- [Astro Documentation](https://docs.astro.build)
- [DuckDB Documentation](https://duckdb.org/docs/)
- [Contributing Guide](./CONTRIBUTING.md)
