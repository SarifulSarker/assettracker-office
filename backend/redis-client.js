// redis-client.js
import dotenv from "dotenv";
dotenv.config();

import Redis from "ioredis";

if (!process.env.REDIS_HOST) {
  throw new Error("REDIS_HOST is not defined");
}

const redisClient = new Redis({
  host: process.env.REDIS_HOST,
 
  port: Number(process.env.REDIS_PORT),
  db: Number(process.env.REDIS_DB),
  family: Number(process.env.REDIS_FAMILY),
  //password: env.REDIS_PASS,
});
redisClient.on("connect", () => console.log("Connected to Redis Server"));
redisClient.on("ready", () => console.log("Redis Instance is Ready!"));
redisClient.on("error", (err) => console.error("Redis Error:", err));

export default redisClient;
