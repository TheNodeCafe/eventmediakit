import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("variable_field_definitions")
    .select("*")
    .eq("event_id", eventId)
    .order("sort_order");

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { eventId } = await params;
  const body = await request.json();

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("variable_field_definitions")
    .insert({
      event_id: eventId,
      name: body.name,
      label: body.label,
      field_type: body.field_type,
      required: body.required ?? false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { field_id } = await request.json();
  const admin = createAdminClient();
  const { error } = await admin
    .from("variable_field_definitions")
    .delete()
    .eq("id", field_id);

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
