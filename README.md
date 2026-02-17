# Multi-Modal Admin Panel (Web)

This admin panel is configured for **web-only** usage.

## What it manages

- Public transport fare rates (`mode`, `distance_km`, `regular`, `discounted`)
- Private transport fare settings (`base_fare`, `per_km_rate`, `fuel_price`)

## Requirements

- Backend service running (`multi-modal-fare-route-estimator-backend`)
- Backend includes admin endpoints:
  - `GET /admin/fare-rates`
  - `PUT /admin/fare-rates/public`
  - `PUT /admin/fare-rates/private`

## Configure API URL

Set one of these environment variables before running the admin panel:

- `EXPO_PUBLIC_ADMIN_API_URL`
- `EXPO_PUBLIC_API_BASE_URL`

Default fallback is `http://127.0.0.1:8000`.

## Configure API Key (if backend requires auth)

Set these environment variables before running the admin panel:

- `EXPO_PUBLIC_ADMIN_API_KEY` (your backend API key value)
- `EXPO_PUBLIC_ADMIN_API_KEY_HEADER` (optional, default: `X-API-Key`)

Example (PowerShell):

```powershell
$env:EXPO_PUBLIC_ADMIN_API_KEY = "your_api_key_here"
$env:EXPO_PUBLIC_ADMIN_API_KEY_HEADER = "X-API-Key"
npm start
```

## Run (web only)

```bash
npm install
npm start
```

`npm start` launches Expo in web mode (`expo start --web`).
