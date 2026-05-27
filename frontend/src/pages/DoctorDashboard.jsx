import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { LogOut, Send, MessageSquare } from "lucide-react";

// WebSockets connection configured for compatibility
const socket = io("http://127.0.0.1:5000", {
  transports: ["websocket", "polling"],
});

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const wardName = "Ward-A";

  useEffect(() => {
    socket.emit("join_ward", wardName);

    // NAYA CODE: Purani history load karna
    socket.on("chat_history", (historyData) => {
      setMessages(historyData);
    });

    socket.on("receive_message", (data) => {
      console.log("Message received:", data);
      setMessages((prev) => [...prev, data]);
    });

    // ... baki ka vitals wala code (Nurse Dashboard mein)

    return () => {
      socket.off("chat_history"); // NAYA CODE: Cleanup
      socket.off("receive_message");
      // socket.off("vitals_update"); (Nurse dashboard ke liye)
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  const sendMessage = () => {
    if (currentMessage.trim() !== "") {
      const msgData = {
        ward: wardName,
        sender: "Dr. Sharma",
        role: "Doctor",
        text: currentMessage,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      // Backend ko bhejo
      socket.emit("send_message", msgData);
      setCurrentMessage("");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        backgroundColor: "#f4f7f6",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        color: "#333",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "900px",
          height: "90vh",
          backgroundColor: "white",
          borderRadius: "15px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            padding: "20px 30px",
            backgroundColor: "#2c3e50",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <MessageSquare size={32} color="#3498db" />
            <div>
              <h1 style={{ margin: 0, fontSize: "1.5rem", color: "white" }}>
                👨‍⚕️ Doctor Command Center
              </h1>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.9rem",
                  opacity: 0.8,
                  color: "#eee",
                }}
              >
                {wardName} Communications
              </p>
            </div>
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

        {/* CHAT AREA */}
        <div
          style={{
            flex: 1,
            padding: "30px",
            overflowY: "auto",
            backgroundColor: "#fafbfc",
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}
        >
          {messages.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                color: "#aaa",
                fontSize: "0.9rem",
                marginTop: "auto",
                marginBottom: "auto",
              }}
            >
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((msg, index) => {
              // Agar message Doctor ne bheja hai toh right side, warna left side
              const isMe = msg.role === "Doctor";
              return (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "flex-start",
                    alignSelf: isMe ? "flex-end" : "flex-start",
                    flexDirection: isMe ? "row-reverse" : "row",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      backgroundColor: isMe ? "#3498db" : "#e74c3c",
                      color: "white",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      fontWeight: "bold",
                    }}
                  >
                    {msg.sender.charAt(0)}
                  </div>
                  <div
                    style={{
                      backgroundColor: isMe ? "#e1f0fa" : "white",
                      padding: "15px",
                      borderRadius: isMe
                        ? "15px 0 15px 15px"
                        : "0 15px 15px 15px",
                      maxWidth: "300px",
                      border: isMe ? "none" : "1px solid #eee",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.7rem",
                        color: "#555",
                        fontWeight: "bold",
                        display: "block",
                        marginBottom: "5px",
                      }}
                    >
                      {msg.sender} ({msg.role})
                    </span>
                    <p style={{ margin: 0, color: "#2c3e50" }}>{msg.text}</p>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        color: "#888",
                        marginTop: "5px",
                        display: "block",
                        textAlign: isMe ? "right" : "left",
                      }}
                    >
                      {msg.time}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* INPUT AREA */}
        <div
          style={{
            padding: "20px",
            borderTop: "1px solid #eee",
            backgroundColor: "white",
            display: "flex",
            gap: "15px",
            alignItems: "center",
          }}
        >
          <input
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type instructions for the nursing staff..."
            style={{
              flex: 1,
              padding: "15px 20px",
              borderRadius: "30px",
              border: "1px solid #ddd",
              outline: "none",
              fontSize: "1rem",
              backgroundColor: "#f9f9f9",
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
              width: "50px",
              height: "50px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              boxShadow: "0 4px 10px rgba(52, 152, 219, 0.3)",
            }}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
