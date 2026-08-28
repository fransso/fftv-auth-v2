# FTV production account + TV OAuth deployment checklist

## 1. Canonical source

Repository: `fransso/fftv-auth-v2`

Production web URL:

`https://ftv-auth-frans1997-5983.vercel.app`

The repository contains only browser-safe public configuration. Never commit service-role keys, database passwords, Xtream credentials, reseller credentials, or signing secrets.

## 2. Production Supabase configuration

Project ref:

`shncvisxaoctxunwhcfd`

Browser Supabase URL:

`https://shncvisxaoctxunwhcfd.supabase.co`

Public TV OAuth client:

`5147e5bf-b019-4bb9-bfbd-5743cd32cb3d`

TV OAuth callback:

`https://shncvisxaoctxunwhcfd.supabase.co/functions/v1/fftv-device-auth/callback`

The callback belongs to the Supabase Edge Function, not to the web host.

## 3. Required browser routes

- `/` — account sign-in/sign-up/activation status
- `/oauth/consent/` — OAuth authorization consent opened after scanning the TV QR code
- `/reset/` — password recovery completion

All pages must allow browser connections to `https://shncvisxaoctxunwhcfd.supabase.co` in their Content Security Policy.

## 4. Supabase Authentication

Authentication → URL Configuration should use the production web host for account confirmation/password-reset redirects.

Authentication → OAuth Server:

- OAuth 2.1 Server: ON
- Authorization UI: production `/oauth/consent/` page (directly or through the existing `ftv-auth` redirect function)
- Dynamic Client Registration: OFF
- Public client ID: `5147e5bf-b019-4bb9-bfbd-5743cd32cb3d`
- Redirect URI: `https://shncvisxaoctxunwhcfd.supabase.co/functions/v1/fftv-device-auth/callback`
- Public client / token endpoint authentication: none

## 5. QR test order

1. Open FTV on the television and request QR sign-in.
2. Scan the newly generated QR code.
3. Browser should reach `/oauth/consent/?authorization_id=...`.
4. Sign in using the FTV account.
5. Choose **Continue to TV**.
6. Supabase redirects to `fftv-device-auth/callback`.
7. The TV polls `fftv-device-auth/poll`, receives the one-time authorization code, exchanges it with Supabase, registers the TV, and completes sign-in.

Always generate a fresh QR after a failed or expired attempt. OAuth state/PKCE requests are intentionally one-time and short-lived.

## 6. Storage/auth health guard

If password sign-in starts returning HTTP 500 or QR callback reports `error creating authorization`, check PostgreSQL write mode and database storage before changing passwords or OAuth code. Auth must be able to insert sessions and OAuth authorizations.

The provider-wide TMDb import is a maintenance operation and must not run continuously. `private.provider_content_identity` is the global identity cache; do not recreate a second full per-user TMDb cache.
