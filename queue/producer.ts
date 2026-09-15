import { Queue, RedisClient } from "bullmq";
import { IJob } from "../types/job.types";
import { DEFAULT_REDIS_QUEUE } from "../global/queue";

class QueueProducer {
  queue: any;

  constructor(
    private redisClient: RedisClient,
    queueName?: string,
  ) {
    if (queueName) {
      this.creatQueue(queueName).catch(console.error);
    }
  }

  async creatQueue(queueName: string) {
    return (this.queue = new Queue(queueName, {
      connection: this.redisClient,
      defaultJobOptions: {
        removeOnComplete: false,
        removeOnFail: false,
        // Without this, BullMQ's default is 1 attempt — any transient
        // failure (a network blip, a momentary rate limit, anything that
        // would've cleared up on its own) becomes a permanently failed job
        // that just sits there until someone notices it in Bull Board and
        // clicks Retry by hand. 3 attempts with exponential backoff gives
        // transient failures a real chance to self-heal; a job that still
        // fails after that is very likely a genuine, non-transient problem
        // worth a human's attention, and still lands in FAILED as before.
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
      },
    }));
  }

  async addJob(job: IJob) {
    if (!this.queue) {
      throw new Error("Queue not initialized");
    }

    console.log("Adding job to queue", job.name);

    const jobOptions: any = {};
    if (job.delay) jobOptions.delay = job.delay; // Add job with optional delay
    if (job.jobId) jobOptions.jobId = job.jobId; // Optional idempotent job ID

    await this.queue.add(job.name, job.data, jobOptions);
    return true;
  }

  get mq() {
    return this.queue;
  }
}

export default QueueProducer;
