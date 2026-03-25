import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { ParticipantPortal } from "@/components/features/participant-portal/participant-portal";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function ParticipantPage({ params }: Props) {
  const { token } = await params;
  const supabase = createAdminClient();

  // Fetch participant by magic token
  const { data: participant, error } = await supabase
    .from("participants")
    .select(
      `
      *,
      event:events(*, organization:organizations(name, logo_url, primary_color)),
      category:participant_categories(*)
    `
    )
    .eq("magic_token", token)
    .single();

  if (error || !participant) {
    notFound();
  }

  // Update status to link_opened if first access
  if (participant.status === "invited") {
    await supabase
      .from("participants")
      .update({
        status: "link_opened",
        first_accessed_at: new Date().toISOString(),
      })
      .eq("id", participant.id);
  }

  // Fetch variable field definitions for this event
  const { data: fieldDefinitions } = await supabase
    .from("variable_field_definitions")
    .select("*")
    .eq("event_id", participant.event_id)
    .order("sort_order");

  // Fetch templates available for this participant's category
  const { data: templates } = await supabase
    .from("templates")
    .select("*, template_categories!inner(category_id)")
    .eq("event_id", participant.event_id)
    .eq("status", "published")
    .eq("template_categories.category_id", participant.category_id);

  return (
    <ParticipantPortal
      participant={participant}
      event={participant.event}
      fieldDefinitions={fieldDefinitions ?? []}
      templates={templates ?? []}
      token={token}
    />
  );
}
