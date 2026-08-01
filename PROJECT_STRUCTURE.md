# Project structure

```text
app/
  (auth)/              Authentication pages
  (app)/               Protected product routes
  api/                 Authenticated route handlers
  auth/                Supabase PKCE and OTP callbacks
components/
  auth/                Authentication UI
  dashboard/           Analytics visuals
  flashcards/          Deck UI
  problems/            Library, Monaco, and workspace
  profile/             Account UI
  reviews/             SM-2 and active-recall sessions
  ui/                  Reusable primitives
database/
  migrations/          Ordered PostgreSQL migrations
  seed_neetcode150.sql Metadata-only problem seed
hooks/                 Reserved for reusable client hooks
lib/
  supabase/            Browser, server, config, and Proxy clients
prompts/               Versioned AI instructions
scripts/               Deterministic seed generator
services/              Auth, data, AI, JDoodle, and review logic
tests/                 Architecture and data invariants
types/                 Strict database and domain types
utils/                 Reserved for focused domain utilities
```

Server Components fetch data through `services`. Route Handlers authenticate
with the server Supabase client and validate payloads with Zod. Client
components own transient interface state only; durable learning state belongs
in Supabase.

Next.js 16 renamed Middleware to Proxy. `proxy.ts` is the current framework file
for middleware-based optimistic route protection. Secure authorization remains
in server code and RLS.
