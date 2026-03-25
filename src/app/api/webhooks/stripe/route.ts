import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPlanByPriceId } from "@/lib/stripe/plans";
import type Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orgId = session.metadata?.org_id;
      const planSlug = session.metadata?.plan_slug;

      if (!orgId || !planSlug) break;

      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );

      const priceId = subscription.items.data[0]?.price?.id;
      const plan = priceId ? getPlanByPriceId(priceId) : null;

      await supabase
        .from("organizations")
        .update({
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          plan: plan?.slug ?? planSlug,
          generations_limit: plan?.generations_limit ?? 500,
          billing_cycle_start: new Date().toISOString(),
        })
        .eq("id", orgId);

      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const priceId = subscription.items.data[0]?.price?.id;
      const plan = priceId ? getPlanByPriceId(priceId) : null;

      if (plan) {
        // Find org by stripe_subscription_id
        const { data: org } = await supabase
          .from("organizations")
          .select("id")
          .eq("stripe_subscription_id", subscription.id)
          .single();

        if (org) {
          await supabase
            .from("organizations")
            .update({
              plan: plan.slug,
              generations_limit: plan.generations_limit,
            })
            .eq("id", org.id);
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;

      const { data: org } = await supabase
        .from("organizations")
        .select("id")
        .eq("stripe_subscription_id", subscription.id)
        .single();

      if (org) {
        await supabase
          .from("organizations")
          .update({
            plan: "starter",
            generations_limit: 500,
            stripe_subscription_id: null,
          })
          .eq("id", org.id);
      }
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      // Reset generations count on successful payment
      const { data: org } = await supabase
        .from("organizations")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .single();

      if (org) {
        await supabase
          .from("organizations")
          .update({
            generations_used: 0,
            billing_cycle_start: new Date().toISOString(),
          })
          .eq("id", org.id);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
