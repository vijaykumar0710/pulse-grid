import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { Heart, Activity, AlertCircle, LogOut, Send } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// WebSockets connection configured for compatibility
const socket = io("http://127.0.0.1:5000", {
  transports: ["websocket", "polling"],
});

export default function NurseDashboard() {
  const [beds, setBeds] = useState({});
  const navigate = useNavigate();

  // Chat States
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const wardName = "Ward-A";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  useEffect(() => {
    socket.emit("join_ward", wardName);

    socket.on("chat_history", (historyData) => setMessages(historyData));

    socket.on("receive_message", (data) =>
      setMessages((prev) => [...prev, data]),
    );

    // 1. Sirf data update karo, decision mat lo
    socket.on("vitals_update", (data) => {
      setBeds((prevBeds) => {
        let currentHistory = prevBeds[data.bedId]?.history || [];
        if (currentHistory.length > 20)
          currentHistory = currentHistory.slice(-20);

        return {
          ...prevBeds,
          [data.bedId]: {
            ...prevBeds[data.bedId], // Purana status retain karo
            hr: data.heartRate,
            spo2: data.spO2,
            // Agar SpO2 theek ho gaya, toh stable kar do
            status:
              data.spO2 >= 90
                ? "stable"
                : prevBeds[data.bedId]?.status || "stable",
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
      });
    });

    // 2. Asli AI Worker ki baat suno!
    socket.on("red_blink_alert", (data) => {
      setBeds((prevBeds) => {
        if (!prevBeds[data.bedId]) return prevBeds;
        return {
          ...prevBeds,
          [data.bedId]: { ...prevBeds[data.bedId], status: "critical" },
        };
      });
    });

    return () => {
      socket.off("chat_history");
      socket.off("receive_message");
      socket.off("vitals_update");
      socket.off("red_blink_alert");
    };
  }, []);

  const sendMessage = () => {
    if (currentMessage.trim() !== "") {
      const msgData = {
        ward: wardName,
        sender: "Sister Alina",
        role: "Nurse",
        text: currentMessage,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      // Backend ko message bhejo
      socket.emit("send_message", msgData);
      setCurrentMessage(""); // Input field khali karo
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        backgroundColor: "#f4f7f6",
        color: "#333",
      }}
    >
      {/* ================= LEFT SIDE: Vitals & Graphs (70%) ================= */}
      <div style={{ flex: 7, padding: "20px", overflowY: "auto" }}>
        {/* Header Section */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            backgroundColor: "white",
            padding: "15px 20px",
            borderRadius: "10px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
          }}
        >
          <div>
            <h1 style={{ margin: 0, color: "#2c3e50" }}>👩‍⚕️ Nurse Dashboard</h1>
            <p style={{ margin: 0, color: "#7f8c8d" }}>
              Live Monitoring (Room-101)
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 15px",
              background: "#e74c3c",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            <LogOut size={18} /> Logout
          </button>
        </div>

        {/* Beds Grid Section */}
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

                {/* Real-time Line Graph */}
                <div
                  style={{
                    width: "100%",
                    height: 120,
                    marginTop: 15,
                    backgroundColor: "#fafafa",
                    borderRadius: 8,
                    padding: "5px 10px 5px 0",
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={vitals.history}>
                      <XAxis dataKey="minute" hide />
                      <YAxis domain={[70, 100]} hide />
                      <Line
                        type="monotone"
                        dataKey="avg_spo2"
                        stroke="#3498db"
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Critical Alert Message */}
                {vitals.status === "critical" && (
                  <div className="alert-msg">
                    <AlertCircle size={20} /> CRITICAL ALERT!
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* ================= RIGHT SIDE: Chat with Doctor (30%) ================= */}
      <div
        style={{
          flex: 3,
          backgroundColor: "white",
          borderLeft: "2px solid #eee",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "20px",
            backgroundColor: "#2c3e50",
            color: "white",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.2rem", color: "white" }}>
            💬 Chat with Doctor
          </h2>
        </div>

        {/* Chat Messages Display Area */}
        <div
          style={{
            flex: 1,
            padding: "20px",
            overflowY: "auto",
            backgroundColor: "#fafbfc",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {messages.length === 0 ? (
            <div
              style={{ textAlign: "center", color: "#aaa", marginTop: "50%" }}
            >
              Send a message to Doctor...
            </div>
          ) : (
            messages.map((msg, index) => {
              const isMe = msg.role === "Nurse";
              return (
                <div
                  key={index}
                  style={{
                    alignSelf: isMe ? "flex-end" : "flex-start",
                    backgroundColor: isMe ? "#e1f0fa" : "white",
                    padding: "10px",
                    borderRadius: "10px",
                    border: isMe ? "none" : "1px solid #eee",
                    maxWidth: "80%",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.7rem",
                      color: "#888",
                      display: "block",
                      marginBottom: "2px",
                      fontWeight: "bold",
                    }}
                  >
                    {msg.sender}
                  </span>
                  <p
                    style={{ margin: 0, fontSize: "0.9rem", color: "#2c3e50" }}
                  >
                    {msg.text}
                  </p>
                  <span
                    style={{
                      fontSize: "0.6rem",
                      color: "#aaa",
                      display: "block",
                      textAlign: "right",
                      marginTop: "3px",
                    }}
                  >
                    {msg.time}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Chat Input Area */}
        <div
          style={{
            padding: "15px",
            borderTop: "1px solid #eee",
            display: "flex",
            gap: "10px",
          }}
        >
          <input
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Message Doctor..."
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "20px",
              border: "1px solid #ccc",
              outline: "none",
              color: "#333",
            }}
          />
          <button
            onClick={sendMessage}
            style={{
              backgroundColor: "#3498db",
              color: "white",
              border: "none",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              cursor: "pointer",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
