require("dotenv").config();

// Start main backend server
require("./server");

// Start AI worker in same process
require("./workers/aiWorker");

// Aggregator worker abhi dummy hai, isliye deploy mein mat chalao
// require("./workers/aggregatorWorker")
;

//require("./simulators/sensor"); load badhyega isiliye local chalao
/*
cd backend
$env:SERVER_URL="https://pulse-grid.onrender.com/api/vitals"
node simulators/sensor.js
*/
