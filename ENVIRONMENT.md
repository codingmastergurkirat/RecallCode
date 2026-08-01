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
| `JDOODLE_CLIENT_ID` | Yes for execution | Server only | JDoodle Compiler API client ID |
| `JDOODLE_CLIENT_SECRET` | Yes for execution | Server only | JDoodle Compiler API secret |
| `JDOODLE_REQUEST_TIMEOUT_MS` | No | Server only | RecallCode request timeout; defaults to `30000` |

At least one AI key is necessary for tutor and automatic learning-pack features.
When both keys are set, RecallCode always tries Groq first and calls Gemini only
after a Groq error or invalid response.

Only variables prefixed with `NEXT_PUBLIC_` are included in browser bundles.
Never add AI keys, JDoodle credentials, or a Supabase service-role key to a public
variable.

Supabase Auth's built-in email service needs no SMTP or email API key in
`.env.local`. For the hackathon configuration, leave custom SMTP disabled in
the Supabase Dashboard. Confirmation and password-recovery messages are sent by
Supabase Auth itself.

## JDoodle values

Use the credentials from the JDoodle API dashboard in local development:

```env
JDOODLE_CLIENT_ID=your-client-id
JDOODLE_CLIENT_SECRET=your-client-secret
JDOODLE_REQUEST_TIMEOUT_MS=30000
```

Production uses the same variable names as encrypted server-side deployment
secrets. Follow [JDOODLE_SETUP.md](JDOODLE_SETUP.md) for account creation,
credentials, language versions, direct smoke tests, Vercel configuration,
credits, security, and troubleshooting.

For Vercel, configure values separately for Development, Preview, and
Production. Restart local development or redeploy after changing environment
variables.
