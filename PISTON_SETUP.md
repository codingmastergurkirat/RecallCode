# Self-hosted Piston setup for RecallCode

RecallCode now uses your own Piston Docker service. Local development defaults
to:

```text
http://127.0.0.1:2000/api/v2
```

The old anonymous `emkc.org` endpoint is not used. RecallCode calls Piston only
from authenticated Next.js server routes, so the Piston URL and any proxy secret
never enter the browser bundle.

## Architecture

Local development:

```text
Browser
  -> RecallCode at http://localhost:3000
  -> Next.js server route
  -> Piston at http://127.0.0.1:2000/api/v2
```

Production:

```text
Browser
  -> RecallCode on Vercel
  -> Next.js server route
  -> https://piston.example.com/api/v2
  -> HTTPS reverse proxy with a secret-header check
  -> Piston on 127.0.0.1:2000
```

Never expose port `2000` directly to the public internet. A production Piston
host executes untrusted code and must be treated as isolated infrastructure,
not as part of the Supabase or database host.

## 1. Prerequisites

For local Windows development:

- Docker Desktop running Linux containers through WSL 2
- Docker Compose
- Git
- Node.js 15 or newer for Piston's package-manager CLI
- Enough disk space for the selected language runtimes

For a Linux host:

- Docker Engine and Docker Compose
- Node.js 15 or newer
- cgroup v2 enabled and cgroup v1 disabled
- A firewall

The official Piston repository requires LF line endings. On Windows, clone it
with:

```powershell
git -c core.autocrlf=input clone https://github.com/engineer-man/piston.git
Set-Location piston
```

If it is already cloned correctly, open a terminal in that clone and continue.
Keep the Piston clone separate from the RecallCode repository.

## 2. Start Piston locally

From the root of the cloned Piston repository:

```powershell
docker compose up -d api
docker compose ps
docker compose logs --tail 100 api
```

Older Docker Compose installations use `docker-compose` instead of
`docker compose`.

The official Compose file:

- runs `ghcr.io/engineer-man/piston`
- enables the privileges needed by Piston's isolation layer
- publishes port `2000`
- stores installed runtimes in `data/piston/packages`
- uses an in-memory `/tmp` filesystem for jobs

Confirm the API responds:

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:2000/api/v2/runtimes"
```

An empty array is normal at this point. A new Piston API has no language
runtimes installed.

If Docker does not respond, open Docker Desktop, wait until the engine reports
that it is running, and repeat the commands.

## 3. Install the RecallCode runtimes

Install the Piston CLI dependencies once, from the Piston repository:

```powershell
npm --prefix cli install
```

List packages:

```powershell
node .\cli\index.js ppman list
```

Install the five packages used by RecallCode. Piston's package name is `node`
for the JavaScript runtime and `gcc` for the C++ runtime:

```powershell
node .\cli\index.js ppman install node
node .\cli\index.js ppman install typescript
node .\cli\index.js ppman install python
node .\cli\index.js ppman install java
node .\cli\index.js ppman install gcc
```

On macOS or Linux, use `./cli/index.js` in place of `.\cli\index.js`.
Downloads can take several minutes and require internet access only while the
runtimes are being installed.

Confirm all five runtimes are present:

```powershell
$runtimes = Invoke-RestMethod `
  -Uri "http://127.0.0.1:2000/api/v2/runtimes"

$runtimes |
  Select-Object language, version, aliases |
  Format-Table -AutoSize
```

Expected language names are `javascript`, `typescript`, `python`, `java`, and
`c++`. RecallCode also understands common aliases such as `js`, `ts`, `py`,
`cpp`, and `gcc`.

Installed packages persist in the cloned Piston repository under
`data/piston/packages`. Do not delete that directory unless the runtimes should
be reinstalled.

## 4. Test Piston directly

Test JavaScript before involving RecallCode:

```powershell
$body = @{
  language = "javascript"
  version = "*"
  files = @(
    @{
      name = "main.js"
      content = "console.log(21 * 2)"
    }
  )
  stdin = ""
  run_timeout = 3000
} | ConvertTo-Json -Depth 5

Invoke-RestMethod `
  -Uri "http://127.0.0.1:2000/api/v2/execute" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

The response should contain:

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

If this request fails, fix Piston before debugging the web application.

## 5. Local RecallCode configuration

