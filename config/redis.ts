import IORedis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

const REDIS_HOST = process.env.REDIS_HOST as string;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD as string;
const REDIS_PORT = process.env.REDIS_PORT as unknown as number;

export const redisConnection = new IORedis({
  host: REDIS_HOST,
  username: "default",
  password: REDIS_PASSWORD,
  maxRetriesPerRequest: null,
});

redisConnection.on("connect", () => {
  console.log("Connected to Redis");
});

redisConnection.on("close", () => {
  console.log("Redis connection closed");
});

async function logTimeDrift() {
  try {
    const redisTimeArray = await redisConnection.time(); // [seconds, microseconds]
    const redisSeconds = Number(redisTimeArray[0]);
    const redisMicro = Number(redisTimeArray[1]);

    const redisDate = new Date(redisSeconds * 1000 + redisMicro / 1000);
    const serverDate = new Date();

    const drift = serverDate.getTime() - redisDate.getTime(); // in ms

    console.log(
      `[Server Time]: ${serverDate.toISOString()} | [Redis Time]: ${redisDate.toISOString()} | Drift: ${drift}ms`,
    );
  } catch (err) {
    console.error("Error fetching Redis time:", err);
  }
}

async function checkRedisNotifications() {
  try {
    const result: any = await redisConnection.config(
      "GET",
      "notify-keyspace-events",
    );
    const notifyConfig = result[1]; // result is ['notify-keyspace-events', 'Ex']

    console.log("[Redis Keyspace Notifications]:", notifyConfig || "(none)");

    if (!notifyConfig.includes("E") || !notifyConfig.includes("x")) {
      console.warn(
        "⚠️  Delayed jobs may not work! 'Ex' (expired events) is not enabled in Redis.",
      );
      console.warn(
        "You can enable it with: redis-cli CONFIG SET notify-keyspace-events Ex",
      );
      await redisConnection.config("SET", "notify-keyspace-events", "Ex");
      console.log("set");
    } else {
      console.log(
        "✅ Redis keyspace notifications for expired events are enabled.",
      );
    }
  } catch (err) {
    console.error("Error checking Redis keyspace notifications:", err);
  }
}

// checkRedisNotifications();
// Optional: log every 5 seconds
// setInterval(logTimeDrift, 5000);

export default redisConnection;
