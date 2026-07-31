# Deployment

RecallCode targets Vercel.

## Before deployment

1. Complete [SUPABASE_SETUP.md](SUPABASE_SETUP.md).
2. Push the repository to GitHub, GitLab, or Bitbucket.
3. Create a Vercel project from the repository.
4. Keep Framework Preset set to Next.js.
5. Deploy Piston on a separate Docker-capable Linux host by following
   [PISTON_SETUP.md](PISTON_SETUP.md).
6. Add every variable from [ENVIRONMENT.md](ENVIRONMENT.md).
7. Deploy.

No custom build command is required. Vercel uses `npm run build`.

## Supabase redirects

After Vercel provides a domain, add:

```text
https://your-domain/auth/callback
https://your-domain/auth/confirm
https://your-domain/reset-password
```

Set Supabase Site URL and `NEXT_PUBLIC_APP_URL` to the production origin. Add
preview origins explicitly if authentication must work on preview deployments.

## Release verification

- Create and verify an email/password account.
- Sign in with Google through Supabase.
- Refresh a protected route and confirm the session persists.
- Request and complete a password reset.
- Confirm a profile row was created.
- Filter the 150-problem library.
- Run code in every enabled language.
- Submit code and confirm submission, feedback, flashcards, and recall prompts.
- Complete a review and confirm the next date.
- Check light/dark mode at mobile, tablet, and desktop widths.

## Operational notes

Vercel cannot connect to `127.0.0.1` on your computer. Production must use the
public HTTPS hostname of your protected self-hosted Piston reverse proxy. Do not
publish Piston's port `2000` directly. Set provider spend/rate limits for Groq
and Gemini. Monitor the Piston host, Vercel function logs, and Supabase
Auth/Postgres logs.
