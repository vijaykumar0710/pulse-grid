const BED_IDS = Array.from({ length: 10 }, (_, i) => `bed_${i + 1}`);

const SERVER_URL = process.env.SERVER_URL || "http://127.0.0.1:5000/api/vitals";

function generateVitals(bedId) {
  return {
    bedId,
    heartRate: Math.floor(Math.random() * (129 - 60 + 1)) + 60,
    spO2: Math.floor(Math.random() * (100 - 85 + 1)) + 85,
    timestamp: Date.now(),
  };
}

setInterval(async () => {
  for (let bed of BED_IDS) {
    const data = generateVitals(bed);

    try {
      const response = await fetch(SERVER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        console.log(`[Sensor] Failed: ${response.status}`);
      }
    } catch (error) {
      console.error("Sensor connection error:", error.message);
    }
  }
}, 2000);

console.log("📡 IoT Sensors Started! Sending data every 2 seconds...");
console.log("Target:", SERVER_URL);
