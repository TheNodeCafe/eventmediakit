"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, org_name: orgName }),
      });

      const result = await res.json();

      if (!result.success) {
        setError(result.error || "Erreur lors de la création du compte");
        setLoading(false);
        return;
      }

      const supabase = createClient();
      await supabase.auth.signInWithPassword({ email, password });

      router.push("/events");
      router.refresh();
    } catch {
      setError("Erreur lors de la création du compte");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Mobile logo */}
      <div className="flex items-center gap-2.5 lg:hidden">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/20">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <span className="text-lg font-semibold tracking-tight">EventMediaKit</span>
      </div>

      <div>
        <h1 className="text-[28px] font-bold tracking-tight text-foreground">Créer un compte</h1>
        <p className="mt-2 text-[15px] text-muted-foreground">
          Commencez à créer vos kits média en quelques minutes
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-destructive/8 px-4 py-3 text-sm font-medium text-destructive">
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 10.5a.75.75 0 110-1.5.75.75 0 010 1.5zM8.75 4.75a.75.75 0 00-1.5 0v3.5a.75.75 0 001.5 0v-3.5z" />
            </svg>
            {error}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="orgName" className="text-sm font-medium">Nom de votre organisation</Label>
          <Input
            id="orgName"
            placeholder="Mon Salon 2026"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            required
            className="h-11 rounded-xl bg-muted/40 border-border/60 px-4 text-[15px] transition-colors focus:bg-white focus:border-primary/40"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="vous@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-11 rounded-xl bg-muted/40 border-border/60 px-4 text-[15px] transition-colors focus:bg-white focus:border-primary/40"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">Mot de passe</Label>
          <Input
            id="password"
            type="password"
            placeholder="Minimum 6 caractères"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="h-11 rounded-xl bg-muted/40 border-border/60 px-4 text-[15px] transition-colors focus:bg-white focus:border-primary/40"
          />
          <p className="text-xs text-muted-foreground/70">Au moins 6 caractères</p>
        </div>
        <Button
          type="submit"
          className="h-11 w-full rounded-xl text-[15px] font-semibold shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/25"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Création...
            </span>
          ) : (
            "Créer mon compte"
          )}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/40" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-muted-foreground/60">ou</span>
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Déjà un compte ?{" "}
        <Link href="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
