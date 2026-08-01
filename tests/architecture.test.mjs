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

test("JDoodle execution keeps credentials server-side and maps all workspace languages", async () => {
  const service = await read("services/jdoodle.service.ts");
  const execution = await read("lib/execution.ts");
  const environment = await read(".env.example");
  const setup = await read("JDOODLE_SETUP.md");
  assert.match(service, /https:\/\/api\.jdoodle\.com\/v1\/execute/);
  assert.match(service, /JDOODLE_CLIENT_ID/);
  assert.match(service, /JDOODLE_CLIENT_SECRET/);
  assert.match(service, /JDoodleServiceError/);
  assert.match(service, /JDOODLE_REQUEST_TIMEOUT_MS/);
  assert.match(service, /language: "nodejs"[\s\S]*versionIndex: "7"/);
  assert.match(service, /language: "typescript"[\s\S]*versionIndex: "1"/);
  assert.match(service, /language: "python3"[\s\S]*versionIndex: "6"/);
  assert.match(service, /language: "java"[\s\S]*versionIndex: "6"/);
  assert.match(service, /language: "cpp17"[\s\S]*versionIndex: "3"/);
  assert.match(execution, /export const supportedLanguages/);
  assert.match(environment, /JDOODLE_CLIENT_ID=/);
  assert.match(environment, /JDOODLE_CLIENT_SECRET=/);
  assert.match(environment, /JDOODLE_REQUEST_TIMEOUT_MS=30000/);
  assert.match(setup, /Create JDoodle API credentials/);
  assert.match(setup, /Supported language mapping/);
  assert.match(setup, /Vercel deployment/);
  assert.match(setup, /Troubleshooting/);
  assert.match(setup, /API credits/);
  assert.doesNotMatch(environment, /NEXT_PUBLIC_JDOODLE/);
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

test("the visual system uses Inter across the product", async () => {
  const layout = await read("app/layout.tsx");
  const styles = await read("app/globals.css");
  assert.match(layout, /import \{ Inter \} from "next\/font\/google"/);
  assert.match(layout, /weight: \["400", "500", "600"\]/);
  assert.match(styles, /--font-inter/);
  assert.doesNotMatch(layout, /Black_Ops_One|Oswald|Jersey_/);
  assert.doesNotMatch(styles, /font-black-ops-one|font-oswald|font-jersey/);
  assert.match(styles, /\.app-nav-links[\s\S]*font-size: 15px/);
  assert.match(styles, /\.problem-title-cell > a[\s\S]*font-size: 15px/);
});

test("flashcards can be deleted through owner-scoped Supabase RLS", async () => {
  const grid = await read("components/flashcards/flashcard-grid.tsx");
  const schema = await read("database/migrations/0001_initial_schema.sql");
  assert.match(grid, /\.from\("flashcards"\)[\s\S]*\.delete\(\)/);
  assert.match(grid, /\.eq\("id", id\)/);
  assert.match(grid, /router\.refresh\(\)/);
  assert.match(grid, /Delete flashcard:/);
  assert.match(schema, /Users can delete their flashcards/);
  assert.match(schema, /flashcard_id uuid not null references public\.flashcards\(id\) on delete cascade/);
});
