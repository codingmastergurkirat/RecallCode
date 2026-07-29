# Piston API setup for RecallCode

This guide configures the Run and Submit features in RecallCode. It covers local
development, Vercel, provider authentication, smoke testing, and common errors.

## 1. Why the old public setup stopped working

Older Piston examples use this endpoint without credentials:

```text
https://emkc.org/api/v2/piston
```

That anonymous setup is no longer sufficient. The official Piston project says
its public API stopped being freely available on February 15, 2026. The runtime
list can still be publicly reachable, while an execution request returns
`401 Unauthorized`.

The public API now requires an authorization token issued by its operator.
Authorization is discretionary and is intended for low-volume,
non-commercial, educational use. It is not normally issued for individual,
portfolio, assignment, or conceptual projects.

Official source:
[engineer-man/piston](https://github.com/engineer-man/piston#public-api)

## 2. Choose an executor

RecallCode supports either of these options.

### Option A: Authorized EMKC public API

1. Read the current eligibility note in the official Piston repository.
2. Contact EngineerMan through the Discord link in that note.
3. Explain the application, expected traffic, educational benefit, and that the
   project is non-commercial.
4. If access is approved, ask for:
   - The API base URL.
   - The exact HTTP authorization header name.
   - The complete header value format.
   - Rate and concurrency limits.
   - Which runtimes are available.

Do not assume that the token uses `Authorization: Bearer`. Use exactly the
header format supplied with the token.

### Option B: A hosted Piston-compatible provider

Choose a provider or managed endpoint that exposes the Piston v2 contract:

```text
GET  {BASE_URL}/runtimes
POST {BASE_URL}/execute
```

Confirm that it offers JavaScript, TypeScript, Python, Java, and C++, and ask
for the same base URL, authorization header, quotas, and runtime information.

RecallCode does not include Docker or a self-hosted execution service. The
official self-hosted Piston installation requires Docker and Linux isolation,
so it is outside this project's deployment architecture.

## 3. Understand the environment variables

RecallCode uses three server-only variables:

| Variable | Meaning |
| --- | --- |
| `PISTON_API_URL` | Piston API base URL, without `/runtimes` or `/execute` |
| `PISTON_AUTH_HEADER` | Exact authentication header name supplied by the provider |
| `PISTON_AUTH_VALUE` | Complete header value, including a scheme such as `Bearer` when required |

Examples:

```env
# Bearer-token provider
PISTON_API_URL=https://executor.example.com/api/v2/piston
PISTON_AUTH_HEADER=Authorization
PISTON_AUTH_VALUE=Bearer provider-token
```

```env
# API-key-header provider
PISTON_API_URL=https://executor.example.com/api/v2/piston
PISTON_AUTH_HEADER=X-API-Key
PISTON_AUTH_VALUE=provider-token
```

Rules:

- Do not append `/execute` or `/runtimes` to `PISTON_API_URL`.
- Do not add quotation marks unless they are part of the issued value.
- Do not prefix these names with `NEXT_PUBLIC_`.
- Never commit the real token.
- Set both authentication variables or leave both empty for an endpoint that
  genuinely requires no authentication.

RecallCode deliberately stores the complete header value instead of assuming a
scheme. This makes the integration compatible with Bearer tokens, raw tokens,
and API-key headers.

## 4. Configure local development

Copy the environment template:

```powershell
Copy-Item .env.example .env.local
```

Open `.env.local` and replace the Piston entries with the values issued by the
provider:

```env
PISTON_API_URL=https://executor.example.com/api/v2/piston
PISTON_AUTH_HEADER=Authorization
PISTON_AUTH_VALUE=Bearer replace-with-real-token
```

Restart Next.js after every environment change:

```powershell
npm run dev
```

Environment variables are read by server route handlers. A browser refresh
without restarting the development server is not enough.

## 5. Configure Vercel

In the Vercel project:

1. Open **Settings → Environment Variables**.
2. Add `PISTON_API_URL`.
3. Add `PISTON_AUTH_HEADER`.
4. Add `PISTON_AUTH_VALUE` and mark it sensitive.
5. Select Development, Preview, and Production as appropriate.
6. Save the variables.
7. Redeploy the application.

Changing a Vercel variable does not modify an already-created deployment. A new
deployment is required.

## 6. Test the provider directly

Set temporary PowerShell session values. Do not paste a production token into a
shared terminal or screenshot:

```powershell
$env:PISTON_API_URL = "https://executor.example.com/api/v2/piston"
$env:PISTON_AUTH_HEADER = "Authorization"
$env:PISTON_AUTH_VALUE = "Bearer replace-with-real-token"
```

Create the request header:

```powershell
$pistonHeaders = @{}
$pistonHeaders[$env:PISTON_AUTH_HEADER] = $env:PISTON_AUTH_VALUE
```

### Check installed runtimes

```powershell
Invoke-RestMethod `
  -Uri "$env:PISTON_API_URL/runtimes" `
  -Headers $pistonHeaders `
  -Method Get
```

Confirm that the response includes the languages needed by RecallCode:

- `javascript`
- `typescript`
- `python`
- `java`
- `c++` or the alias `cpp`

### Execute a harmless JavaScript program

```powershell
$executeBody = @{
  language = "javascript"
  version = "*"
  files = @(
    @{
      name = "main.js"
      content = "console.log(42)"
    }
  )
  stdin = ""
} | ConvertTo-Json -Depth 5

Invoke-RestMethod `
  -Uri "$env:PISTON_API_URL/execute" `
  -Headers $pistonHeaders `
  -ContentType "application/json" `
  -Method Post `
  -Body $executeBody
```

A healthy response contains a `run` object with output similar to:

```json
{
  "run": {
    "stdout": "42\n",
    "stderr": "",
    "code": 0,
    "signal": null
  }
}
```

If the provider requires a fixed runtime version instead of `"*"`, use a
version returned by `/runtimes`.

## 7. Test RecallCode end to end

1. Start RecallCode and sign in.
2. Open **Problems** and select a problem.
3. Choose JavaScript.
4. Leave the starter program in the editor.
5. Enter optional standard input.
6. Select **Run**.
7. Confirm the console shows the language, resolved runtime version, duration,
   and output.
8. Select **Submit & learn**.
9. Confirm a row appears in the Supabase `submissions` table.
10. If an AI provider is configured, confirm the learning pack is created.

Run executes code without storing a submission. Submit executes the same code,
stores the result in Supabase, and then attempts learning-pack generation for a
successful execution.

## 8. How RecallCode calls Piston

The browser never calls Piston directly:

```text
Problem workspace
      |
      v
Next.js /api/execute or /api/submissions
      |
      v
services/piston.service.ts
      |
      +--> GET  /runtimes
      |
      +--> POST /execute
```

The server:

- Verifies the Supabase user before executing code.
- Sends the configured authentication header to both endpoints.
- Resolves an installed runtime dynamically instead of hard-coding a version.
- Limits source code to 50,000 characters.
- Limits standard input to 10,000 characters.
- Uses a 10-second compile timeout.
- Uses a 5-second run timeout.
- Enforces compile and run memory limits.
- Uses a 20-second upstream request timeout.
- Returns safe provider errors to the editor console.

Supported workspace languages:

- JavaScript
- TypeScript
- Python
- Java
- C++

## 9. Troubleshooting

| Error | Meaning | Fix |
| --- | --- | --- |
| EMKC requires authorization | The default EMKC URL has no configured token | Obtain approved access or configure another compatible provider |
| Piston authentication is incomplete | Only one authentication variable is set | Set both `PISTON_AUTH_HEADER` and `PISTON_AUTH_VALUE` |
| `401 Unauthorized` | Header name, token, or value format is wrong | Copy the provider's exact header and rotate the token if necessary |
| `403 Forbidden` | Token lacks permission or the account is blocked | Ask the provider to confirm access and scope |
| `429 Too Many Requests` | Provider quota was exceeded | Wait, reduce execution traffic, or request a higher quota |
| Runtime is not installed | The selected language is missing | Use a provider with that runtime or ask the operator to install it |
| `400 Bad Request` | Endpoint is incompatible or rejected the payload | Confirm Piston v2 compatibility and the base URL |
| Could not reach Piston | DNS, firewall, TLS, or endpoint failure | Test `/runtimes` directly from the deployment environment |
| Runtime lookup timed out | `/runtimes` took more than 12 seconds | Check provider health and network latency |
| Execution exceeded 20 seconds | The provider did not finish in the upstream limit | Check provider health; do not raise limits without reviewing abuse risk |
| Run works but Submit fails | Execution succeeded but persistence failed | Inspect Supabase Auth, database, RLS, and `submissions` logs |
| Code saves but learning pack warns | Piston and Supabase worked; AI generation failed | Check `GROQ_API_KEY`, `GEMINI_API_KEY`, quotas, and AI logs |

For Vercel-only failures, confirm the variables exist in the same environment as
the deployment and redeploy after changing them.

## 10. Security checklist

- Keep Piston credentials server-only.
- Never expose a token in React props, browser code, logs, or screenshots.
- Store production values in Vercel Environment Variables.
- Rotate a token immediately if it appears in Git history or a public log.
- Do not place passwords, API keys, or personal data inside code submitted for
  execution.
- Use only an executor that isolates untrusted programs and enforces resource
  limits.
- Review provider quotas before a public demonstration.
- Keep Supabase authentication on both execution routes.

## 11. Final verification checklist

- [ ] A Piston-compatible provider has approved the project.
- [ ] The exact base URL and authorization header are known.
- [ ] All three server-only variables are set locally.
- [ ] `/runtimes` returns every RecallCode language.
- [ ] A direct `/execute` smoke test returns `code: 0`.
- [ ] Run works inside the problem workspace.
- [ ] Submit creates a Supabase submission.
- [ ] The same variables are set in Vercel.
- [ ] Vercel was redeployed after the variables were added.
- [ ] No Piston credential uses the `NEXT_PUBLIC_` prefix.

## References

- [Official Piston repository and public API policy](https://github.com/engineer-man/piston#public-api)
- [Official Piston runtimes and execute contract](https://github.com/engineer-man/piston#api)
- [RecallCode execution behavior](PISTON.md)
- [RecallCode environment reference](ENVIRONMENT.md)

