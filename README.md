# FTV GitHub Pages account + TV OAuth site

Static GitHub Pages frontend for the FTV Android TV application.

## Production configuration

- Supabase project: `nasmymzpaubhzslrultb`
- Public OAuth client: `1cf3dba8-e78d-4e3f-bcd0-3ef3ed88a3ca`
- Expected GitHub Pages base URL: `https://fransso.github.io/fftv-auth-v2`
- TV OAuth callback stays on Supabase: `https://nasmymzpaubhzslrultb.supabase.co/functions/v1/fftv-device-auth/callback`

Only a Supabase **publishable** key is present in this repository. This is intentional and safe for a browser application. Never place a Supabase secret/service-role key, Xtream username/password, reseller credentials, or database password in this repository.

## Routes

- `/` — account sign-in, sign-up, activation status, reset-request
- `/oauth/consent/` — Supabase OAuth 2.1 authorization UI used by TV QR sign-in
- `/reset/` — password recovery completion page

See `DEPLOYMENT_CHECKLIST.md` for the exact GitHub and Supabase setup.
