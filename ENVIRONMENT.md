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
| `PISTON_API_URL` | Yes for execution | Server only | Self-hosted Piston API base URL; do not include `/execute` |
| `PISTON_RUN_TIMEOUT_MS` | No | Server only | Requested run wall/CPU limit; defaults to stock Piston's `3000` |
| `PISTON_AUTH_HEADER` | Production only | Server only | Secret header checked by the HTTPS reverse proxy |
| `PISTON_AUTH_VALUE` | Production only | Server only | Complete secret header value |

At least one AI key is necessary for tutor and automatic learning-pack features.
When both keys are set, RecallCode always tries Groq first and calls Gemini only
after a Groq error or invalid response.

Only variables prefixed with `NEXT_PUBLIC_` are included in browser bundles.
Never add AI keys, Piston secrets, or a Supabase service-role key to a public
variable.

Supabase Auth's built-in email service needs no SMTP or email API key in
`.env.local`. For the hackathon configuration, leave custom SMTP disabled in
the Supabase Dashboard. Confirmation and password-recovery messages are sent by
Supabase Auth itself.

## Piston values

Local development uses the Docker container on the developer machine:

```env
PISTON_API_URL=http://127.0.0.1:2000/api/v2
PISTON_RUN_TIMEOUT_MS=3000
PISTON_AUTH_HEADER=
PISTON_AUTH_VALUE=
```

Production uses the HTTPS reverse proxy in front of the self-hosted Piston
container:

```env
PISTON_API_URL=https://piston.example.com/api/v2
PISTON_RUN_TIMEOUT_MS=3000
PISTON_AUTH_HEADER=X-RecallCode-Key
PISTON_AUTH_VALUE=replace-with-a-long-random-secret
```

Never expose Piston port `2000` publicly. Follow
[PISTON_SETUP.md](PISTON_SETUP.md) for Docker startup, runtime installation,
HTTPS, the secret-header proxy, Vercel, smoke tests, updates, and
troubleshooting.

For Vercel, configure values separately for Development, Preview, and
Production. Restart local development or redeploy after changing environment
variables.
