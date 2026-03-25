import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRenderQueue, type RenderJobData } from "@/lib/bullmq/queues";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const { template_id } = await request.json();

    if (!template_id) {
      return NextResponse.json(
        { success: false, error: "Missing template_id" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Fetch participant
    const { data: participant, error: pError } = await supabase
      .from("participants")
      .select("*, event:events(organization_id)")
      .eq("magic_token", token)
      .single();

    if (pError || !participant) {
      return NextResponse.json(
        { success: false, error: "Participant not found" },
        { status: 404 }
      );
    }

    if (!participant.gdpr_consent_at) {
      return NextResponse.json(
        { success: false, error: "GDPR consent required" },
        { status: 403 }
      );
    }

    const orgId = (participant.event as { organization_id: string }).organization_id;

    // Check generation quota
    const { data: org } = await supabase
      .from("organizations")
      .select("generations_used, generations_limit")
      .eq("id", orgId)
      .single();

    if (org && org.generations_used >= org.generations_limit) {
      return NextResponse.json(
        { success: false, error: "Generation quota exceeded" },
        { status: 402 }
      );
    }

    // Create generation record
    const { data: generation, error: genError } = await supabase
      .from("generations")
      .insert({
        participant_id: participant.id,
        template_id,
        organization_id: orgId,
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

    // Enqueue BullMQ render job
    const jobData: RenderJobData = {
      generation_id: generation.id,
      template_id,
      participant_id: participant.id,
      organization_id: orgId,
      field_values: (participant.field_values as Record<string, string>) ?? {},
    };

    await getRenderQueue().add(`render-${generation.id}`, jobData);

    return NextResponse.json({
      success: true,
      data: { generation_id: generation.id, status: "pending" },
    });
  } catch (error) {
    console.error("[POST /api/participant/[token]/render]", error);
    return NextResponse.json(
      { success: false, error: "Internal error" },
      { status: 500 }
    );
  }
}
