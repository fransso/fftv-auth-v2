# Security notes

This GitHub Pages site is a public OAuth/account frontend. It intentionally contains only browser-safe public identifiers.

Sensitive operations remain on Supabase:

- Xtream credential assignment and validation
- Supabase Vault access
- content synchronization
- playback authorization/tickets
- device registration
- subscription/admin operations

Do not move any of those operations into GitHub Pages JavaScript.