From the RecallCode repository:

```powershell
Copy-Item .env.example .env.local
```

Keep these values in `.env.local`:

```env
PISTON_API_URL=http://127.0.0.1:2000/api/v2
PISTON_RUN_TIMEOUT_MS=3000
PISTON_AUTH_HEADER=
PISTON_AUTH_VALUE=
```

The URL is the API base. Do not append `/runtimes` or `/execute`; RecallCode
adds those paths itself.

Authentication is empty locally because the Docker port is intended to be
reachable only from your machine. These variables are server-only and must
never use a `NEXT_PUBLIC_` prefix.

Restart Next.js after changing environment values:

```powershell
npm run dev
```

If RecallCode itself later runs in Docker, `127.0.0.1` would refer to the
RecallCode container, not Piston. Put both containers on the same Compose
network and use Piston's service name instead, for example:

```env
PISTON_API_URL=http://api:2000/api/v2
PISTON_RUN_TIMEOUT_MS=3000
```

The stock Piston run wall-time and CPU-time caps are 3000 milliseconds, so
RecallCode requests the same value. If Java startup is too slow on Docker
Desktop, raise both sides together:

1. Add these values to the Piston `api` service in its Compose file:

   ```yaml
   environment:
     PISTON_RUN_TIMEOUT: "5000"
     PISTON_RUN_CPU_TIME: "5000"
   ```

2. Recreate only the Piston API container:

   ```powershell
   docker compose up -d --force-recreate api
   ```

3. Set `PISTON_RUN_TIMEOUT_MS=5000` in RecallCode's `.env.local`.
4. Restart RecallCode.

Never set RecallCode's requested limit higher than the Piston host's matching
limit; Piston rejects such a request before running the program.

## 6. Test RecallCode end to end

1. Start Piston.
2. Start RecallCode.
3. Sign in.
4. Open a problem.
5. Select JavaScript and choose **Run**.
6. Confirm output and the resolved runtime version appear.
7. Repeat with TypeScript, Python, Java, and C++.
8. Choose **Submit & learn**.
9. Confirm a row appears in the Supabase `submissions` table.

Run only executes code. Submit executes the same code, stores the result, and
then attempts to generate the learning pack.

## 7. Production architecture

Vercel cannot reach `127.0.0.1`, a home LAN address, or a Docker network on
your computer. For a deployed RecallCode app, Piston must have a public HTTPS
hostname that the Vercel server runtime can reach.

Use this layout:

```text
Vercel
  -> HTTPS
  -> piston.example.com:443
  -> Caddy or another reverse proxy
  -> 127.0.0.1:2000
  -> Piston container
```

The Piston project and Docker image are free and open source. Running it on
hardware you already own can have no hosting bill beyond power and network
costs. A permanently public deployment is not guaranteed to be free: many
serverless and free container platforms do not allow privileged containers,
Linux cgroups, or long-running workloads. Before choosing a free tier, verify
all three requirements.

For a reliable public demo, use an always-on Linux machine or VM where you
control Docker, the firewall, and DNS.

## 8. Run Piston safely on the production host

In the cloned Piston repository on the Linux host, create a separate
`docker-compose.production.yaml`:

```yaml
services:
  api:
    image: ghcr.io/engineer-man/piston
    container_name: piston_api
    restart: unless-stopped
    privileged: true
    environment:
      PISTON_RUN_TIMEOUT: "3000"
      PISTON_RUN_CPU_TIME: "3000"
    ports:
      - "127.0.0.1:2000:2000"
    volumes:
      - ./data/piston/packages:/piston/packages
    tmpfs:
      - /tmp:exec
```

Start it:

```bash
docker compose -f docker-compose.production.yaml up -d
docker compose -f docker-compose.production.yaml ps
curl http://127.0.0.1:2000/api/v2/runtimes
```

The `127.0.0.1` binding is important. It prevents Docker from publishing Piston
on every network interface.

Install the required packages on that host:

```bash
npm --prefix cli install
node ./cli/index.js ppman install node
node ./cli/index.js ppman install typescript
node ./cli/index.js ppman install python
node ./cli/index.js ppman install java
node ./cli/index.js ppman install gcc
```

Allow inbound firewall traffic only for SSH, HTTP, and HTTPS. Do not allow
inbound TCP `2000`.

## 9. Add HTTPS and a secret header

