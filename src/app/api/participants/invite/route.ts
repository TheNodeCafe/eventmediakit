import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getResend } from "@/lib/resend/client";

export async function POST(request: Request) {
  try {
    // Verify auth
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { event_id, participant_ids } = await request.json();

    if (!event_id || !participant_ids?.length) {
      return NextResponse.json(
        { success: false, error: "Missing event_id or participant_ids" },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // Fetch event with org info
    const { data: event, error: eventError } = await admin
      .from("events")
      .select("*, organization:organizations(name, logo_url)")
      .eq("id", event_id)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    // Fetch participants
    const { data: participants, error: pError } = await admin
      .from("participants")
      .select("id, email, magic_token")
      .in("id", participant_ids)
      .eq("event_id", event_id);

    if (pError || !participants?.length) {
      return NextResponse.json(
        { success: false, error: "No participants found" },
        { status: 404 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const org = event.organization as { name: string; logo_url: string | null };

    // Send emails via Resend
    const results = await Promise.allSettled(
      participants.map(async (p) => {
        const magicLink = `${appUrl}/p/${p.magic_token}`;

        await getResend().emails.send({
          from: `${org.name} <noreply@${process.env.RESEND_DOMAIN ?? "resend.dev"}>`,
          to: p.email,
          subject: `${event.name} — Personnalisez vos visuels`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>${event.name}</h2>
              <p>Bonjour,</p>
              <p>Vous êtes invité(e) à personnaliser vos visuels pour <strong>${event.name}</strong>.</p>
              <p>Cliquez sur le lien ci-dessous pour accéder à votre espace personnel :</p>
              <p style="margin: 24px 0;">
                <a href="${magicLink}"
                   style="background-color: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block;">
                  Personnaliser mes visuels
                </a>
              </p>
              <p style="color: #666; font-size: 14px;">
                Ce lien est personnel et unique. Ne le partagez pas.
              </p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
              <p style="color: #999; font-size: 12px;">
                Envoyé par ${org.name} via EventMediaKit
              </p>
            </div>
          `,
        });

        // Update participant invited_at
        await admin
          .from("participants")
          .update({ invited_at: new Date().toISOString() })
          .eq("id", p.id);

        return p.id;
      })
    );

    const sent = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return NextResponse.json({
      success: true,
      data: { sent, failed, total: participants.length },
    });
  } catch (error) {
    console.error("[POST /api/participants/invite]", error);
    return NextResponse.json(
      { success: false, error: "Internal error" },
      { status: 500 }
    );
  }
}
