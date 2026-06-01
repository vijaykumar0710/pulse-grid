const { Queue } = require("bullmq");
const Redis = require("ioredis");

const redisConnection = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
});

const aiQueue = new Queue("check-vitals", {
  connection: redisConnection,
});

module.exports = aiQueue;
