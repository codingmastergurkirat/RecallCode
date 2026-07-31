# Installation

## Requirements

- Node.js 22.13 or newer
- npm 10 or newer
- A Supabase project
- A Groq key, Gemini key, or both for learning-pack and tutor features
- Docker Desktop with Linux containers, or a Linux Docker host, for Piston

## Install

```bash
git clone <your-repository-url>
cd recallcode
npm install
copy .env.example .env.local
```

On macOS or Linux, replace the final command with
`cp .env.example .env.local`.

Fill `.env.local` using [ENVIRONMENT.md](ENVIRONMENT.md), configure Supabase
using [SUPABASE_SETUP.md](SUPABASE_SETUP.md), and start the local execution
service using [PISTON_SETUP.md](PISTON_SETUP.md). Then start the app:

```bash
npm run dev
```

The development server is available at `http://localhost:3000`.

## Verify

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

The app intentionally fails authentication actions with a clear configuration
message if the Supabase public variables are missing. AI submissions remain
stored if execution succeeds but both AI providers are unavailable; the UI
reports why the learning pack was not created.

## Recommended local order

1. Start with a new Supabase project.
2. Run all migrations.
3. Load the metadata seed.
4. Enable email and Google authentication.
5. Start Piston and install the required runtimes.
6. Add environment variables.
7. Start Next.js.
8. Create an account and confirm the profile row exists.
9. Submit a small program and confirm learning records are created.
