const { createClient } = require("redis");
require("dotenv").config();

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("connect", () => console.log("[Redis] Connecting..."));

redisClient.on("ready", () => console.log("[Redis] Connected Successfully"));

redisClient.on("error", (err) => console.error("[Redis Error]", err));

const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log("✅ Redis Connected");
  } catch (error) {
    console.error("❌ Redis Connection Failed:", error.message);
  }
};

module.exports = {
  redisClient,
  connectRedis,
};
