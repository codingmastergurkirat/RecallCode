# Database

Supabase PostgreSQL is RecallCode's only application database. There is no ORM;
server and browser access use the official typed Supabase client, and all
ownership is enforced with row-level security.

## Migration order

Run these files in order:

1. `database/migrations/0001_initial_schema.sql`
2. `database/migrations/0002_auth_hardening.sql`
3. `database/migrations/0003_learning_pack_rpc.sql`
4. `database/seed_neetcode150.sql`

All migrations are safe to keep in source control. The metadata seed uses
`on conflict` updates and can be rerun.

## Tables

| Table | Purpose |
| --- | --- |
| `profiles` | Public user profile linked to `auth.users` |
| `patterns` | Canonical algorithm-pattern catalog |
| `questions` | Metadata-only problem library |
| `question_tags` | Normalized searchable tags |
| `submissions` | Executed code, result, output, and runtime |
| `flashcards` | Durable SM-2 card state |
| `reviews` | Immutable review history |
| `ai_feedback` | Structured analysis for an accepted submission |
| `active_recall_questions` | Generated reflection prompts |
| `active_recall_answers` | Persistent learner answers and confidence |
| `pattern_progress` | Materialized user mastery per pattern |
| `daily_stats` | Daily solved/review activity |

## Functions and triggers

- `handle_new_user()` creates a profile after a row is inserted into
  `auth.users`.
- `refresh_pattern_progress()` updates mastery and daily activity after each
  submission.
- `submit_flashcard_review()` atomically applies the SM-2 ease calculation,
  schedules 1, 3, 7, 14, or 30 days, writes review history, and increments the
  day's review count.
- `store_learning_pack()` atomically stores AI feedback, flashcards, and recall
  questions for an owned accepted submission.
- `get_dashboard_stats()` returns only the current authenticated user's
  aggregates.

Security-definer functions use an empty `search_path`, verify `auth.uid()`, and
have public/anonymous execution revoked.

## RLS model

Patterns and questions are readable by authenticated users. Every user-owned
table checks `auth.uid() = user_id`; profiles check `auth.uid() = id`.
Mutations are permitted only where the app needs them. Progress and daily stats
are read-only from the client and maintained by database functions.

## Regenerating the seed

Edit `scripts/generate-neetcode-seed.mjs`, then run:

```bash
node scripts/generate-neetcode-seed.mjs
npm test
```

The generator fails unless it contains exactly 150 records.
