const { createClient } = require("redis");
require('dotenv').config();

const redisClient = createClient({
  url:`redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
});

// Event Listeners for logging
redisClient.on('connect', () => console.log('[Redis] Connecting...'));
redisClient.on('ready', () => console.log('[Redis] Connected & Ready to use (TimeSeries/Cache/PubSub)!'));
redisClient.on('error', (err) => console.error('[Redis Error]', err));

const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error("[Redis Failed]", error);
  }
};

module.exports = {
  redisClient,
  connectRedis,
};