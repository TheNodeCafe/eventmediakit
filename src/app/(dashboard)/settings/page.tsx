"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n/context";
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

type TabId = "org" | "account" | "security" | "danger";

export default function SettingsPage() {
  const { data, isLoading } = useOrganization();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<TabId>("org");

  const tabs = [
    { id: "org" as const, label: t("settings", "tabOrg"), icon: Building2 },
    { id: "account" as const, label: t("settings", "tabAccount"), icon: User },
    { id: "security" as const, label: t("settings", "tabSecurity"), icon: Lock },
    { id: "danger" as const, label: t("settings", "tabDanger"), icon: Trash2 },
  ];

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

  const deleteKeyword = t("settings", "deleteConfirm");

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
      setPwMessage({ type: "error", text: t("settings", "passwordMismatch") });
      return;
    }
    if (newPassword.length < 6) {
      setPwMessage({ type: "error", text: t("settings", "minChars") });
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
      setPwMessage({ type: "success", text: t("settings", "changed") });
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setPwMessage({ type: "error", text: result.error || "Error" });
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== deleteKeyword) return;
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
        <h1 className="text-[22px] font-bold tracking-tight">{t("settings", "title")}</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">{t("settings", "subtitle")}</p>
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
                  {orgLogo ? t("settings", "change") : t("settings", "logo")}
                </Button>
                {orgLogo && (
                  <button onClick={() => setOrgLogo(null)} className="text-[11px] text-muted-foreground hover:text-destructive">
                    {t("settings", "remove")}
                  </button>
                )}
              </div>

              {/* Fields */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-[12px] font-medium">{t("settings", "orgName")}</Label>
                  <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} className="h-9 rounded-lg text-[13px]" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] font-medium">{t("settings", "identifier")}</Label>
                  <Input value={(data?.organization?.slug as string) ?? ""} disabled className="h-9 rounded-lg bg-muted/50 text-[13px]" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] font-medium">{t("settings", "currentPlan")}</Label>
                  <Input
                    value={((data?.organization?.plan as string) ?? "starter").charAt(0).toUpperCase() + ((data?.organization?.plan as string) ?? "starter").slice(1)}
                    disabled
                    className="h-9 rounded-lg bg-muted/50 text-[13px]"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleSaveOrg} disabled={orgSaving} className="h-9 rounded-lg text-[12px]">
                    {orgSaved ? <><CheckCircle className="mr-1.5 h-3.5 w-3.5" />{t("settings", "saved")}</> : <><Save className="mr-1.5 h-3.5 w-3.5" />{orgSaving ? t("settings", "saving") : t("settings", "save")}</>}
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
                <Label className="text-[12px] font-medium">{t("settings", "email")}</Label>
                <Input value={data?.user?.email ?? ""} disabled className="h-9 rounded-lg bg-muted/50 text-[13px]" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] font-medium">{t("settings", "role")}</Label>
                <Input
                  value={data?.role === "owner" ? t("settings", "owner") : data?.role === "admin" ? t("settings", "admin") : t("settings", "member")}
                  disabled
                  className="h-9 rounded-lg bg-muted/50 text-[13px]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] font-medium">{t("settings", "userId")}</Label>
                <Input value={data?.user?.id ?? ""} disabled className="h-9 rounded-lg bg-muted/50 font-mono text-[11px]" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] font-medium">{t("settings", "orgId")}</Label>
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
                <Label className="text-[12px] font-medium">{t("settings", "newPassword")}</Label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder={t("settings", "minChars")} className="h-9 rounded-lg text-[13px]" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] font-medium">{t("settings", "confirmPassword")}</Label>
                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder={t("settings", "retypePassword")} className="h-9 rounded-lg text-[13px]" />
              </div>
            </div>
            <Button onClick={handleChangePassword} disabled={pwSaving || !newPassword || !confirmPassword} variant="outline" className="h-9 rounded-lg text-[12px]">
              <Lock className="mr-1.5 h-3.5 w-3.5" />
              {pwSaving ? t("settings", "changing") : t("settings", "changePassword")}
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
                <h3 className="text-[14px] font-semibold">{t("settings", "dangerTitle")}</h3>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  {t("settings", "dangerDesc")}
                </p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-[12px] font-medium">
                  {t("settings", "typeDeletePrompt")} <span className="font-mono font-bold text-destructive">{deleteKeyword}</span> {t("settings", "typeDeleteConfirm")}
                </Label>
                <Input value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} placeholder={deleteKeyword} className="h-9 rounded-lg text-[13px]" />
              </div>
              <div className="flex items-end">
                <Button variant="destructive" disabled={deleteConfirm !== deleteKeyword} onClick={handleDeleteAccount} className="h-9 rounded-lg text-[12px]">
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  {t("settings", "deleteAccount")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
