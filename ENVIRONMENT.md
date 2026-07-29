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
| `PISTON_API_URL` | No | Server only | Defaults to the public EMKC Piston API |

At least one AI key is necessary for tutor and automatic learning-pack features.
When both keys are set, RecallCode always tries Groq first and calls Gemini only
after a Groq error or invalid response.

Only variables prefixed with `NEXT_PUBLIC_` are included in browser bundles.
Never add AI keys or a Supabase service-role key to a public variable.

For Vercel, configure values separately for Development, Preview, and
Production. Restart local development after changing `.env.local`.
