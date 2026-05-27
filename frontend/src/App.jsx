import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import DoctorDashboard from "./pages/DoctorDashboard";
import NurseDashboard from "./pages/NurseDashboard";
import "./App.css";

// Yeh function check karega ki user logged in hai ya nahi
const PrivateRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) return <Navigate to="/" />;
  if (allowedRole && role !== allowedRole) return <Navigate to="/" />;

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/doctor-dashboard"
          element={
            <PrivateRoute allowedRole="Doctor">
              <DoctorDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/nurse-dashboard"
          element={
            <PrivateRoute allowedRole="Nurse">
              <NurseDashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
