"use client";

import { use, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Papa from "papaparse";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Upload, FileSpreadsheet } from "lucide-react";
import { useCategories } from "@/hooks/use-categories";
import { useBulkCreateParticipants } from "@/hooks/use-participants";

interface CsvRow {
  [key: string]: string;
}

export default function ImportPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = use(params);
  const router = useRouter();
  const { data: categories } = useCategories(eventId);
  const bulkCreate = useBulkCreateParticipants(eventId);

  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [emailColumn, setEmailColumn] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [fileName, setFileName] = useState("");

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvData(results.data);
        if (results.meta.fields) {
          setHeaders(results.meta.fields);
          // Auto-detect email column
          const emailField = results.meta.fields.find(
            (f) =>
              f.toLowerCase().includes("email") ||
              f.toLowerCase().includes("mail")
          );
          if (emailField) setEmailColumn(emailField);
        }
      },
    });
  }, []);

  async function handleImport() {
    if (!emailColumn || !categoryId || !csvData.length) return;

    const participants = csvData
      .map((row) => ({
        email: row[emailColumn]?.trim(),
        category_id: categoryId,
      }))
      .filter((p) => p.email && p.email.includes("@"));

    await bulkCreate.mutateAsync(participants);
    router.push(`/events/${eventId}/participants`);
  }

  const previewRows = csvData.slice(0, 5);
  const validEmails = emailColumn
    ? csvData.filter(
        (row) => row[emailColumn]?.trim() && row[emailColumn].includes("@")
      ).length
    : 0;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/events/${eventId}/participants`}
          className={buttonVariants({ variant: "ghost", size: "icon" })}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Import CSV</h1>
          <p className="text-muted-foreground">
            Importez vos participants depuis un fichier CSV
          </p>
        </div>
      </div>

      {/* Step 1: Upload */}
      <Card>
        <CardHeader>
          <CardTitle>1. Sélectionnez votre fichier</CardTitle>
          <CardDescription>
            Le fichier doit contenir au moins une colonne avec les emails
          </CardDescription>
        </CardHeader>
        <CardContent>
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors hover:border-primary/50 hover:bg-muted/50">
            <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
            <span className="text-sm font-medium">
              {fileName || "Cliquez pour sélectionner un fichier CSV"}
            </span>
            {fileName && (
              <span className="mt-1 text-xs text-muted-foreground">
                {csvData.length} lignes trouvées
              </span>
            )}
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFile}
            />
          </label>
        </CardContent>
      </Card>

      {/* Step 2: Column mapping */}
      {headers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>2. Configuration</CardTitle>
            <CardDescription>
              Associez les colonnes et choisissez la catégorie
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Colonne email</Label>
                <Select
                  value={emailColumn}
                  onValueChange={(v) => setEmailColumn(v ?? "")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {headers.map((h) => (
                      <SelectItem key={h} value={h}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Catégorie</Label>
                <Select
                  value={categoryId}
                  onValueChange={(v) => setCategoryId(v ?? "")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {emailColumn && (
              <p className="text-sm text-muted-foreground">
                {validEmails} emails valides sur {csvData.length} lignes
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Preview */}
      {previewRows.length > 0 && emailColumn && (
        <Card>
          <CardHeader>
            <CardTitle>3. Aperçu</CardTitle>
            <CardDescription>
              5 premières lignes de votre fichier
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  {headers.map((h) => (
                    <TableHead
                      key={h}
                      className={h === emailColumn ? "font-bold text-primary" : ""}
                    >
                      {h}
                      {h === emailColumn && " (email)"}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewRows.map((row, i) => (
                  <TableRow key={i}>
                    {headers.map((h) => (
                      <TableCell key={h}>{row[h]}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Import button */}
      {emailColumn && categoryId && csvData.length > 0 && (
        <div className="flex justify-end">
          <Button
            onClick={handleImport}
            disabled={bulkCreate.isPending || validEmails === 0}
            size="lg"
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            {bulkCreate.isPending
              ? "Import en cours..."
              : `Importer ${validEmails} participant(s)`}
          </Button>
        </div>
      )}
    </div>
  );
}
