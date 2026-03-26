"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
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
  Building2,
  User,
  Lock,
  Save,
  ImageIcon,
  Sparkles,
  Trash2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

function useOrganization() {
  return useQuery({
    queryKey: ["organization-settings"],
    queryFn: async () => {
      const res = await fetch("/api/organization");
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
      return result.data as {
        organization: Record<string, unknown>;
        role: string;
        user: { id: string; email: string };
      };
    },
  });
}

export default function SettingsPage() {
  const { data, isLoading } = useOrganization();
  const queryClient = useQueryClient();
  const router = useRouter();

  // Org form
  const [orgName, setOrgName] = useState("");
  const [orgLogo, setOrgLogo] = useState<string | null>(null);
  const [orgSaving, setOrgSaving] = useState(false);
  const [orgSaved, setOrgSaved] = useState(false);

  // Password form
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMessage, setPwMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Delete account
  const [deleteConfirm, setDeleteConfirm] = useState("");

  useEffect(() => {
    if (data?.organization) {
      setOrgName((data.organization.name as string) ?? "");
      setOrgLogo((data.organization.logo_url as string) ?? null);
    }
  }, [data]);

  async function handleSaveOrg() {
    setOrgSaving(true);
    setOrgSaved(false);
    await fetch("/api/organization", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: orgName, logo_url: orgLogo }),
    });
    queryClient.invalidateQueries({ queryKey: ["organization-settings"] });
    queryClient.invalidateQueries({ queryKey: ["events"] });
    setOrgSaving(false);
    setOrgSaved(true);
    setTimeout(() => setOrgSaved(false), 3000);
  }

  async function handleChangePassword() {
    setPwMessage(null);
    if (newPassword !== confirmPassword) {
      setPwMessage({ type: "error", text: "Les mots de passe ne correspondent pas" });
      return;
    }
    if (newPassword.length < 6) {
      setPwMessage({ type: "error", text: "Le mot de passe doit faire au moins 6 caractères" });
      return;
    }
    setPwSaving(true);
    const res = await fetch("/api/auth/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPassword }),
    });
    const result = await res.json();
    setPwSaving(false);
    if (result.success) {
      setPwMessage({ type: "success", text: "Mot de passe modifié avec succès" });
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setPwMessage({ type: "error", text: result.error || "Erreur" });
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== "SUPPRIMER") return;
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  function handleLogoUpload() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => setOrgLogo(reader.result as string);
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader><div className="h-5 w-32 rounded bg-muted" /></CardHeader>
            <CardContent><div className="h-10 rounded bg-muted/50" /></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-[22px] font-bold tracking-tight">Paramètres</h1>
        <p className="mt-1 text-[14px] text-muted-foreground">
          Gérez votre organisation et votre compte
        </p>
      </div>

      {/* Organisation */}
      <Card className="border-border/40 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            <CardTitle className="text-[15px] font-semibold">Organisation</CardTitle>
          </div>
          <CardDescription className="text-[13px]">
            Informations de votre organisation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            {orgLogo ? (
              <img
                src={orgLogo}
                alt="Logo"
                className="h-16 w-16 rounded-xl border object-contain"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-xl border bg-muted">
                <Sparkles className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Button variant="outline" size="sm" onClick={handleLogoUpload}>
                <ImageIcon className="mr-1.5 h-3.5 w-3.5" />
                {orgLogo ? "Changer le logo" : "Ajouter un logo"}
              </Button>
              {orgLogo && (
                <Button variant="ghost" size="sm" onClick={() => setOrgLogo(null)}>
                  Retirer
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[13px] font-medium">Nom de l&apos;organisation</Label>
            <Input
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="h-10 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[13px] font-medium">Identifiant</Label>
            <Input
              value={(data?.organization?.slug as string) ?? ""}
              disabled
              className="h-10 rounded-lg bg-muted/50 text-muted-foreground"
            />
            <p className="text-[11px] text-muted-foreground">
              Généré automatiquement, non modifiable
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-[13px] font-medium">Plan actuel</Label>
            <Input
              value={((data?.organization?.plan as string) ?? "starter").charAt(0).toUpperCase() + ((data?.organization?.plan as string) ?? "starter").slice(1)}
              disabled
              className="h-10 rounded-lg bg-muted/50 text-muted-foreground"
            />
          </div>

          <Button onClick={handleSaveOrg} disabled={orgSaving} className="rounded-lg">
            {orgSaved ? (
              <>
                <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                Enregistré
              </>
            ) : (
              <>
                <Save className="mr-1.5 h-3.5 w-3.5" />
                {orgSaving ? "Enregistrement..." : "Enregistrer"}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Compte */}
      <Card className="border-border/40 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <CardTitle className="text-[15px] font-semibold">Compte</CardTitle>
          </div>
          <CardDescription className="text-[13px]">
            Informations de votre compte utilisateur
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[13px] font-medium">Email</Label>
            <Input
              value={data?.user?.email ?? ""}
              disabled
              className="h-10 rounded-lg bg-muted/50 text-muted-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[13px] font-medium">Rôle</Label>
            <Input
              value={data?.role === "owner" ? "Propriétaire" : data?.role === "admin" ? "Administrateur" : "Membre"}
              disabled
              className="h-10 rounded-lg bg-muted/50 text-muted-foreground"
            />
          </div>
        </CardContent>
      </Card>

      {/* Mot de passe */}
      <Card className="border-border/40 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" />
            <CardTitle className="text-[15px] font-semibold">Changer le mot de passe</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {pwMessage && (
            <div
              className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium ${
                pwMessage.type === "success"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {pwMessage.type === "success" ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              {pwMessage.text}
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-[13px] font-medium">Nouveau mot de passe</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 6 caractères"
              className="h-10 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[13px] font-medium">Confirmer le mot de passe</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Retapez le mot de passe"
              className="h-10 rounded-lg"
            />
          </div>

          <Button
            onClick={handleChangePassword}
            disabled={pwSaving || !newPassword || !confirmPassword}
            variant="outline"
            className="rounded-lg"
          >
            <Lock className="mr-1.5 h-3.5 w-3.5" />
            {pwSaving ? "Modification..." : "Modifier le mot de passe"}
          </Button>
        </CardContent>
      </Card>

      {/* Zone danger */}
      <Card className="border-destructive/20 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-destructive" />
            <CardTitle className="text-[15px] font-semibold text-destructive">Zone dangereuse</CardTitle>
          </div>
          <CardDescription className="text-[13px]">
            Actions irréversibles sur votre compte
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-[13px] text-muted-foreground">
            La suppression de votre compte est définitive. Tous vos événements, templates et données seront perdus.
          </p>
          <div className="space-y-2">
            <Label className="text-[13px] font-medium">
              Tapez <span className="font-mono font-bold text-destructive">SUPPRIMER</span> pour confirmer
            </Label>
            <Input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="SUPPRIMER"
              className="h-10 rounded-lg"
            />
          </div>
          <Button
            variant="destructive"
            disabled={deleteConfirm !== "SUPPRIMER"}
            onClick={handleDeleteAccount}
            className="rounded-lg"
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Supprimer mon compte
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
