/**
 * Render Worker — standalone Node.js process
 * Run with: pnpm worker (tsx src/workers/render-worker.ts)
 *
 * Consumes render jobs from BullMQ, loads Fabric.js template JSON,
 * injects participant data, renders to PNG, uploads to Supabase Storage.
 */

import { Worker, type Job } from "bullmq";
import { createClient } from "@supabase/supabase-js";
import type { RenderJobData } from "../lib/bullmq/queues";

// Parse Redis connection
function getRedisConnection() {
  const url = process.env.REDIS_URL;
  if (url) {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parseInt(parsed.port || "6379"),
      password: parsed.password || undefined,
      maxRetriesPerRequest: null,
    };
  }
  return {
    host: process.env.REDIS_HOST ?? "localhost",
    port: parseInt(process.env.REDIS_PORT ?? "6379"),
    maxRetriesPerRequest: null,
  };
}

// Supabase admin client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function processRenderJob(job: Job<RenderJobData>) {
  const { generation_id, template_id, participant_id, organization_id, field_values } =
    job.data;

  console.log(`[render] Processing generation ${generation_id}`);

  // Update status to processing
  await supabase
    .from("generations")
    .update({ status: "processing" })
    .eq("id", generation_id);

  try {
    // 1. Fetch template
    const { data: template, error: tErr } = await supabase
      .from("templates")
      .select("canvas_json, width, height")
      .eq("id", template_id)
      .single();

    if (tErr || !template) throw new Error("Template not found");

    // 2. Load Fabric.js in Node.js
    // fabric v7 supports Node.js via jsdom/node-canvas
    const { StaticCanvas, util } = await import("fabric");

    const canvas = new StaticCanvas(undefined, {
      width: template.width,
      height: template.height,
    });

    // 3. Load template JSON
    await canvas.loadFromJSON(template.canvas_json);

    // 4. Inject participant data into variable zones
    canvas.getObjects().forEach((obj) => {
      const typed = obj as unknown as Record<string, unknown>;
      const variableField = typed.variableField as string | undefined;

      if (!variableField) return;

      const value = field_values[variableField];
      if (!value) return;

      // Text fields: replace text content
      if (typed.text !== undefined) {
        typed.text = value;
      }
      // Image fields would need async image loading — simplified for MVP
    });

    canvas.renderAll();

    // 5. Export to PNG buffer
    const dataUrl = canvas.toDataURL({
      format: "png",
      multiplier: 1,
    });

    // Convert data URL to buffer
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // 6. Upload to Supabase Storage
    const filePath = `generations/${generation_id}.png`;
    const { error: uploadErr } = await supabase.storage
      .from("renders")
      .upload(filePath, buffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadErr) throw new Error(`Upload failed: ${uploadErr.message}`);

    // 7. Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("renders").getPublicUrl(filePath);

    // 8. Update generation record
    await supabase
      .from("generations")
      .update({
        status: "completed",
        file_url: publicUrl,
        completed_at: new Date().toISOString(),
      })
      .eq("id", generation_id);

    // 9. Increment org generations_used
    const { data: org } = await supabase
      .from("organizations")
      .select("generations_used")
      .eq("id", organization_id)
      .single();

    if (org) {
      await supabase
        .from("organizations")
        .update({ generations_used: org.generations_used + 1 })
        .eq("id", organization_id);
    }

    // 10. Update participant status
    await supabase
      .from("participants")
      .update({ status: "completed" })
      .eq("id", participant_id);

    console.log(`[render] Completed generation ${generation_id}`);

    // Cleanup
    canvas.dispose();

    return { generation_id, file_url: publicUrl };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[render] Failed generation ${generation_id}:`, message);

    await supabase
      .from("generations")
      .update({ status: "failed", error_message: message })
      .eq("id", generation_id);

    throw error;
  }
}

// Start worker
const worker = new Worker<RenderJobData>("render", processRenderJob, {
  connection: getRedisConnection(),
  concurrency: 5,
});

worker.on("ready", () => {
  console.log("[render] Worker ready, waiting for jobs...");
});

worker.on("completed", (job) => {
  console.log(`[render] Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`[render] Job ${job?.id} failed:`, err.message);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("[render] Shutting down...");
  await worker.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("[render] Shutting down...");
  await worker.close();
  process.exit(0);
});
