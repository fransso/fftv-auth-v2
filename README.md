# FTV account + TV OAuth site

Browser account portal and OAuth 2.1 consent UI for the FTV Android TV application.

## Production configuration

- Production web URL: `https://ftv-auth-frans1997-5983.vercel.app`
- Supabase project: `shncvisxaoctxunwhcfd`
- Public OAuth client: `5147e5bf-b019-4bb9-bfbd-5743cd32cb3d`
- TV OAuth callback: `https://shncvisxaoctxunwhcfd.supabase.co/functions/v1/fftv-device-auth/callback`

Only a Supabase **publishable** key is present in this repository. This is intentional and appropriate for a browser application. Never place a Supabase secret/service-role key, Xtream username/password, reseller credentials, or database password in this repository.

## Routes

- `/` — account sign-in, sign-up, activation status, reset request
- `/oauth/consent/` — Supabase OAuth 2.1 authorization UI used by TV QR sign-in
- `/reset/` — password recovery completion page

The Android app uses one-time OAuth/PKCE QR requests through the `fftv-device-auth` Edge Function. The retired pairing-code functions must not be restored.
