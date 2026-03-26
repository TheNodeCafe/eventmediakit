"use client";

import { use } from "react";
import { TemplateEditor } from "@/components/features/editor/template-editor";
import { useTemplate, useUpdateTemplate, useTemplates } from "@/hooks/use-templates";
import { useVariableFields } from "@/hooks/use-variable-fields";
import { useCategories } from "@/hooks/use-categories";
import { useEditorStore } from "@/store/editor-store";
import { FORMAT_PRESETS } from "@/lib/fabric/format-presets";
import type { TemplateFormat } from "@/types";
import { useEffect } from "react";

export default function EditTemplateEditorPage({
  params,
}: {
  params: Promise<{ eventId: string; templateId: string }>;
}) {
  const { eventId, templateId } = use(params);
  const { data: template, isLoading } = useTemplate(templateId);
  const { data: templates } = useTemplates(eventId);
  const updateTemplate = useUpdateTemplate(templateId, eventId);
  const { data: variableFields } = useVariableFields(eventId);
  const { data: categories } = useCategories(eventId);
  const { setFormat } = useEditorStore();

  // Get current category associations
  const currentTemplate = templates?.find((t) => t.id === templateId);
  const initialCategoryIds = currentTemplate?.template_categories?.map((tc) => tc.category_id) ?? [];

  useEffect(() => {
    if (template) {
      const preset = FORMAT_PRESETS[template.format as TemplateFormat];
      if (preset) {
        setFormat(template.format as TemplateFormat, template.width, template.height);
      }
    }
  }, [template, setFormat]);

  if (isLoading || !template) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Chargement de l&apos;éditeur...</p>
      </div>
    );
  }

  async function handleSave(data: {
    name: string;
    canvas_json: Record<string, unknown>;
    format: string;
    width: number;
    height: number;
    category_ids?: string[];
  }) {
    await updateTemplate.mutateAsync(data);
  }

  return (
    <TemplateEditor
      templateId={templateId}
      eventId={eventId}
      initialName={template.name}
      initialJson={template.canvas_json}
      variableFields={variableFields ?? []}
      categories={categories ?? []}
      initialCategoryIds={initialCategoryIds}
      onSave={handleSave}
    />
  );
}
