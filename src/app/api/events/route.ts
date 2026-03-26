import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const admin = createAdminClient();

    const { data: membership } = await admin
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .single();

    if (!membership) {
      return NextResponse.json(
        { success: false, error: "No organization" },
        { status: 400 }
      );
    }

    const { data: events, error } = await admin
      .from("events")
      .select("*")
      .eq("organization_id", membership.organization_id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { events, organization_id: membership.organization_id },
    });
  } catch (error) {
    console.error("[GET /api/events]", error);
    return NextResponse.json(
      { success: false, error: "Internal error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const admin = createAdminClient();

    // Get user's org
    const { data: membership } = await admin
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .single();

    if (!membership) {
      return NextResponse.json(
        { success: false, error: "No organization" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const suffix = Math.random().toString(36).substring(2, 6);
    const slug = body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      + "-" + suffix;

    const { data: event, error } = await admin
      .from("events")
      .insert({
        name: body.name,
        description: body.description || null,
        start_date: body.start_date || null,
        end_date: body.end_date || null,
        locale: body.locale || "fr",
        access_password: body.access_password || null,
        branding: body.branding || {},
        organization_id: membership.organization_id,
        slug,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: event });
  } catch (error) {
    console.error("[POST /api/events]", error);
    return NextResponse.json(
      { success: false, error: "Internal error" },
      { status: 500 }
    );
  }
}
