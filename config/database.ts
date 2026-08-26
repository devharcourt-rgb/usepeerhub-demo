import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const databaseUrl = process.env.MONGO_URL as string;

const connectWithRetry = async (retries = 5, delayMs = 3000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(databaseUrl, {
        dbName: "peerhub",
        serverSelectionTimeoutMS: 15000,
      });
      return;
    } catch (err) {
      console.error(
        `Mongo connection attempt ${attempt} failed:`,
        (err as Error).message,
      );
      if (attempt === retries) throw err;
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
};

connectWithRetry();

export const db = mongoose.connection;

db.on("connected", () => console.log("Connected to Database"));
db.on("disconnected", () => console.log("Disconnected from Database"));
db.on("close", () => console.log("Database connection closed"));
db.on("error", (error) => console.log("Database connection error:", error));
