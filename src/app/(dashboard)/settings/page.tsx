"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
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
import { cn } from "@/lib/utils";

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

const tabs = [
  { id: "org", label: "Organisation", icon: Building2 },
  { id: "account", label: "Compte", icon: User },
  { id: "security", label: "Sécurité", icon: Lock },
  { id: "danger", label: "Danger", icon: Trash2 },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function SettingsPage() {
  const { data, isLoading } = useOrganization();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("org");

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

  // Delete
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
      setPwMessage({ type: "error", text: "Minimum 6 caractères" });
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
      setPwMessage({ type: "success", text: "Mot de passe modifié" });
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
      <div className="mx-auto max-w-3xl">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-[22px] font-bold tracking-tight">Paramètres</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">Gérez votre organisation et votre compte</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl bg-muted/50 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium transition-all",
              activeTab === tab.id
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className={cn("h-4 w-4", tab.id === "danger" && activeTab === tab.id && "text-destructive")} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "org" && (
        <Card className="border-border/40 shadow-sm">
          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-[auto,1fr]">
              {/* Logo */}
              <div className="flex flex-col items-center gap-2">
                {orgLogo ? (
                  <img src={orgLogo} alt="Logo" className="h-20 w-20 rounded-xl border object-contain" />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-xl border bg-muted">
                    <Sparkles className="h-7 w-7 text-muted-foreground" />
                  </div>
                )}
                <Button variant="outline" size="sm" onClick={handleLogoUpload} className="text-[11px]">
                  <ImageIcon className="mr-1 h-3 w-3" />
                  {orgLogo ? "Changer" : "Logo"}
                </Button>
                {orgLogo && (
                  <button onClick={() => setOrgLogo(null)} className="text-[11px] text-muted-foreground hover:text-destructive">
                    Retirer
                  </button>
                )}
              </div>

              {/* Fields */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-[12px] font-medium">Nom de l&apos;organisation</Label>
                  <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} className="h-9 rounded-lg text-[13px]" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] font-medium">Identifiant</Label>
                  <Input value={(data?.organization?.slug as string) ?? ""} disabled className="h-9 rounded-lg bg-muted/50 text-[13px]" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] font-medium">Plan actuel</Label>
                  <Input
                    value={((data?.organization?.plan as string) ?? "starter").charAt(0).toUpperCase() + ((data?.organization?.plan as string) ?? "starter").slice(1)}
                    disabled
                    className="h-9 rounded-lg bg-muted/50 text-[13px]"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleSaveOrg} disabled={orgSaving} className="h-9 rounded-lg text-[12px]">
                    {orgSaved ? <><CheckCircle className="mr-1.5 h-3.5 w-3.5" />Enregistré</> : <><Save className="mr-1.5 h-3.5 w-3.5" />{orgSaving ? "..." : "Enregistrer"}</>}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "account" && (
        <Card className="border-border/40 shadow-sm">
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-[12px] font-medium">Email</Label>
                <Input value={data?.user?.email ?? ""} disabled className="h-9 rounded-lg bg-muted/50 text-[13px]" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] font-medium">Rôle</Label>
                <Input
                  value={data?.role === "owner" ? "Propriétaire" : data?.role === "admin" ? "Administrateur" : "Membre"}
                  disabled
                  className="h-9 rounded-lg bg-muted/50 text-[13px]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] font-medium">ID utilisateur</Label>
                <Input value={data?.user?.id ?? ""} disabled className="h-9 rounded-lg bg-muted/50 font-mono text-[11px]" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] font-medium">ID organisation</Label>
                <Input value={(data?.organization?.id as string) ?? ""} disabled className="h-9 rounded-lg bg-muted/50 font-mono text-[11px]" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "security" && (
        <Card className="border-border/40 shadow-sm">
          <CardContent className="p-6 space-y-4">
            {pwMessage && (
              <div className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2.5 text-[13px] font-medium",
                pwMessage.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-destructive/10 text-destructive"
              )}>
                {pwMessage.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                {pwMessage.text}
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-[12px] font-medium">Nouveau mot de passe</Label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimum 6 caractères" className="h-9 rounded-lg text-[13px]" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] font-medium">Confirmer</Label>
                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Retapez le mot de passe" className="h-9 rounded-lg text-[13px]" />
              </div>
            </div>
            <Button onClick={handleChangePassword} disabled={pwSaving || !newPassword || !confirmPassword} variant="outline" className="h-9 rounded-lg text-[12px]">
              <Lock className="mr-1.5 h-3.5 w-3.5" />
              {pwSaving ? "Modification..." : "Modifier le mot de passe"}
            </Button>
          </CardContent>
        </Card>
      )}

      {activeTab === "danger" && (
        <Card className="border-destructive/20 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <h3 className="text-[14px] font-semibold">Supprimer le compte</h3>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  Cette action est irréversible. Tous vos événements, templates et données seront définitivement supprimés.
                </p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-[12px] font-medium">
                  Tapez <span className="font-mono font-bold text-destructive">SUPPRIMER</span> pour confirmer
                </Label>
                <Input value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} placeholder="SUPPRIMER" className="h-9 rounded-lg text-[13px]" />
              </div>
              <div className="flex items-end">
                <Button variant="destructive" disabled={deleteConfirm !== "SUPPRIMER"} onClick={handleDeleteAccount} className="h-9 rounded-lg text-[12px]">
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Supprimer mon compte
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
