import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/client";
import { PLANS } from "@/lib/stripe/plans";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { plan_slug } = await request.json();
    const plan = PLANS[plan_slug];

    if (!plan || !plan.stripe_price_id) {
      return NextResponse.json(
        { success: false, error: "Invalid plan" },
        { status: 400 }
      );
    }

    // Get org
    const admin = createAdminClient();
    const { data: membership } = await admin
      .from("organization_members")
      .select("organization:organizations(*)")
      .eq("user_id", user.id)
      .single();

    if (!membership) {
      return NextResponse.json(
        { success: false, error: "No organization" },
        { status: 400 }
      );
    }

    const org = membership.organization as unknown as Record<string, unknown>;
    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        { success: false, error: "Stripe not configured" },
        { status: 503 }
      );
    }
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    // Create or retrieve Stripe customer
    let customerId = org.stripe_customer_id as string | null;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          org_id: org.id as string,
          org_name: org.name as string,
        },
      });
      customerId = customer.id;

      await admin
        .from("organizations")
        .update({ stripe_customer_id: customerId })
        .eq("id", org.id as string);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: plan.stripe_price_id, quantity: 1 }],
      success_url: `${appUrl}/billing?success=true`,
      cancel_url: `${appUrl}/billing?canceled=true`,
      metadata: {
        org_id: org.id as string,
        plan_slug: plan.slug,
      },
    });

    return NextResponse.json({ success: true, data: { url: session.url } });
  } catch (error) {
    console.error("[POST /api/billing/checkout]", error);
    return NextResponse.json(
      { success: false, error: "Internal error" },
      { status: 500 }
    );
  }
}
