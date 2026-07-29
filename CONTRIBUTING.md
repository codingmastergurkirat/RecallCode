# Contributing

## Workflow

1. Create a focused branch.
2. Install dependencies with `npm install`.
3. Make a small, typed change.
4. Add or update tests for behavior and invariants.
5. Run all quality checks.
6. Open a pull request with setup or migration notes.

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Standards

- Keep TypeScript strict; do not introduce `any`.
- Use Supabase Auth and `@supabase/ssr` exclusively.
- Add no alternate auth service or session library.
- Keep authorization in server code and RLS.
- Do not expose service-role or AI keys.
- Use Lucide React for icons.
- Preserve the orange/black/white design system and complete dark mode.
- Do not add copyrighted problem statements.
- Store durable product data in Supabase, not browser storage.
- Keep AI outputs schema-validated and database writes atomic.

## Database changes

Create the next numbered SQL migration. Include indexes, grants, RLS, and
function privilege changes in the same milestone. Do not edit a migration that
has already been deployed unless the project has not left local development.

If question metadata changes, update the generator, regenerate the seed, and
verify the record count remains 150.

## Pull request notes

Describe the user outcome, affected routes, database changes, environment
changes, and manual verification. Include screenshots only when they help
review a visual change.
