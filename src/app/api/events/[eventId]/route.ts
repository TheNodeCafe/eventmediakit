import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { eventId } = await params;
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 404 });
  return NextResponse.json({ success: true, data });
}
