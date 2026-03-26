"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { TemplateEditor } from "@/components/features/editor/template-editor";
import { useCreateTemplate } from "@/hooks/use-templates";
import { useVariableFields } from "@/hooks/use-variable-fields";
import { useCategories } from "@/hooks/use-categories";

export default function NewTemplateEditorPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = use(params);
  const router = useRouter();
  const createTemplate = useCreateTemplate(eventId);
  const { data: variableFields } = useVariableFields(eventId);
  const { data: categories } = useCategories(eventId);

  async function handleSave(data: {
    name: string;
    canvas_json: Record<string, unknown>;
    format: string;
    width: number;
    height: number;
    category_ids?: string[];
  }) {
    const template = await createTemplate.mutateAsync(data);
    router.replace(`/events/${eventId}/templates/${template.id}/editor`);
  }

  return (
    <TemplateEditor
      eventId={eventId}
      variableFields={variableFields ?? []}
      categories={categories ?? []}
      onSave={handleSave}
    />
  );
}
