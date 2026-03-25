import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/client";

export async function POST() {
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

    const admin = createAdminClient();
    const { data: membership } = await admin
      .from("organization_members")
      .select("organization:organizations(id, stripe_customer_id)")
      .eq("user_id", user.id)
      .single();

    const org = membership?.organization as unknown as Record<string, unknown> | null;
    const customerId = org?.stripe_customer_id as string | null;

    if (!customerId) {
      return NextResponse.json(
        { success: false, error: "No billing account" },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        { success: false, error: "Stripe not configured" },
        { status: 503 }
      );
    }
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl}/billing`,
    });

    return NextResponse.json({ success: true, data: { url: session.url } });
  } catch (error) {
    console.error("[POST /api/billing/portal]", error);
    return NextResponse.json(
      { success: false, error: "Internal error" },
      { status: 500 }
    );
  }
}
