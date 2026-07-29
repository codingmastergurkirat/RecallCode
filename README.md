# RecallCode

RecallCode is a production-ready DSA retention platform. Students solve
curated problems, reflect on their approach, and receive persistent
flashcards, active-recall prompts, spaced reviews, and submission-aware AI
feedback.

RecallCode is not a problem-statement mirror or a LeetCode clone. The included
NeetCode 150 seed contains metadata and source links only.

## Stack

- Next.js 16 App Router, React 19, strict TypeScript, Tailwind CSS
- Supabase PostgreSQL and Supabase Auth
- Official `@supabase/ssr` cookie-based session handling
- Monaco Editor, Recharts, Lucide React
- Piston for isolated code execution
- Groq AI with automatic Gemini fallback
- Vercel deployment target

No Clerk, NextAuth, Auth.js, Firebase, Prisma, MongoDB, OpenAI API, or Docker is
used.

## Product capabilities

- Email/password sign-up and sign-in
- Google OAuth through Supabase Auth
- Email verification, password reset, sign-out, persistent sessions
- Next.js 16 Proxy protection plus server-side identity checks and Supabase RLS
- Automatic profile row creation through an `auth.users` trigger
- Analytics dashboard, streaks, activity, weak patterns, and mastery
- Searchable/filterable NeetCode 150 library
- Five-language Monaco workspace and Piston execution
- Persistent submissions and atomic AI learning-pack storage
- 5–10 generated flashcards and 4–6 active-recall prompts per learning pack
- Server-side SM-2 review scheduling on a 1/3/7/14/30-day cadence
- Complete responsive light and dark themes

## Quick start

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local` and add credentials.
3. Run the SQL files in `database/migrations` in numeric order.
4. Run `database/seed_neetcode150.sql`.
5. Run `npm install`.
6. Run `npm run dev`.

Open `http://localhost:3000`.

Read [INSTALL.md](INSTALL.md) and [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for the
full setup.

## Quality checks

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Documentation

- [Installation](INSTALL.md)
- [Database](DATABASE.md)
- [Supabase setup](SUPABASE_SETUP.md)
- [Environment](ENVIRONMENT.md)
- [AI](AI.md)
- [Piston setup](PISTON_SETUP.md)
- [Piston execution internals](PISTON.md)
- [Project structure](PROJECT_STRUCTURE.md)
- [Deployment](DEPLOYMENT.md)
- [Contributing](CONTRIBUTING.md)
