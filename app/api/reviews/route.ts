import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  cardId: z.string().uuid(),
  quality: z.number().int().min(0).max(5),
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
    const { data, error } = await supabase.rpc("submit_flashcard_review", {
      card_id: input.cardId,
      review_quality: input.quality,
    });
    if (error) throw new Error(error.message);
    return NextResponse.json({ result: data });
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? error.issues[0]?.message
        : error instanceof Error
          ? error.message
          : "Review could not be saved.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
