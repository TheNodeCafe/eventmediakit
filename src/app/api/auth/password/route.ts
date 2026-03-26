import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { password } = await request.json();
    if (!password || password.length < 6) {
      return NextResponse.json({ success: false, error: "Le mot de passe doit faire au moins 6 caractères" }, { status: 400 });
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PATCH /api/auth/password]", error);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}
