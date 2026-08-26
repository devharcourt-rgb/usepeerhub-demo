import { createBullBoard } from "@bull-board/api";
import { ExpressAdapter } from "@bull-board/express";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { Express } from "express";
import QueueProducer from "./producer";

export function setupBullBoard(app: Express, queueProducer: QueueProducer) {
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath("/admin/queues");

  const queues = [new BullMQAdapter(queueProducer.mq)];

  createBullBoard({
    queues: queues,
    serverAdapter: serverAdapter,
  });

  app.use("/admin/queues", serverAdapter.getRouter());

  console.log("📊 Bull Board initialized at /admin/queues");
}
