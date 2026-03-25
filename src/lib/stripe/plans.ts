export interface PlanConfig {
  name: string;
  slug: string;
  generations_limit: number;
  max_events: number | null;
  white_label: boolean;
  price_eur: number;
  stripe_price_id: string;
}

export const PLANS: Record<string, PlanConfig> = {
  starter: {
    name: "Starter",
    slug: "starter",
    generations_limit: 500,
    max_events: 1,
    white_label: false,
    price_eur: 49,
    stripe_price_id: process.env.STRIPE_PRICE_STARTER ?? "",
  },
  growth: {
    name: "Growth",
    slug: "growth",
    generations_limit: 2000,
    max_events: 5,
    white_label: true,
    price_eur: 149,
    stripe_price_id: process.env.STRIPE_PRICE_GROWTH ?? "",
  },
  pro: {
    name: "Pro",
    slug: "pro",
    generations_limit: 10000,
    max_events: null,
    white_label: true,
    price_eur: 349,
    stripe_price_id: process.env.STRIPE_PRICE_PRO ?? "",
  },
  enterprise: {
    name: "Enterprise",
    slug: "enterprise",
    generations_limit: 999999,
    max_events: null,
    white_label: true,
    price_eur: 0,
    stripe_price_id: "",
  },
};

export function getPlanByPriceId(priceId: string): PlanConfig | undefined {
  return Object.values(PLANS).find((p) => p.stripe_price_id === priceId);
}
