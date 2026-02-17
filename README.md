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

## Configure API URL (Local / Deployed)

Set these environment variables before running the admin panel:

- `EXPO_PUBLIC_BACKEND_TARGET=local` or `deployed`
- `EXPO_PUBLIC_ADMIN_API_URL_LOCAL` (example: `http://127.0.0.1:8000`)
- `EXPO_PUBLIC_ADMIN_API_URL_DEPLOYED` (your production backend URL)

Behavior:

- If target is `local`, admin uses `EXPO_PUBLIC_ADMIN_API_URL_LOCAL`.
- If target is `deployed`, admin uses `EXPO_PUBLIC_ADMIN_API_URL_DEPLOYED`.
- Backward-compatible fallback still supports `EXPO_PUBLIC_ADMIN_API_URL` / `EXPO_PUBLIC_API_BASE_URL`.

Example (PowerShell):

```powershell
# Use deployed backend
$env:EXPO_PUBLIC_BACKEND_TARGET = "deployed"
$env:EXPO_PUBLIC_ADMIN_API_URL_DEPLOYED = "https://your-deployed-backend-url"
npm start
```

```powershell
# Switch back to local backend
$env:EXPO_PUBLIC_BACKEND_TARGET = "local"
$env:EXPO_PUBLIC_ADMIN_API_URL_LOCAL = "http://127.0.0.1:8000"
npm start
```

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
