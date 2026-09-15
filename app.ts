import "./config/database";
import "./auto/seed.auto";

import redisConnection from "./config/redis";

import express, { ErrorRequestHandler } from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";
import session from "express-session";
import MongoStore from "connect-mongo";
import dotenv from "dotenv";
import cors from "cors";
import { EventEmitter } from "events";

import routes from "./routes/index.routes";

import errorMiddleware from "./middlewares/error";
import { blockIPMiddleware } from "./middlewares/ip";
import QueueConsumer from "./queue/consumer";
import { DEFAULT_REDIS_QUEUE } from "./global/queue";

import { createBullBoard } from "@bull-board/api";
import { ExpressAdapter } from "@bull-board/express";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import QueueProducer from "./queue/producer";
import { requestLimiter } from "./middlewares/rate-limiter";

dotenv.config();

EventEmitter.defaultMaxListeners = 15;

const app = express();
const PORT = process.env.PORT;
const SESSION_SECRET = process.env.SESSION_SECRET as string;
const DATABASE_URL = process.env.MONGO_URL;
const queueConsumer = new QueueConsumer(redisConnection);
const queueProducer = new QueueProducer(redisConnection, DEFAULT_REDIS_QUEUE);

app.use(logger("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.set("trust proxy", 1);
app.use(blockIPMiddleware);
app.use(requestLimiter);

// "*" here means "allow any origin" — kept as a literal entry (rather than
// short-circuiting elsewhere) so this array is still the one place to edit
// if this ever needs to become a real allowlist instead.
const whiteList = ["*"];

app.set("trust proxy", 1);
app.use(
  cors({
    origin: function (origin, callback) {
      // whiteList.includes(origin) alone never matched a real request: "*"
      // was meant as "allow everything", but Array.includes does a literal
      // equality check, not wildcard matching — no browser ever sends the
      // literal Origin header "*". That's what was blocking Bull Board's
      // own same-origin admin requests (e.g. clearing failed jobs) with
      // "Not allowed by CORS".
      if (!origin || whiteList.includes("*") || whiteList.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    exposedHeaders: ["set-cookie"],
  }),
);

app.use(
  session({
    secret: SESSION_SECRET,
    name: process.env.SESSION_NAME,
    saveUninitialized: false,
    resave: false,
    store: MongoStore.create({
      mongoUrl: DATABASE_URL,
      autoRemove: "native",
      ttl: 60 * 60 * 24 * 365,
    }),
    cookie: {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  }),
);

app.use("/v1", routes);

app.all("/health", (req, res) => {
  res.send("I'm alive and running");
});

app.use(errorMiddleware as unknown as ErrorRequestHandler);

queueConsumer.consumeMessage(DEFAULT_REDIS_QUEUE);

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

const queues = [new BullMQAdapter(queueProducer.mq)];

createBullBoard({
  queues: queues,
  serverAdapter: serverAdapter,
});

app.use("/admin/queues", serverAdapter.getRouter());

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
  console.log(`For the UI, open http://localhost:${PORT}/admin/queues`);
});

export default app;
