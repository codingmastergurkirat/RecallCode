import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { executeCode } from "@/services/piston.service";

const schema = z.object({
  language: z.enum(["javascript", "typescript", "python", "java", "cpp"]),
  code: z.string().min(1, "Write some code first.").max(50_000),
  stdin: z.string().max(10_000).optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const input = schema.parse(await request.json());
    const result = await executeCode(input);
    return NextResponse.json({ result });
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? error.issues[0]?.message
        : error instanceof Error
          ? error.message
          : "Execution failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
