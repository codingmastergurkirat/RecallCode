# JDoodle setup for RecallCode

RecallCode executes code through JDoodle's REST Compiler API. The browser calls
RecallCode's authenticated Next.js routes; only the server sends code and API
credentials to JDoodle.

```text
Browser
  -> POST /api/execute or /api/submissions
  -> authenticated Next.js route
  -> https://api.jdoodle.com/v1/execute
```

The JDoodle client secret must never be placed in browser code or in a variable
whose name starts with `NEXT_PUBLIC_`.

## 1. Create JDoodle API credentials

1. Create or sign in to a [JDoodle account](https://www.jdoodle.com/).
2. Open the API dashboard from the JDoodle menu.
3. Subscribe to a Compiler API plan. JDoodle documents a free API option for
   testing; API calls consume daily credits.
4. Copy the Client ID and Client Secret from the API credentials section.

JDoodle's official credential guide is available at
[Client ID & secret key](https://www.jdoodle.com/docs/compiler-apis/client-id-secret-key/).
Refreshing the secret in JDoodle invalidates the old value, so update every
RecallCode environment after rotating it.

## 2. Configure local development

Copy `.env.example` to `.env.local`, then set:

```env
JDOODLE_CLIENT_ID=your-client-id
JDOODLE_CLIENT_SECRET=your-client-secret
JDOODLE_REQUEST_TIMEOUT_MS=30000
```

`JDOODLE_REQUEST_TIMEOUT_MS` is optional. RecallCode defaults to 30 seconds and
accepts values from `5000` through `120000`. The setting limits how long the
Next.js server waits; it does not change JDoodle's own language-specific limits.

Restart Next.js after changing the file:

```bash
npm run dev
```

No Docker container, compiler installation, runtime download, public executor,
reverse proxy, or custom execution hostname is required.

## 3. Test the credentials directly

The following PowerShell example runs a small Python program. Set the two shell
variables to the credentials from the JDoodle dashboard:

```powershell
$jdoodleClientId = "your-client-id"
$jdoodleClientSecret = "your-client-secret"
$requestBody = @{
  clientId = $jdoodleClientId
  clientSecret = $jdoodleClientSecret
  script = 'print("RecallCode JDoodle check")'
  stdin = ""
  language = "python3"
  versionIndex = "6"
  compileOnly = $false
} | ConvertTo-Json

Invoke-RestMethod `
  -Method Post `
  -Uri "https://api.jdoodle.com/v1/execute" `
  -ContentType "application/json" `
  -Body $requestBody
```

Expected output includes a `200` `statusCode` and
`RecallCode JDoodle check`. Do not paste real credentials into screenshots,
issues, commits, or chat messages.

## 4. Test through RecallCode

1. Start RecallCode and sign in.
2. Open a problem.
3. Select a language.
4. Enter a small program and optional standard input.
5. Select **Run code** and confirm output and runtime appear.
6. Select **Submit solution** and confirm a submission row is created.

Both application endpoints require a valid Supabase session. The browser never
receives the JDoodle credentials.

## Supported language mapping

RecallCode currently uses the following values from JDoodle's official
[supported languages and versions](https://www.jdoodle.com/docs/compiler-apis/supported-languages-versions)
page, last updated there on July 3, 2026:

| RecallCode | JDoodle language | Version index | Displayed version |
| --- | --- | --- | --- |
| JavaScript | `nodejs` | `7` | Node.js 25.8.1 |
| TypeScript | `typescript` | `1` | TypeScript 5.9.3 |
| Python | `python3` | `6` | Python 3.14.3 |
| Java | `java` | `6` | JDK 25.0.2 |
| C++ | `cpp17` | `3` | C++17 / GCC 15.2.1 |

The mapping lives in `services/jdoodle.service.ts`. Check JDoodle's official
table before intentionally changing a language code or version index.

## Request and response handling

RecallCode sends these documented fields:

```json
{
  "clientId": "server-only",
  "clientSecret": "server-only",
  "script": "program source",
  "stdin": "optional input",
  "language": "python3",
  "versionIndex": "6",
  "compileOnly": false
}
```

The service normalizes JDoodle's `output`, `error`, `statusCode`, `memory`,
`cpuTime`, `compilationStatus`, `isExecutionSuccess`, and `isCompiled` fields
into RecallCode's existing execution result. That keeps Run, Submit, saved
submission status, output, and AI learning-pack generation consistent.

The official request contract is documented in
[JDoodle REST APIs](https://www.jdoodle.com/docs/compiler-apis/jdoodle-api-quickstart/rest-apis).

## API credits

JDoodle uses daily API credits. Run and Submit each execute the program, so each
action consumes an execution request. Avoid clicking Submit immediately after
Run when conserving hackathon credits.

Usage is visible in the JDoodle dashboard. It can also be queried with the
official endpoint:

```powershell
$requestBody = @{
  clientId = $jdoodleClientId
  clientSecret = $jdoodleClientSecret
} | ConvertTo-Json

Invoke-RestMethod `
  -Method Post `
  -Uri "https://api.jdoodle.com/v1/credit-spent" `
  -ContentType "application/json" `
  -Body $requestBody
```

See [JDoodle API credits](https://www.jdoodle.com/docs/compiler-apis/api-credits)
for the current credit model. Limits can change, so use the dashboard as the
source of truth for the subscribed plan.

## Vercel deployment

1. Open the RecallCode project in Vercel.
2. Go to **Settings -> Environment Variables**.
3. Add `JDOODLE_CLIENT_ID` and `JDOODLE_CLIENT_SECRET` as encrypted server
   variables.
4. Optionally add `JDOODLE_REQUEST_TIMEOUT_MS=30000`.
5. Apply the values to Production and to any Preview environment that should
   execute code.
6. Redeploy the application.

Do not add `NEXT_PUBLIC_` to either credential name. Vercel can reach JDoodle's
public HTTPS API directly, so no separate execution deployment is necessary.

## Security checklist

- Keep both JDoodle credentials server-only.
- Never log the request body sent to JDoodle because it contains the secret.
- Keep `/api/execute` and `/api/submissions` protected by Supabase Auth.
- Retain the existing code and standard-input length validation.
- Configure JDoodle plan limits appropriate for the demo or production traffic.
- Rotate the secret immediately if it is exposed.
- Review JDoodle's terms and privacy requirements before production use.

Submitted source code and standard input leave your infrastructure and are
processed by JDoodle. Reflect that behavior in your privacy policy and avoid
sending secrets inside programs or standard input.

## Troubleshooting

| Message or symptom | Likely cause | Fix |
| --- | --- | --- |
| `JDoodle is not configured` | One or both server credentials are missing | Set both variables and restart or redeploy |
| `JDoodle rejected the API credentials` | Invalid or rotated Client Secret | Copy the current values from the API dashboard |
| Daily API credit limit reached | Plan credits are exhausted | Check usage and wait for reset or change the API plan |
| Could not reach JDoodle | DNS, outbound HTTPS, or provider outage | Test the direct request and check JDoodle status/support |
| Request rejected | Invalid language/version or malformed payload | Compare the mapping with the official language table |
| Program timed out | Infinite loop, missing `stdin`, or expensive code | Supply input and simplify or correct the program |
| RecallCode wait limit reached | Local timeout is shorter than the execution | Increase `JDOODLE_REQUEST_TIMEOUT_MS` within the allowed range |
| Run works but Submit warns | Execution succeeded but AI generation failed | Check Groq/Gemini configuration separately |

JDoodle documents timeout behavior and upstream error codes in
[API timeout & errors](https://www.jdoodle.com/docs/compiler-apis/api-timeout-errors/).

## Final verification

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Then run a short program in all five languages and check the JDoodle credit
dashboard before the hackathon presentation.
