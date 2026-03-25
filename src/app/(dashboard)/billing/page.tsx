"use client";

import { useState } from "react";
import { useOrg } from "@/hooks/use-org";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check } from "lucide-react";

const plans = [
  {
    slug: "starter",
    name: "Starter",
    price: "49",
    generations: "500",
    events: "1",
    whiteLabel: false,
  },
  {
    slug: "growth",
    name: "Growth",
    price: "149",
    generations: "2 000",
    events: "5",
    whiteLabel: true,
  },
  {
    slug: "pro",
    name: "Pro",
    price: "349",
    generations: "10 000",
    events: "Illimité",
    whiteLabel: true,
  },
];

export default function BillingPage() {
  const { data: org } = useOrg();
  const [loading, setLoading] = useState<string | null>(null);

  const currentPlan = (org?.plan as string) ?? "starter";
  const currentPlanName = plans.find((p) => p.slug === currentPlan)?.name ?? currentPlan;
  const used = (org?.generations_used as number) ?? 0;
  const limit = (org?.generations_limit as number) ?? 500;
  const usagePercent = Math.min((used / limit) * 100, 100);

  async function handleCheckout(planSlug: string) {
    setLoading(planSlug);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_slug: planSlug }),
      });
      const data = await res.json();
      if (data.success && data.data.url) {
        window.location.href = data.data.url;
      }
    } finally {
      setLoading(null);
    }
  }

  async function handlePortal() {
    setLoading("portal");
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (data.success && data.data.url) {
        window.location.href = data.data.url;
      }
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Facturation</h1>
        <p className="text-muted-foreground">
          Gérez votre abonnement et vos générations
        </p>
      </div>

      {/* Current usage */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Usage du mois</CardTitle>
              <CardDescription>
                {`Plan ${currentPlanName}`}
              </CardDescription>
            </div>
            <Badge variant={currentPlan === "starter" ? "secondary" : "default"}>
              {currentPlanName}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span>Générations utilisées</span>
              <span>
                {used.toLocaleString("fr-FR")} / {limit.toLocaleString("fr-FR")}
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </div>

          {!!(org?.stripe_customer_id) && (
            <Button
              variant="outline"
              onClick={handlePortal}
              disabled={loading === "portal"}
            >
              {loading === "portal"
                ? "Redirection..."
                : "Gérer mon abonnement"}
            </Button>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Plans */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Plans disponibles</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => {
            const isCurrent = plan.slug === currentPlan;
            return (
              <Card
                key={plan.slug}
                className={isCurrent ? "border-primary" : ""}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {plan.name}
                    {isCurrent && <Badge>Actuel</Badge>}
                  </CardTitle>
                  <CardDescription>
                    <span className="text-2xl font-bold text-foreground">
                      {plan.price}€
                    </span>
                    /mois
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      {plan.generations} générations/mois
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      {plan.events} événement(s)
                    </li>
                    {plan.whiteLabel && (
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        White label
                      </li>
                    )}
                  </ul>

                  {!isCurrent && (
                    <Button
                      className="w-full"
                      variant={plan.slug === "pro" ? "default" : "outline"}
                      onClick={() => handleCheckout(plan.slug)}
                      disabled={loading === plan.slug}
                    >
                      {loading === plan.slug
                        ? "Redirection..."
                        : "Choisir ce plan"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
