import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("participants")
    .select("id, email, status, field_values, category_id, event_id")
    .eq("magic_token", token)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { success: false, error: "Participant not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const body = await request.json();
  const supabase = createAdminClient();

  // Only allow updating field_values and gdpr_consent_at
  const allowedFields: Record<string, unknown> = {};
  if (body.field_values) allowedFields.field_values = body.field_values;
  if (body.gdpr_consent_at) allowedFields.gdpr_consent_at = body.gdpr_consent_at;

  const { data, error } = await supabase
    .from("participants")
    .update(allowedFields)
    .eq("magic_token", token)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json(
      { success: false, error: "Update failed" },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true, data });
}
