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
import { Check, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    slug: "starter",
    name: "Starter",
    price: "49",
    generations: "500",
    events: "1",
    whiteLabel: false,
    description: "Pour démarrer avec un premier événement",
  },
  {
    slug: "growth",
    name: "Growth",
    price: "149",
    generations: "2 000",
    events: "5",
    whiteLabel: true,
    popular: true,
    description: "Pour les organisateurs en croissance",
  },
  {
    slug: "pro",
    name: "Pro",
    price: "349",
    generations: "10 000",
    events: "Illimité",
    whiteLabel: true,
    description: "Pour les pros avec des besoins avancés",
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
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-[22px] font-bold tracking-tight">Facturation</h1>
        <p className="mt-1 text-[14px] text-muted-foreground">
          Gérez votre abonnement et vos générations
        </p>
      </div>

      {/* Current usage */}
      <Card className="border-border/40 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[15px] font-semibold">Usage du mois</CardTitle>
              <CardDescription className="text-[13px]">
                {`Plan ${currentPlanName}`}
              </CardDescription>
            </div>
            <Badge
              variant={currentPlan === "starter" ? "secondary" : "default"}
              className="text-[11px] font-medium"
            >
              {currentPlanName}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="mb-2 flex justify-between text-[13px]">
              <span className="text-muted-foreground">Générations utilisées</span>
              <span className="font-semibold text-foreground">
                {used.toLocaleString("fr-FR")} / {limit.toLocaleString("fr-FR")}
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-muted/80">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  usagePercent > 90
                    ? "bg-destructive"
                    : usagePercent > 70
                      ? "bg-amber-500"
                      : "bg-primary"
                )}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </div>

          {!!(org?.stripe_customer_id) && (
            <Button
              variant="outline"
              onClick={handlePortal}
              disabled={loading === "portal"}
              className="rounded-lg text-[13px] font-medium h-9 border-border/60"
            >
              {loading === "portal"
                ? "Redirection..."
                : "Gérer mon abonnement"}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Plans */}
      <div>
        <h2 className="mb-1 text-[16px] font-semibold tracking-tight">Plans disponibles</h2>
        <p className="mb-5 text-[13px] text-muted-foreground">
          Choisissez le plan adapté à vos besoins
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => {
            const isCurrent = plan.slug === currentPlan;
            const isPopular = "popular" in plan && plan.popular;
            return (
              <Card
                key={plan.slug}
                className={cn(
                  "relative border-border/40 shadow-sm transition-all duration-200 hover:shadow-md",
                  isCurrent && "border-primary/50 shadow-primary/5",
                  isPopular && !isCurrent && "border-primary/30"
                )}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="gap-1 rounded-full bg-primary px-3 py-0.5 text-[11px] font-semibold shadow-md shadow-primary/20">
                      <Zap className="h-3 w-3" />
                      Populaire
                    </Badge>
                  </div>
                )}
                <CardHeader className={cn("pb-3", isPopular && "pt-8")}>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[15px] font-semibold">{plan.name}</CardTitle>
                    {isCurrent && (
                      <Badge variant="secondary" className="text-[10px] font-medium">
                        Actuel
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-[12px]">
                    {plan.description}
                  </CardDescription>
                  <div className="pt-2">
                    <span className="text-3xl font-bold tracking-tight text-foreground">
                      {plan.price}€
                    </span>
                    <span className="text-[13px] text-muted-foreground">/mois</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2.5">
                    <li className="flex items-center gap-2.5 text-[13px]">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <span>{plan.generations} générations/mois</span>
                    </li>
                    <li className="flex items-center gap-2.5 text-[13px]">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <span>{plan.events} événement(s)</span>
                    </li>
                    {plan.whiteLabel && (
                      <li className="flex items-center gap-2.5 text-[13px]">
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <Check className="h-3 w-3 text-primary" />
                        </div>
                        <span>White label</span>
                      </li>
                    )}
                  </ul>

                  {!isCurrent && (
                    <Button
                      className={cn(
                        "w-full rounded-lg h-10 text-[13px] font-semibold",
                        isPopular
                          ? "shadow-md shadow-primary/20"
                          : ""
                      )}
                      variant={isPopular ? "default" : "outline"}
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
