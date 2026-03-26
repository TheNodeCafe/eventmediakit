import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Track a generation (for quota counting).
 * Actual rendering is done client-side via Fabric.js in the browser.
 */
export async function POST(request: Request) {
  try {
    const { event_id, template_id } = await request.json();

    if (!event_id || !template_id) {
      return NextResponse.json(
        { success: false, error: "Missing event_id or template_id" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Verify event is active
    const { data: event, error: eventErr } = await supabase
      .from("events")
      .select("id, organization_id")
      .eq("id", event_id)
      .eq("status", "active")
      .single();

    if (eventErr || !event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    // Check generation quota
    const { data: org } = await supabase
      .from("organizations")
      .select("generations_used, generations_limit")
      .eq("id", event.organization_id)
      .single();

    if (org && org.generations_used >= org.generations_limit) {
      return NextResponse.json(
        { success: false, error: "Quota de générations dépassé" },
        { status: 402 }
      );
    }

    // Track generation + increment counter
    await supabase.from("generations").insert({
      participant_id: null,
      template_id,
      organization_id: event.organization_id,
      status: "completed",
      completed_at: new Date().toISOString(),
    });

    if (org) {
      await supabase
        .from("organizations")
        .update({ generations_used: org.generations_used + 1 })
        .eq("id", event.organization_id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POST /api/render/public]", error);
    return NextResponse.json(
      { success: false, error: "Internal error" },
      { status: 500 }
    );
  }
}
