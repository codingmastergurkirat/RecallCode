# Piston execution

RecallCode calls Piston from server route handlers. The browser never contacts
the executor directly.

## Why Run and Submit need credentials

The shared EMKC Piston API is no longer freely available as of February 15,
2026. Anonymous requests that older tutorials rely on will not execute code.
That upstream policy—not the editor—is why an otherwise valid RecallCode setup
can show failed Run and Submit requests.

Choose one production executor:

1. Obtain access from the operator of the Piston endpoint, if your use case is
   eligible.
2. Use a compatible hosted Piston provider.
3. Point RecallCode at an existing Piston deployment your team operates.

This project does not add Docker or a local execution sandbox.

Configure the exact credentials issued by the provider:

```env
PISTON_API_URL=https://executor.example.com/api/v2/piston
PISTON_AUTH_HEADER=Authorization
PISTON_AUTH_VALUE=Bearer provider-token
```

If the provider uses an API-key header instead:

```env
PISTON_AUTH_HEADER=X-API-Key
PISTON_AUTH_VALUE=provider-token
```

Do not add these values to `NEXT_PUBLIC_` variables. Add the same three values
to Vercel for Preview and Production, then redeploy. RecallCode sends the header
to both `/runtimes` and `/execute`.

## Supported languages

- JavaScript
- TypeScript
- Python
- Java
- C++

Before execution, RecallCode requests `/runtimes` and selects an installed
version matching the language or its aliases. No stale runtime version is
hard-coded.

## Request safeguards

- Authentication required
- Source limited to 50,000 characters
- Standard input limited to 10,000 characters
- 10-second compile timeout
- 5-second run timeout
- Compile and run memory limits
- 20-second upstream request timeout
- Provider authentication remains server-only
- Upstream HTTP status and safe error details are returned to the console

## Run versus submit

Run executes code and displays output without storing data. Submit executes the
same code and stores the result. A zero compile/run exit is recorded as
`accepted` for the metadata-based workspace and triggers the learning flow.

RecallCode deliberately does not copy copyrighted statements or hidden tests.
Therefore `accepted` means the program compiled and completed on the supplied
standard input; it does not claim acceptance by the source platform.

## Endpoint contract

Set `PISTON_API_URL` to the base API URL of a compatible Piston deployment. The
value should not end in `/execute`; RecallCode appends `/runtimes` and
`/execute`. The deployment must expose both endpoints using the Piston v2
request and response shape.

## Verification

After adding credentials:

1. Restart `npm run dev` or redeploy Vercel.
2. Open a problem and run the starter program with optional standard input.
3. Confirm the console shows a language/version and output.
4. Select **Submit & learn** and confirm a row appears in `submissions`.

If it still fails, use the exact message shown in the RecallCode console. A
`401` or `403` indicates an incorrect provider header; `429` indicates a
provider rate limit; a runtime-not-installed message means the endpoint does
not offer the selected language.
