import { NextFunction, Request, Response } from "express";

import QueueProducer from "../../queue/producer";
import redisConnection from "../../config/redis";
import { DEFAULT_REDIS_QUEUE } from "../../global/queue";

async function webhookHandler(req: Request, res: Response, next: NextFunction) {
  console.log("Hook received");

  try {
    res.send("Ok");
  } catch (error) {
    next(error);
  }
}

export default webhookHandler;
