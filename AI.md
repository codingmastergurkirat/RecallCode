# AI integration

RecallCode uses direct HTTPS APIs—no OpenAI SDK and no AI framework.

## Provider order

1. Groq chat completions
2. Gemini `generateContent` fallback

The fallback runs when Groq is unconfigured, times out, returns a non-success
status, returns empty content, or produces a learning pack that fails schema
validation.

## Learning-pack contract

After a successful execution, the model must return:

- concise approach feedback
- mistakes or risks
- a better solution explanation
- time and space complexity
- interview tips
- similar problem titles
- 5–10 flashcards
- 4–6 active-recall prompts

Zod validates the response. `store_learning_pack()` then commits feedback,
cards, and prompts in one PostgreSQL transaction. A partial learning pack is
never persisted.

## Tutor

`POST /api/tutor` receives the problem ID, current language, current editor
content, and learner question. The server reloads trusted problem metadata,
authenticates the Supabase user, and asks the tutor to provide the smallest
useful hint before a complete answer.

## Privacy and limits

Submitted code and execution output may be sent to the configured AI provider.
Do not place secrets or personal data in editor content. Provider API keys are
server-only. Request size and response shape are validated, and provider calls
use a 30-second timeout.

## Changing prompts

Prompts live in `prompts/learning-pack.ts`. Keep the JSON shape synchronized
with the Zod schema in `services/ai.service.ts` and the JSON keys consumed by
`database/migrations/0003_learning_pack_rpc.sql`.
