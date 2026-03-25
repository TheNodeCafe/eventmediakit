"use client";

import { use } from "react";
import { TemplateEditor } from "@/components/features/editor/template-editor";
import { useTemplate, useUpdateTemplate } from "@/hooks/use-templates";
import { useVariableFields } from "@/hooks/use-variable-fields";
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
  const updateTemplate = useUpdateTemplate(templateId, eventId);
  const { data: variableFields } = useVariableFields(eventId);
  const { setFormat } = useEditorStore();

  // Set the format from the loaded template
  useEffect(() => {
    if (template) {
      const preset = FORMAT_PRESETS[template.format as TemplateFormat];
      if (preset) {
        setFormat(
          template.format as TemplateFormat,
          template.width,
          template.height
        );
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
      onSave={handleSave}
    />
  );
}
