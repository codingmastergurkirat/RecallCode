"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  fullName: z.string().trim().max(80),
  username: z
    .string()
    .trim()
    .max(32)
    .refine(
      (value) => !value || (value.length >= 3 && /^[a-zA-Z0-9_-]+$/.test(value)),
      "Username must be 3–32 letters, numbers, underscores, or hyphens.",
    ),
  bio: z.string().trim().max(240),
});

export async function updateProfileAction(input: z.input<typeof schema>) {
  const values = schema.parse(input);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Your session has expired." };

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: values.fullName || null,
      username: values.username || null,
      bio: values.bio || null,
    })
    .eq("id", user.id);
  if (error) return { ok: false as const, error: error.message };

  const { error: authError } = await supabase.auth.updateUser({
    data: { full_name: values.fullName || null },
  });
  if (authError) return { ok: false as const, error: authError.message };

  revalidatePath("/profile");
  return { ok: true as const };
}
