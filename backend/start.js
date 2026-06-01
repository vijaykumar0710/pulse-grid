require("dotenv").config();

// Start main backend server
require("./server");

// Start AI worker in same process
require("./workers/aiWorker");

// Aggregator worker abhi dummy hai, isliye deploy mein mat chalao
// require("./workers/aggregatorWorker");
