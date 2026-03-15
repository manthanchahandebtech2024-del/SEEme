import { AnalysisJob } from "../utils/types";
import { EventBus } from "../events/EventBus";
import { createLogger } from "../utils/logger";

const logger = createLogger("AnalysisQueue");

export class AnalysisQueue {
  private queue: AnalysisJob[] = [];
  private processing = false;
  private processor?: (job: AnalysisJob) => Promise<void>;

  constructor(private eventBus: EventBus) {}

  setProcessor(fn: (job: AnalysisJob) => Promise<void>) { this.processor = fn; }

  async add(job: AnalysisJob): Promise<string> {
    this.queue.push(job);
    this.eventBus.emit("queue:job:added", { jobId: job.id });
    logger.info(`Job queued: ${job.id}`);
    this.processNext();
    return job.id;
  }

  getJob(id: string): AnalysisJob | undefined { return this.queue.find((j) => j.id === id); }

  private async processNext() {
    if (this.processing || !this.processor) return;
    const pending = this.queue.find((j) => j.status === "pending");
    if (!pending) return;

    this.processing = true;
    pending.status = "processing";
    this.eventBus.emit("queue:job:processing", { jobId: pending.id });

    try {
      await this.processor(pending);
      pending.status = "completed";
      this.eventBus.emit("queue:job:completed", { jobId: pending.id, result: pending.result });
      logger.info(`Job completed: ${pending.id}`);
    } catch (err: any) {
      pending.status = "failed";
      pending.error = err.message;
      this.eventBus.emit("queue:job:failed", { jobId: pending.id, error: err.message });
      logger.error(`Job failed: ${pending.id}`, err);
    } finally {
      this.processing = false;
      this.processNext();
    }
  }
}
