# Supabase setup

## 1. Create the project

Create a Supabase project and note:

- Project URL
- Publishable key (or the legacy anonymous key)

RecallCode never requires a service-role key.

## 2. Run SQL

Open SQL Editor and run every file in `database/migrations` in numeric order.
Then run `database/seed_neetcode150.sql`.

Confirm the `profiles`, `questions`, `submissions`, and `flashcards` tables are
visible and that `questions` contains 150 rows.

## 3. Configure URLs

In Authentication → URL Configuration:

- Site URL: `http://localhost:3000` for local development
- Redirect URL: `http://localhost:3000/auth/callback`
- Redirect URL: `http://localhost:3000/auth/confirm`
- Redirect URL: `http://localhost:3000/reset-password`

Add the equivalent HTTPS URLs for every Vercel preview/production domain.

## 4. Email authentication

Enable Email in Authentication → Providers. Keep email confirmation enabled for
production.

For PKCE-safe confirmation, configure the confirmation template link as:

```text
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
```

Password recovery initiated by RecallCode redirects through
`/auth/callback?next=/reset-password`.

## 5. Google OAuth

1. Create a Google OAuth 2.0 web client.
2. Use Supabase's provider callback URL shown in Authentication → Providers →
   Google as Google's authorized redirect URI.
3. Add the Google client ID and secret to Supabase.
4. Enable Google.

The application calls `supabase.auth.signInWithOAuth({ provider: "google" })`;
Google never bypasses Supabase Auth.

## 6. Environment

Set:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-key
```

## 7. Verify the trigger

Create a test user. In Table Editor → `profiles`, confirm a row exists with the
same UUID as the new `auth.users` row. If sign-up reports a database error,
inspect Supabase Auth and Postgres logs and verify all migrations ran in order.

## 8. Production checks

- Keep RLS enabled on every public table.
- Do not expose the service-role key.
- Add exact production redirect URLs.
- Use a custom SMTP provider for reliable transactional email.
- Review Auth rate limits and bot protection for public launches.
