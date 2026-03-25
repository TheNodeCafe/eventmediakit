"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
} from "@/hooks/use-categories";
import {
  useVariableFields,
  useCreateVariableField,
  useDeleteVariableField,
} from "@/hooks/use-variable-fields";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import type { FieldType } from "@/types";

export default function CategoriesPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = use(params);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/events/${eventId}`} className={buttonVariants({ variant: "ghost", size: "icon" })}>
            <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Configuration</h1>
          <p className="text-muted-foreground">
            Catégories de participants et champs variables
          </p>
        </div>
      </div>

      <Tabs defaultValue="categories">
        <TabsList>
          <TabsTrigger value="categories">Catégories</TabsTrigger>
          <TabsTrigger value="fields">Champs variables</TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          <CategoriesTab eventId={eventId} />
        </TabsContent>

        <TabsContent value="fields">
          <VariableFieldsTab eventId={eventId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CategoriesTab({ eventId }: { eventId: string }) {
  const [name, setName] = useState("");
  const { data: categories, isLoading } = useCategories(eventId);
  const createCategory = useCreateCategory(eventId);
  const deleteCategory = useDeleteCategory(eventId);

  async function handleAdd() {
    if (!name.trim()) return;
    await createCategory.mutateAsync(name.trim());
    setName("");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Catégories de participants</CardTitle>
        <CardDescription>
          Définissez les types de participants (Exposant, Speaker, Visiteur...)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Nom de la catégorie"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <Button onClick={handleAdd} disabled={createCategory.isPending}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-muted" />
            ))}
          </div>
        ) : categories?.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Aucune catégorie. Ajoutez-en une pour commencer.
          </p>
        ) : (
          <div className="space-y-2">
            {categories?.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between rounded-md border px-4 py-2"
              >
                <span className="font-medium">{cat.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteCategory.mutate(cat.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function VariableFieldsTab({ eventId }: { eventId: string }) {
  const [name, setName] = useState("");
  const [label, setLabel] = useState("");
  const [fieldType, setFieldType] = useState<FieldType>("text");
  const [required, setRequired] = useState(false);

  const { data: fields, isLoading } = useVariableFields(eventId);
  const createField = useCreateVariableField(eventId);
  const deleteField = useDeleteVariableField(eventId);

  async function handleAdd() {
    if (!name.trim() || !label.trim()) return;
    await createField.mutateAsync({
      name: name.trim().toLowerCase().replace(/\s+/g, "_"),
      label: label.trim(),
      field_type: fieldType,
      required,
    });
    setName("");
    setLabel("");
    setFieldType("text");
    setRequired(false);
  }

  const fieldTypeLabels: Record<FieldType, string> = {
    text: "Texte",
    textarea: "Texte long",
    image: "Image",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Champs variables</CardTitle>
        <CardDescription>
          Définissez les champs que les participants pourront remplir (max 10)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {(fields?.length ?? 0) < 10 && (
          <div className="grid gap-3 rounded-md border p-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Clé interne</Label>
                <Input
                  placeholder="first_name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Label affiché</Label>
                <Input
                  placeholder="Prénom"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Type</Label>
                <Select
                  value={fieldType}
                  onValueChange={(v) => setFieldType(v as FieldType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Texte</SelectItem>
                    <SelectItem value="textarea">Texte long</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={required}
                    onChange={(e) => setRequired(e.target.checked)}
                  />
                  Obligatoire
                </label>
              </div>
            </div>
            <Button
              onClick={handleAdd}
              disabled={createField.isPending}
              className="w-fit"
            >
              <Plus className="mr-2 h-4 w-4" />
              Ajouter le champ
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-muted" />
            ))}
          </div>
        ) : fields?.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Aucun champ variable. Ajoutez-en pour personnaliser vos templates.
          </p>
        ) : (
          <div className="space-y-2">
            {fields?.map((field) => (
              <div
                key={field.id}
                className="flex items-center justify-between rounded-md border px-4 py-2"
              >
                <div>
                  <span className="font-medium">{field.label}</span>
                  <span className="ml-2 text-sm text-muted-foreground">
                    ({field.name}) - {fieldTypeLabels[field.field_type]}
                    {field.required && " *"}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteField.mutate(field.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
