const { Queue } = require("bullmq");
const Redis = require("ioredis");

const redisConnection = new Redis({
  host: "127.0.0.1",
  port: 6379,
});

const aiQueue = new Queue("check-vitals", {
  connection: redisConnection,
});

module.exports = aiQueue;
