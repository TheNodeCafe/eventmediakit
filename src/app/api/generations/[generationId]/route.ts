import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ generationId: string }> }
) {
  const { generationId } = await params;
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("generations")
    .select("id, status, file_url, file_format, error_message")
    .eq("id", generationId)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { success: false, error: "Generation not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data });
}
