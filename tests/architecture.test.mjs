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
