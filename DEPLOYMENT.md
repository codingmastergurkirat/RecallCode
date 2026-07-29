# Deployment

RecallCode targets Vercel.

## Before deployment

1. Complete [SUPABASE_SETUP.md](SUPABASE_SETUP.md).
2. Push the repository to GitHub, GitLab, or Bitbucket.
3. Create a Vercel project from the repository.
4. Keep Framework Preset set to Next.js.
5. Add every variable from [ENVIRONMENT.md](ENVIRONMENT.md).
6. Deploy.

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

The public Piston endpoint may enforce its own capacity limits. Use a controlled
Piston deployment for production workloads. Set provider spend/rate limits for
Groq and Gemini. Monitor Vercel function logs and Supabase Auth/Postgres logs.
