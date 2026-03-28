"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { TemplateEditor } from "@/components/features/editor/template-editor";
import { StarterTemplatesDialog } from "@/components/features/editor/starter-templates-dialog";
import { useCreateTemplate } from "@/hooks/use-templates";
import { useVariableFields } from "@/hooks/use-variable-fields";
import { useCategories } from "@/hooks/use-categories";
import { useEditorStore } from "@/store/editor-store";
import { extractFontsFromCanvasJson, loadMultipleFonts } from "@/lib/fonts/google-fonts";
import type { StarterTemplate } from "@/lib/templates/starter-templates";

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

  const [showStarter, setShowStarter] = useState(true);
  const [initialJson, setInitialJson] = useState<Record<string, unknown> | undefined>(undefined);

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

  function handleStarterSelect(template: StarterTemplate | null) {
    if (template) {
      // Set format from template
      useEditorStore.getState().setFormat(
        template.format,
        template.width,
        template.height
      );
      setInitialJson(template.canvas_json);

      // Pre-load fonts used in the starter template
      const fonts = extractFontsFromCanvasJson(template.canvas_json);
      if (fonts.length > 0) loadMultipleFonts(fonts);
    }
    setShowStarter(false);
  }

  return (
    <>
      <StarterTemplatesDialog
        open={showStarter}
        onSelect={handleStarterSelect}
      />
      {!showStarter && (
        <TemplateEditor
          eventId={eventId}
          initialJson={initialJson}
          variableFields={variableFields ?? []}
          categories={categories ?? []}
          onSave={handleSave}
        />
      )}
    </>
  );
}
