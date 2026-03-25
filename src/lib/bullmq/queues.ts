import { Queue } from "bullmq";
import { getRedisConnection } from "./connection";

let _renderQueue: Queue | null = null;

export function getRenderQueue(): Queue {
  if (!_renderQueue) {
    _renderQueue = new Queue("render", {
      connection: getRedisConnection(),
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 5000 },
      },
    });
  }
  return _renderQueue;
}

export interface RenderJobData {
  generation_id: string;
  template_id: string;
  participant_id: string;
  organization_id: string;
  field_values: Record<string, string>;
}
