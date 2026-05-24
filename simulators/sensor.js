const BED_IDS = Array.from({ length: 10 }, (_, i) => `bed_${i + 1}`);
const SERVER_URL = "http://127.0.0.1:5000/api/vitals";
function generateVitals(bedId) {
  return {
    bedId: bedId,
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
      if (response.ok) {
        console.log(
          `[Sensor] Sent: ${bed} -> HR: ${data.heartRate}, SpO2: ${data.spO2}`,
        );
      }
    } catch (error) {
      console.error(`Sensor error`);
    }
  }
}, 2000);

console.log("Dummy Sensors Started for Bed 5 & 6...");
