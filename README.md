<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/77c5314f-3148-404b-84b5-09ce0415de49

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Optionally set `GOOGLE_WEATHER_API_KEY` (or `GOOGLE_MAPS_API_KEY`) in `.env` or the deployment environment. The server uses Google Weather current conditions and Google hourly/daily forecasts when this key is present, and Open-Meteo otherwise.
3. Run the app:
   `npm run dev`

## Deploy to Render

This repository includes a `render.yaml` Blueprint configuration.

1. Create a new **Web Service** in Render and connect this GitHub repository.
2. Select the `main` branch. Render will detect `render.yaml` automatically.
3. Deploy with the configured build command: `npm ci && npm run build`.
4. The production service starts with `npm start` and uses Render's injected `PORT`.

The `/api/health` endpoint is configured as the Render health check. No key is required for Open-Meteo, USGS, geocoding, or RainViewer verification. Satellite/radar imagery is verification context only and is never used as a thermometer. Configure `GOOGLE_WEATHER_API_KEY` to enable Google current-condition data.
