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
