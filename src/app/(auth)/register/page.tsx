"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
      <div>
        <h1 className="text-2xl font-bold text-foreground">Créer un compte</h1>
        <p className="mt-1 text-muted-foreground">
          Commencez à créer vos kits média en quelques minutes
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="orgName">Nom de votre organisation</Label>
          <Input
            id="orgName"
            placeholder="Mon Salon 2026"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            required
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="vous@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            type="password"
            placeholder="Minimum 6 caractères"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="h-11"
          />
        </div>
        <Button type="submit" className="h-11 w-full text-base" disabled={loading}>
          {loading ? "Création..." : "Créer mon compte"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Déjà un compte ?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
