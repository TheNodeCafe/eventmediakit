import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const admin = createAdminClient();
    const { data: membership } = await admin
      .from("organization_members")
      .select("organization:organizations(*), role")
      .eq("user_id", user.id)
      .single();

    if (!membership) return NextResponse.json({ success: false, error: "No organization" }, { status: 400 });

    return NextResponse.json({
      success: true,
      data: {
        organization: membership.organization,
        role: membership.role,
        user: { id: user.id, email: user.email },
      },
    });
  } catch (error) {
    console.error("[GET /api/organization]", error);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const admin = createAdminClient();
    const { data: membership } = await admin
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .single();

    if (!membership) return NextResponse.json({ success: false, error: "No organization" }, { status: 400 });

    const body = await request.json();
    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.logo_url !== undefined) updateData.logo_url = body.logo_url;
    if (body.primary_color !== undefined) updateData.primary_color = body.primary_color;

    const { error } = await admin
      .from("organizations")
      .update(updateData)
      .eq("id", membership.organization_id);

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PATCH /api/organization]", error);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}
