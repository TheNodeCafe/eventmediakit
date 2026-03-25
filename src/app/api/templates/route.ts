import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const admin = createAdminClient();
    const body = await request.json();

    const { data, error } = await admin
      .from("templates")
      .insert({
        event_id: body.event_id,
        name: body.name,
        format: body.format,
        width: body.width,
        height: body.height,
        canvas_json: body.canvas_json,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[POST /api/templates]", error);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const admin = createAdminClient();
    const body = await request.json();

    const { data, error } = await admin
      .from("templates")
      .update({
        name: body.name,
        format: body.format,
        width: body.width,
        height: body.height,
        canvas_json: body.canvas_json,
      })
      .eq("id", body.template_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[PATCH /api/templates]", error);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}
