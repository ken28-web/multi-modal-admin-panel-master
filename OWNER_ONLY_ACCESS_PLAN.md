# Owner-Only Access Plan (Hosted Admin Panel)

This plan makes the hosted admin panel usable by others but restricted to approved owners only.

## Current State

- Anyone with the URL can open the frontend.
- Admin API calls are protected by `ADMIN_API_KEY`.
- The hosted web build currently embeds `EXPO_PUBLIC_ADMIN_API_KEY`, so this is not the strongest security model.

## Recommended Path

## Phase 1: Immediate Hardening (Today)

1. Keep backend admin key enabled.
2. Restrict backend CORS to admin site origin only.
3. Rotate `ADMIN_API_KEY` when ownership changes.
4. Remove old owner from repo/server/hosting permissions.

## Phase 2: Access Gate in Front of Admin URL (No App Rewrite)

Use one of these:

1. Cloudflare Access
2. Azure AD Application Proxy
3. Google Identity-Aware Proxy

Set policy:

- Allow only new owner account(s).
- Deny all others.

Result:

- Non-approved users cannot even open admin page.

## Phase 3: Proper App Auth (Best)

1. Add backend login endpoint (`/admin/auth/login`).
2. Issue short-lived token or secure HTTP-only cookie.
3. Remove static shared admin key from frontend build.
4. Add logout and session expiry handling.

Result:

- Owner identity is tied to login account.
- Shared static secrets are no longer required in browser build.

## Ownership Transfer Checklist

1. Create new owner account in identity provider.
2. Remove old owner account access from identity provider.
3. Rotate backend `ADMIN_API_KEY`.
4. Redeploy backend and admin frontend.
5. Verify old owner gets 401 or access denied at gateway.

## Success Criteria

- New owner can open and save in admin panel.
- Old owner cannot open the panel or call admin endpoints.
- Audit logs can show who accessed admin.
