import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { eventId } = await params;
  const body = await request.json();

  const admin = createAdminClient();

  // Get current event
  const { data: event } = await admin
    .from("events")
    .select("branding")
    .eq("id", eventId)
    .single();

  // Merge branding — explicitly handle null/undefined to allow deletion
  const currentBranding = (event?.branding as Record<string, unknown>) ?? {};
  const incomingBranding = body.branding ?? {};
  const newBranding = { ...currentBranding };
  for (const [key, value] of Object.entries(incomingBranding)) {
    if (value === null || value === undefined) {
      delete newBranding[key];
    } else {
      newBranding[key] = value;
    }
  }

  // Update event fields + branding
  const updateData: Record<string, unknown> = { branding: newBranding };
  if (body.name !== undefined) updateData.name = body.name;
  if (body.description !== undefined) updateData.description = body.description || null;
  if (body.start_date !== undefined) updateData.start_date = body.start_date || null;
  if (body.end_date !== undefined) updateData.end_date = body.end_date || null;
  if (body.access_password !== undefined) updateData.access_password = body.access_password || null;

  const { error } = await admin
    .from("events")
    .update(updateData)
    .eq("id", eventId);

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
