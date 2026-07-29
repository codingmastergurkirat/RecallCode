import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("NeetCode metadata seed contains exactly 150 question rows", async () => {
  const sql = await read("database/seed_neetcode150.sql");
  assert.equal((sql.match(/^  \('/gm) ?? []).length, 150);
  assert.match(sql, /No copyrighted problem statements/);
  assert.doesNotMatch(sql, /problem_statement/i);
});

test("authentication uses only official Supabase packages", async () => {
  const packageJson = JSON.parse(await read("package.json"));
  const names = Object.keys(packageJson.dependencies);
  assert.ok(names.includes("@supabase/ssr"));
  assert.ok(names.includes("@supabase/supabase-js"));
  for (const forbidden of [
    "@clerk/nextjs",
    "next-auth",
    "firebase",
    "@auth/core",
  ]) {
    assert.ok(!names.includes(forbidden), `${forbidden} must not be installed`);
  }
});

test("database creates profiles and enforces the required review cadence", async () => {
  const schema = await read("database/migrations/0001_initial_schema.sql");
  assert.match(schema, /create trigger on_auth_user_created/i);
  assert.match(schema, /after insert on auth\.users/i);
  assert.match(schema, /when next_repetitions = 1 then 1/i);
  assert.match(schema, /when next_repetitions = 2 then 3/i);
  assert.match(schema, /when next_repetitions = 3 then 7/i);
  assert.match(schema, /when next_repetitions = 4 then 14/i);
  assert.match(schema, /else 30/i);
  assert.match(schema, /enable row level security/gi);
});

test("Next.js 16 Proxy refreshes the Supabase session", async () => {
  const proxy = await read("proxy.ts");
  const sessionProxy = await read("lib/supabase/proxy.ts");
  assert.match(proxy, /updateSession/);
  assert.match(sessionProxy, /supabase\.auth\.getUser\(\)/);
  assert.match(sessionProxy, /NextResponse\.redirect/);
});

test("Piston execution supports provider authentication and clear failures", async () => {
  const service = await read("services/piston.service.ts");
  const environment = await read(".env.example");
  const setup = await read("PISTON_SETUP.md");
  assert.match(service, /PISTON_AUTH_HEADER/);
  assert.match(service, /PISTON_AUTH_VALUE/);
  assert.match(service, /PistonServiceError/);
  assert.match(service, /February 15, 2026/);
  assert.match(environment, /PISTON_AUTH_HEADER=/);
  assert.match(environment, /PISTON_AUTH_VALUE=/);
  assert.match(setup, /Option A: Authorized EMKC public API/);
  assert.match(setup, /Option B: A hosted Piston-compatible provider/);
  assert.match(setup, /Configure Vercel/);
  assert.match(setup, /Troubleshooting/);
  assert.match(setup, /Never commit the real token/);
});

test("hackathon email uses only Supabase Auth's built-in sender", async () => {
  const setup = await read("SUPABASE_SETUP.md");
  const environment = await read(".env.example");
  const authForm = await read("components/auth/auth-form.tsx");
  assert.match(setup, /Supabase Auth's built-in email sender/);
  assert.match(setup, /\{\{ \.ConfirmationURL \}\}/);
  assert.match(setup, /two messages per hour/);
  assert.doesNotMatch(setup, /smtp\.resend\.com/i);
  assert.doesNotMatch(environment, /RESEND_API_KEY/);
  assert.match(authForm, /supabase\.auth\.signUp/);
  assert.match(authForm, /supabase\.auth\.resetPasswordForEmail/);
  assert.match(authForm, /email_address_not_authorized/);
});

test("the visual system uses Black Ops One with Oswald fallback", async () => {
  const layout = await read("app/layout.tsx");
  const styles = await read("app/globals.css");
  assert.match(layout, /Black_Ops_One/);
  assert.doesNotMatch(layout, /Jersey_/);
  assert.match(styles, /--font-black-ops-one/);
  assert.match(styles, /var\(--font-oswald\)/);
  assert.doesNotMatch(styles, /font-jersey/);
});
