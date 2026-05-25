import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { Heart, Activity, AlertCircle } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./App.css";

const socket = io("http://127.0.0.1:5000");

function App() {
  const [beds, setBeds] = useState({});

  // Naya Function: Backend API se history mangwane ke liye
  const fetchBedHistory = async (bedId) => {
    try {
      // Abhi hum bedId ko hi patientId maan kar test kar rahe hain
      const response = await fetch(
        `http://127.0.0.1:5000/api/vitals/history/${bedId}`,
      );
      const result = await response.json();

      if (result.success && result.data) {
        return result.data; // MongoDB ka asli data
      }
      return [];
    } catch (error) {
      console.error(`Error fetching history for ${bedId}:`, error);
      return [];
    }
  };

  useEffect(() => {
    socket.on("connect", () => console.log("🟢 Connected to WebSocket"));

    socket.on("vitals_update", async (data) => {
      setBeds((prevBeds) => {
        const isNewBed = !prevBeds[data.bedId];
        let currentHistory = prevBeds[data.bedId]?.history || [];

        // Agar array bohot bada ho jaye, toh purana data nikal do (Sirf last 20 mins dikhao)
        if (currentHistory.length > 20) {
          currentHistory = currentHistory.slice(-20);
        }

        const updatedState = {
          ...prevBeds,
          [data.bedId]: {
            hr: data.heartRate,
            spo2: data.spO2,
            status: data.spO2 < 90 ? "critical" : "stable",
            history: [
              ...currentHistory,
              {
                minute: new Date().getMinutes(),
                avg_hr: data.heartRate,
                avg_spo2: data.spO2,
              },
            ],
          },
        };
        return updatedState;
      });
    });

    return () => {
      socket.off("connect");
      socket.off("vitals_update");
    };
  }, []);

  return (
    <div>
      <div className="dashboard-header">
        <h1>🏥 PulseGrid ICU Dashboard</h1>
        <p>Real-time Patient Vitals & Trend Analytics</p>
      </div>

      <div className="beds-grid">
        {Object.keys(beds).length === 0 ? (
          <h2 style={{ textAlign: "center", color: "#888", width: "100%" }}>
            Waiting for sensor data...
          </h2>
        ) : (
          Object.entries(beds).map(([bedId, vitals]) => (
            <div
              key={bedId}
              className={`bed-card ${vitals.status === "critical" ? "critical" : ""}`}
            >
              <div className="bed-header">{bedId.replace("_", " ")}</div>

              <div className="vitals-row">
                <Heart color="#e74c3c" size={24} />
                <span>
                  Heart Rate: <strong>{vitals.hr}</strong> bpm
                </span>
              </div>

              <div className="vitals-row">
                <Activity color="#3498db" size={24} />
                <span>
                  SpO2: <strong>{vitals.spo2}</strong> %
                </span>
              </div>

              <div
                style={{
                  width: "100%",
                  height: 160,
                  marginTop: 20,
                  backgroundColor: "#fafafa",
                  borderRadius: 8,
                  padding: "10px 10px 10px 0",
                }}
              >
                <h4
                  style={{
                    margin: "0 0 5px 20px",
                    fontSize: "0.8rem",
                    color: "#666",
                  }}
                >
                  SpO2 Trend
                </h4>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={vitals.history}
                    margin={{ top: 5, right: 10, left: 10, bottom: 15 }}
                  >
                    <XAxis
                      dataKey="minute"
                      tick={{ fontSize: 10, fill: "#888" }}
                      stroke="#eee"
                      label={{
                        value: "Time (mins)",
                        position: "insideBottom",
                        offset: -10,
                        fontSize: 11,
                        fill: "#555",
                      }}
                    />
                    <YAxis
                      domain={[70, 100]}
                      tick={{ fontSize: 10, fill: "#888" }}
                      width={40}
                      stroke="#eee"
                      label={{
                        value: "SpO2 %",
                        angle: -90,
                        position: "insideLeft",
                        offset: 0,
                        fontSize: 11,
                        fill: "#555",
                      }}
                    />
                    <Tooltip
                      contentStyle={{ fontSize: "12px", borderRadius: "5px" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="avg_spo2"
                      stroke="#3498db"
                      strokeWidth={3}
                      dot={false}
                      animationDuration={300}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {vitals.status === "critical" && (
                <div className="alert-msg">
                  <AlertCircle size={20} /> CRITICAL OXYGEN ALERT!
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
