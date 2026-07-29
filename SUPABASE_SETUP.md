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
- Redirect URL: `http://localhost:3000/reset-password`

Add the equivalent HTTPS URLs for every Vercel preview/production domain.

## 4. Hackathon email setup

RecallCode uses Supabase Auth's built-in email sender for the hackathon. There
is no Resend account, sending domain, SMTP credential, or email API key in the
application.

In **Authentication → Providers → Email**:

1. Enable the Email provider.
2. Enable email/password sign-ups.
3. Keep **Confirm email** enabled.
4. Leave custom SMTP disabled.

No code or `.env.local` value is required to select the built-in sender.
`supabase.auth.signUp()` and `supabase.auth.resetPasswordForEmail()` already
request the email directly from Supabase Auth.

### 4.1 Use the default email templates

Leave **Authentication → Email Templates → Confirm signup** on the default
confirmation link:

```text
{{ .ConfirmationURL }}
```

The application supplies `/auth/callback?next=/dashboard` as the sign-up
redirect. Supabase verifies the built-in link and returns a PKCE code to that
route, where RecallCode exchanges it for a session.

Leave the password-recovery template on its default `{{ .ConfirmationURL }}`
link as well. RecallCode supplies
`/auth/callback?next=/reset-password` as its recovery redirect.

### 4.2 Built-in sender limits

Supabase's built-in sender is for demos and testing:

- It sends only to email addresses that are members of the Supabase
  organization.
- It is currently limited to two messages per hour.
- It has no delivery SLA.

Add only your own hackathon testing addresses in **Organization Settings →
Team**. Do not add unknown judges to the organization just to authorize email.
Judges should use **Continue with Google**, which still authenticates entirely
through Supabase Auth and does not use the built-in email quota.

RecallCode displays a clear message directing users to Google when the built-in
sender rejects an unapproved address or reaches its email limit.

### 4.3 Test the complete flow

1. Sign up using an email address belonging to the Supabase organization.
2. Open the default Supabase confirmation message.
3. Confirm the browser reaches `/auth/callback` and then `/dashboard`.
4. Request a password reset using the same approved address.
5. Check **Supabase Dashboard → Logs → Auth** if delivery fails.

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
- Use Google OAuth for hackathon judges who are not Supabase team members.
- Move to a custom SMTP provider before accepting public email/password users.
- Review Auth rate limits and bot protection for public launches.