Piston does not provide RecallCode-specific authentication. Put a reverse proxy
in front of it. The following Caddy example:

- obtains and renews HTTPS certificates
- accepts only the two API operations RecallCode needs
- requires a secret `X-RecallCode-Key` header
- removes that secret before forwarding the request

Generate a 32-byte secret:

```bash
openssl rand -hex 32
```

Store it as `PISTON_PROXY_KEY` in the Caddy service environment. Do not commit
it to either repository. For a systemd-managed Caddy installation, run:

```bash
sudo systemctl edit caddy
```

Add this drop-in, using the generated hex value:

```ini
[Service]
Environment="PISTON_PROXY_KEY=replace-with-the-real-secret"
```

Save the editor, then run:

```bash
sudo systemctl daemon-reload
```

Configure `/etc/caddy/Caddyfile`:

```caddyfile
piston.example.com {
  route {
    @runtimes {
      method GET
      path /api/v2/runtimes
      header X-RecallCode-Key {$PISTON_PROXY_KEY}
    }

    @execute {
      method POST
      path /api/v2/execute
      header X-RecallCode-Key {$PISTON_PROXY_KEY}
    }

    reverse_proxy @runtimes 127.0.0.1:2000 {
      header_up -X-RecallCode-Key
    }

    reverse_proxy @execute 127.0.0.1:2000 {
      header_up -X-RecallCode-Key
    }

    respond "Not found" 404
  }
}
```

Replace `piston.example.com` with a DNS name whose `A` or `AAAA` record points
to the host. Validate and reload Caddy:

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl restart caddy
```

Test the protected public endpoint:

```bash
curl -i https://piston.example.com/api/v2/runtimes
curl -i \
  -H "X-RecallCode-Key: replace-with-the-real-secret" \
  https://piston.example.com/api/v2/runtimes
```

The first request should not return the runtime list. The second should return
JSON. Use HTTPS only; sending the secret over plain HTTP exposes it.

This example intentionally does not expose Piston package-management routes.
Install and update runtimes locally on the server through the CLI.

For a public app, also add rate limiting at the reverse proxy, firewall, or edge
layer. The stock Caddy build does not include a general rate-limit directive,
so do not copy examples that assume an uninstalled Caddy plugin.

## 10. Configure RecallCode on Vercel

In **Vercel -> Project -> Settings -> Environment Variables**, set:

```env
PISTON_API_URL=https://piston.example.com/api/v2
PISTON_RUN_TIMEOUT_MS=3000
PISTON_AUTH_HEADER=X-RecallCode-Key
PISTON_AUTH_VALUE=replace-with-the-real-secret
```

Apply the values to Preview and Production as needed. Mark
`PISTON_AUTH_VALUE` sensitive. Redeploy RecallCode after saving them; existing
deployments do not receive new environment values automatically.

RecallCode sends the configured header to both `/runtimes` and `/execute`.
Because this occurs in Next.js server routes, the browser never sees the
secret.

Do not configure a production URL like:

```text
http://127.0.0.1:2000/api/v2
http://192.168.x.x:2000/api/v2
http://piston:2000/api/v2
```

Those addresses are not reachable from Vercel.

## 11. Optional: build your own image

You do not need a custom image merely to self-host Piston. The cloned
repository plus the official `ghcr.io/engineer-man/piston` image is already a
self-hosted deployment.

If you modify Piston's API source and intentionally want to publish your fork:

```bash
docker build -t ghcr.io/your-account/piston:recallcode ./api
docker push ghcr.io/your-account/piston:recallcode
```

Then replace the `image` value in `docker-compose.production.yaml` with the
immutable tag for your image. Do not use an unversioned custom `latest` tag in
production. Review the upstream license and retest every runtime after changes.

## 12. Updates and recovery

The installed runtimes are stored under `data/piston/packages`. Back up that
directory if downloads would be difficult, and keep a written list of installed
packages. The runtimes can otherwise be reinstalled from the five commands in
this guide.

Update the standard image:

```bash
docker compose -f docker-compose.production.yaml pull
docker compose -f docker-compose.production.yaml up -d
docker compose -f docker-compose.production.yaml logs --tail 100 api
curl http://127.0.0.1:2000/api/v2/runtimes
```

After every update:

1. Confirm all five runtimes still exist.
2. Run the direct JavaScript smoke test.
3. Run and submit one problem through RecallCode.
4. Roll back to the previous pinned image tag if validation fails.

For predictable production releases, replace the floating image name with a
tested tag or digest.

## 13. Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| Docker command hangs | Docker Desktop or Docker Engine is not running | Start the engine and retry `docker compose ps` |
| Container exits immediately | Linux-container, privilege, or cgroup setup is wrong | Inspect `docker compose logs api`; use Linux containers and cgroup v2 |
| `/runtimes` returns `[]` | No packages are installed | Run the five `ppman install` commands |
| A language is missing | Its package failed or was skipped | Run `ppman list`, reinstall that exact package, and inspect logs |
| `ppman install` never finishes | A runtime archive download or extraction stalled | Stop that CLI request, verify GitHub release connectivity and free disk space, inspect Piston logs, then retry once |
| `Could not reach Piston` locally | Wrong URL, stopped container, or blocked port | Test `http://127.0.0.1:2000/api/v2/runtimes` directly |
| `Could not reach Piston` on Vercel | Private/local URL, DNS, firewall, or TLS problem | Test the public HTTPS URL from another network |
| `Piston authentication is incomplete` | Only one auth variable is set | Set both production auth variables or leave both empty locally |
| Public endpoint returns `404` | Secret header, method, or allowed path does not match | Check the Vercel header values and Caddy configuration |
| Runtime lookup returns `502` | Reverse proxy cannot reach Piston | Test the loopback endpoint on the Piston host |
| Execution times out | Host is overloaded or the submitted program exceeded limits | Inspect host CPU/RAM and Piston logs; keep abuse limits |
| Java prints output and then times out | JVM startup exceeded the stock 3-second CPU cap | Use a faster Linux host or raise both Piston's run wall/CPU caps and RecallCode's matching request together |
| Run works but Submit fails | Execution worked but database persistence failed | Inspect Supabase RLS and the `submissions` route logs |
| Submit saves but learning generation warns | Piston and Supabase worked; AI failed | Check Groq/Gemini keys, quotas, and server logs |

