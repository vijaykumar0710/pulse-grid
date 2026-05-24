const { Worker } = require("bullmq");
const { redisClient } = require("../config/redis");

console.log("AI Worker is ready and watching for critical vitals...");
const worker = new Worker(
  "ai-vitals-check",
  async (job) => {
    const data = job.data;
    if (data.spO2 < 90) {
      console.log(
        `\n[CRITICAL ALERT] ${data.bedId} - SpO2 Dropped to ${data.spO2}%`,
      );

      const alertMessage = {
        type: "RED_BLINK",
        bedId: data.bedId,
        message: `Oxygen level critical: ${data.spO2}%`,
        timestamp: Date.now(),
      };
      await redisClient.publish("alerts", JSON.stringify(alertMessage));
    } else {
      console.log(`[AI Guard] ${data.bedId} is stable (SpO2: ${data.spO2})`);
    }
  },
  {
    connection: {
      host: "127.0.0.1",
      port: 6379,
    },
  },
);

worker.on("failed", (job, err) => {
  console.error(`Job failed for ${job.id} with error ${err.message}`);
});
