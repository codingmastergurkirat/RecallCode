# Piston execution

RecallCode uses a self-hosted Piston Docker service. Next.js route handlers call
the executor; the browser never calls Piston directly.

Read [PISTON_SETUP.md](PISTON_SETUP.md) for the complete local Docker and
production deployment guide.

## Endpoint contract

Set `PISTON_API_URL` to the base of a Piston v2 API:

```env
PISTON_API_URL=http://127.0.0.1:2000/api/v2
PISTON_RUN_TIMEOUT_MS=3000
```

Do not append `/runtimes` or `/execute`. RecallCode calls:

```text
GET  {PISTON_API_URL}/runtimes
POST {PISTON_API_URL}/execute
```

Local Docker access does not require an authentication header. A public
production hostname must be protected by HTTPS and a secret-header reverse
proxy:

```env
PISTON_API_URL=https://piston.example.com/api/v2
PISTON_AUTH_HEADER=X-RecallCode-Key
PISTON_AUTH_VALUE=replace-with-a-long-random-secret
```

All three variables are server-only. Never use a `NEXT_PUBLIC_` prefix.

## Supported languages

- JavaScript
- TypeScript
- Python
- Java
- C++

A new Piston container has no installed runtimes. Install all five packages
before using the workspace. RecallCode requests `/runtimes` for every execution
and resolves the installed version dynamically, so no stale version is
hard-coded.

## Request flow

```text
Problem workspace
      |
      v
Next.js /api/execute or /api/submissions
      |
      v
Supabase user verification
      |
      v
services/piston.service.ts
      |
      +--> GET  /runtimes
      |
      +--> POST /execute
```

## Safeguards

- Supabase authentication is required on both execution routes.
- Source is limited to 50,000 characters.
- Standard input is limited to 10,000 characters.
- Compile wall-time and CPU-time limits are 10 seconds.
- Run wall-time and CPU-time limits default to 3 seconds.
- Compile and run memory limits are sent to Piston.
- Runtime lookup times out after 12 seconds.
- The complete upstream request times out after 20 seconds.
- The production proxy secret remains server-only.
- Safe upstream HTTP status and error details appear in the editor console.

Piston itself isolates jobs with Docker and Isolate. The operator is still
responsible for firewalling port `2000`, HTTPS, authentication, rate limiting,
updates, host monitoring, and capacity.

## Run versus Submit

Run executes code and displays output without storing data. Submit executes the
same code and stores the result. A zero compile/run exit is recorded as
`accepted` for the metadata-based workspace and triggers the learning flow.

RecallCode deliberately does not copy copyrighted statements or hidden tests.
Therefore `accepted` means the program compiled and completed on the supplied
standard input; it does not claim acceptance by the source platform.

## Failure meanings

| Message | Meaning |
| --- | --- |
| Could not reach Piston | Container, URL, DNS, firewall, TLS, or proxy failure |
| Authentication is incomplete | Only one of the two auth variables is set |
| Runtime is not installed | The selected language package is absent |
| `401`, `403`, or protected `404` | Production proxy secret is wrong or missing |
| `429` | A proxy or edge rate limit was reached |
| Runtime lookup timed out | `/runtimes` exceeded 12 seconds |
| Execution exceeded 20 seconds | The executor did not complete before the upstream limit |

Start diagnosis by testing `/runtimes` and `/execute` directly as described in
[PISTON_SETUP.md](PISTON_SETUP.md).
