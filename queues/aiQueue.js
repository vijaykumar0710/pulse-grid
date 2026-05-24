const { Queue } = require('bullmq');
const aiQueue = new Queue('ai-vitals-check', {
  connection: {
    host: '127.0.0.1',
    port: 6379
  }
});
module.exports = aiQueue;