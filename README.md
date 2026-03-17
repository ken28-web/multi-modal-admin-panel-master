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

## Admin Login (Phase 3)

This panel now uses backend login with expiring session tokens.

Configure these backend variables:

- `ADMIN_AUTH_ENABLED=true`
- `ADMIN_USERNAME=<admin username>`
- `ADMIN_PASSWORD=<admin password>`
- `ADMIN_SESSION_SECRET=<long random secret>`
- `ADMIN_SESSION_TTL_MINUTES=480` (or your preferred duration)

The frontend no longer requires exposing a long-lived admin key for normal use.

## Run (web only)

```bash
npm install
npm start
```

`npm start` launches Expo in web mode (`expo start --web`).

## Open Without VS Code (Hosted Website)

You can deploy this admin panel as a normal website so owners can open it directly from a URL.

### One-time setup

1. Push this project to GitHub.
2. In GitHub, open Settings > Pages and set Source to GitHub Actions.
3. In GitHub, open Settings > Secrets and variables > Actions, then add:

- `EXPO_PUBLIC_ADMIN_API_URL_DEPLOYED` = your deployed backend URL

4. Push to `main` or run the `Deploy Admin Panel Web` workflow manually.

After deployment, GitHub Pages gives a URL. Open that URL in any browser, no VS Code needed.

### Files used for deployment

- Workflow: `.github/workflows/deploy-admin-web.yml`
- Build command: `npm run build:web`
- Output folder: `dist`

## Local production preview (optional)

If you want to test the deploy build locally:

```bash
npm run build:web
npm run preview:web
```

Then open `http://localhost:4173`.
