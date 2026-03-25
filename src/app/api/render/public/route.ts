import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRenderQueue, type RenderJobData } from "@/lib/bullmq/queues";

export async function POST(request: Request) {
  try {
    const { event_id, template_id, field_values } = await request.json();

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
        { success: false, error: "Generation quota exceeded" },
        { status: 402 }
      );
    }

    // Create generation record (no participant linked for anonymous)
    const { data: generation, error: genError } = await supabase
      .from("generations")
      .insert({
        participant_id: null,
        template_id,
        organization_id: event.organization_id,
        status: "pending",
      })
      .select()
      .single();

    if (genError) {
      return NextResponse.json(
        { success: false, error: "Failed to create generation" },
        { status: 500 }
      );
    }

    // Enqueue render job if Redis is available
    const queue = getRenderQueue();
    if (queue) {
      const jobData: RenderJobData = {
        generation_id: generation.id,
        template_id,
        participant_id: "",
        organization_id: event.organization_id,
        field_values: field_values ?? {},
      };
      await queue.add(`render-${generation.id}`, jobData);
    } else {
      // No Redis — mark as failed, client will use fallback
      await supabase
        .from("generations")
        .update({
          status: "failed",
          error_message: "Render service not available",
        })
        .eq("id", generation.id);

      return NextResponse.json(
        { success: false, error: "Render service not available" },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { generation_id: generation.id, status: "pending" },
    });
  } catch (error) {
    console.error("[POST /api/render/public]", error);
    return NextResponse.json(
      { success: false, error: "Internal error" },
      { status: 500 }
    );
  }
}
