# FTV GitHub Pages deployment checklist

## 1. GitHub repository

Recommended repository name: `fftv-auth-v2`.

Upload every file/folder in this ZIP to the repository root, preserving:

```
.nojekyll
404.html
config.js
index.html
assets/
oauth/consent/
reset/
```

## 2. Enable GitHub Pages

Repository → Settings → Pages → Build and deployment:

- Source: `Deploy from a branch`
- Branch: `main`
- Folder: `/(root)`

Expected live URL:

`https://fransso.github.io/fftv-auth-v2/`

Verify these three URLs load:

- `https://fransso.github.io/fftv-auth-v2/`
- `https://fransso.github.io/fftv-auth-v2/oauth/consent/`
- `https://fransso.github.io/fftv-auth-v2/reset/`

The consent page without an `authorization_id` should show an expired/new-QR message. That is correct.

## 3. Supabase URL Configuration

After GitHub Pages is live, in Supabase:

Authentication → URL Configuration

Set Site URL to:

`https://fransso.github.io/fftv-auth-v2`

Add Redirect URLs:

`https://fransso.github.io/fftv-auth-v2/`

`https://fransso.github.io/fftv-auth-v2/?confirmed=1`

`https://fransso.github.io/fftv-auth-v2/reset/`

## 4. Supabase OAuth Server

Authentication → OAuth Server

- OAuth 2.1 Server: ON
- Authorization Path: `/oauth/consent/`
- Dynamic Client Registration: OFF

Keep the existing public TV OAuth client:

Client ID:
`1cf3dba8-e78d-4e3f-bcd0-3ef3ed88a3ca`

Redirect URI:
`https://nasmymzpaubhzslrultb.supabase.co/functions/v1/fftv-device-auth/callback`

Client type: Public
Token endpoint authentication: `none`

Do not change the Android OAuth callback to GitHub. The callback belongs to the Supabase `fftv-device-auth` function.

## 5. Authentication provider

Authentication → Sign In / Providers → Email

- Email provider: ON
- Allow new users to sign up: ON
- Confirm email: ON

## 6. Test order

1. Open the GitHub Pages root URL.
2. Create a test account.
3. Confirm the email.
4. Sign in on the website.
5. The account page should show `Awaiting activation` until Xtream credentials are assigned.
6. Open the Android TV app and request a QR sign-in.
7. Scan the QR with a phone.
8. Supabase should redirect to the GitHub `/oauth/consent/` page with `authorization_id=...`.
9. Sign in and choose `Continue to TV`.
10. TV should receive the OAuth authorization and sign in.
11. Assign the user's real authorized Xtream account using the secure admin flow.
12. Refresh the website status; it should show viewing access active when entitlement is active.

## Security

Never commit:

- `service_role` / secret Supabase key
- Supabase database password
- Xtream username/password
- reseller-panel credentials
- signing keystore/private keys

The included `sb_publishable_...` key and OAuth Client ID are browser/public-client values and are expected to be public.