Useful commands:

```powershell
docker compose ps
docker compose logs --tail 200 api
docker stats piston_api
Invoke-RestMethod -Uri "http://127.0.0.1:2000/api/v2/runtimes"
```

## 14. Security checklist

- [ ] Piston runs on a dedicated or non-critical host.
- [ ] Outbound networking for executed programs remains disabled.
- [ ] Runtime, memory, output, process, and file limits remain enabled.
- [ ] Port `2000` is bound to loopback and blocked by the firewall.
- [ ] Only `/api/v2/runtimes` and `/api/v2/execute` are proxied publicly.
- [ ] The public endpoint uses valid HTTPS.
- [ ] A long random secret header is required.
- [ ] The secret exists only in the proxy and server-only Vercel variables.
- [ ] Rate limiting and monitoring are enabled before public traffic.
- [ ] Docker, Piston, and the host OS are kept updated.
- [ ] No Supabase, AI, or personal credentials are submitted as source code.

Piston uses Docker plus Isolate, Linux namespaces, chroot, unprivileged users,
and cgroups to contain programs. That is a strong baseline, but self-hosting
still makes you responsible for host hardening, updates, capacity, monitoring,
and incident response.

## 15. Final verification

- [ ] `docker compose ps` reports `piston_api` running.
- [ ] `/api/v2/runtimes` lists all five RecallCode languages.
- [ ] The direct JavaScript test prints `42`.
- [ ] Local `.env.local` points to `http://127.0.0.1:2000/api/v2`.
- [ ] Local Run works for all five languages.
- [ ] Local Submit creates a Supabase row.
- [ ] Production Piston is accessible only through HTTPS.
- [ ] A request without the secret does not reveal Piston.
- [ ] Vercel uses the public HTTPS URL and secret header.
- [ ] Production Run and Submit both pass after redeployment.

## Official references

- [Piston repository, installation, API, and security](https://github.com/engineer-man/piston)
- [Piston Docker Compose file](https://github.com/engineer-man/piston/blob/master/docker-compose.yaml)
- [Caddy request matchers](https://caddyserver.com/docs/caddyfile/matchers)
- [Caddy reverse proxy](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy)
- [RecallCode execution internals](PISTON.md)
- [RecallCode environment variables](ENVIRONMENT.md)
