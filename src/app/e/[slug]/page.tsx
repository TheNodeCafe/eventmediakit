import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { PublicEventPage } from "@/components/features/public-event/public-event-page";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function EventPublicPage({ params }: Props) {
  const { slug } = await params;
  const supabase = createAdminClient();

  // Fetch event by slug (only active events)
  const { data: event, error } = await supabase
    .from("events")
    .select(
      `
      *,
      organization:organizations(name, logo_url, primary_color)
    `
    )
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (error || !event) {
    notFound();
  }

  // Fetch categories for this event
  const { data: categories } = await supabase
    .from("participant_categories")
    .select("*")
    .eq("event_id", event.id)
    .order("sort_order");

  // Fetch published templates with their category associations
  const { data: templates } = await supabase
    .from("templates")
    .select("*, template_categories(category_id)")
    .eq("event_id", event.id)
    .eq("status", "published");

  // Fetch variable field definitions
  const { data: fieldDefinitions } = await supabase
    .from("variable_field_definitions")
    .select("*")
    .eq("event_id", event.id)
    .order("sort_order");

  return (
    <PublicEventPage
      event={event}
      categories={categories ?? []}
      templates={templates ?? []}
      fieldDefinitions={fieldDefinitions ?? []}
    />
  );
}
