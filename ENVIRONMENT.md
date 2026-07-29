# Environment variables

Copy `.env.example` to `.env.local`. Never commit `.env.local`.

| Variable | Required | Scope | Description |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Browser/server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Browser/server | Supabase publishable key |
| `NEXT_PUBLIC_APP_URL` | Yes in production | Browser/server | Canonical app URL |
| `GROQ_API_KEY` | One AI key | Server only | Primary AI provider |
| `GROQ_MODEL` | No | Server only | Defaults to `llama-3.3-70b-versatile` |
| `GEMINI_API_KEY` | One AI key | Server only | Fallback AI provider |
| `GEMINI_MODEL` | No | Server only | Defaults to `gemini-2.5-flash` |
| `PISTON_API_URL` | Yes for execution | Server only | Compatible Piston base URL; do not include `/execute` |
| `PISTON_AUTH_HEADER` | Required by provider | Server only | Exact authentication header name supplied by the executor |
| `PISTON_AUTH_VALUE` | Required by provider | Server only | Exact complete header value supplied by the executor |

At least one AI key is necessary for tutor and automatic learning-pack features.
When both keys are set, RecallCode always tries Groq first and calls Gemini only
after a Groq error or invalid response.

Only variables prefixed with `NEXT_PUBLIC_` are included in browser bundles.
Never add AI keys or a Supabase service-role key to a public variable.

Supabase Auth's built-in email service needs no SMTP or email API key in
`.env.local`. For the hackathon configuration, leave custom SMTP disabled in
the Supabase Dashboard. Confirmation and password-recovery messages are sent by
Supabase Auth itself.

The public EMKC Piston endpoint stopped accepting anonymous execution on
February 15, 2026. Configure its provider-issued authorization header or use
another compatible hosted Piston API. RecallCode intentionally keeps the whole
header value configurable because providers may use `Bearer …`, a raw token, or
an `X-API-Key` header.

For Vercel, configure values separately for Development, Preview, and
Production. Restart local development after changing `.env.local`.
