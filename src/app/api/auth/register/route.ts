import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const { email, password, org_name } = await request.json();

    if (!email || !password || !org_name) {
      return NextResponse.json(
        { success: false, error: "Missing fields" },
        { status: 400 }
      );
    }

    // 1. Create auth user via server client
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return NextResponse.json(
        { success: false, error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { success: false, error: "Failed to create user" },
        { status: 500 }
      );
    }

    // 2. Create organization + membership via admin client (bypasses RLS)
    const admin = createAdminClient();
    const slug = org_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const { data: org, error: orgError } = await admin
      .from("organizations")
      .insert({ name: org_name, slug })
      .select()
      .single();

    if (orgError) {
      return NextResponse.json(
        { success: false, error: "Failed to create organization" },
        { status: 500 }
      );
    }

    const { error: memberError } = await admin
      .from("organization_members")
      .insert({
        organization_id: org.id,
        user_id: authData.user.id,
        role: "owner",
      });

    if (memberError) {
      return NextResponse.json(
        { success: false, error: "Failed to create membership" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POST /api/auth/register]", error);
    return NextResponse.json(
      { success: false, error: "Internal error" },
      { status: 500 }
    );
  }
}
