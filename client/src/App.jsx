import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_BASE_URL } from "./config";

// Components
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminTournaments from "./pages/admin/AdminTournaments";
import AdminSquad from "./pages/admin/AdminSquad";
import AdminMatches from "./pages/admin/AdminMatches";
import AdminScorecard from "./pages/admin/AdminScorecard";
import PlayerStats from "./pages/PlayerStats";
import AdminFinance from "./pages/admin/AdminFinance";
import PlayerFinance from "./pages/PlayerFinance";
import AdminAttendance from "./pages/admin/AdminAttendance";
import PlayerAttendance from "./pages/PlayerAttendance";
import Roster from "./pages/Roster";
import AdminPlayers from "./pages/admin/AdminPlayers";
import PlayerCareerStats from "./pages/PlayerCareerStats";
import MatchDetails from "./pages/MatchDetails";
import TeamStats from "./pages/TeamStats";
import LandingPage from "./pages/LandingPage";
import TeamAnalytics from "./pages/TeamAnalytics";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(""); // Store role here
  const [loading, setLoading] = useState(true); // Wait for check to finish

  const setAuth = (boolean) => {
    setIsAuthenticated(boolean);
  };

  async function isAuth() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
        method: "GET",
        headers: { token: localStorage.getItem("token") },
      });

      const parseRes = await response.json();

      if (response.ok) {
        setIsAuthenticated(true);
        setUserRole(parseRes.role); // Save the role
      } else {
        setIsAuthenticated(false);
        setUserRole("");
      }
      setLoading(false);
    } catch (err) {
      console.error(err.message);
      setLoading(false);
    }
  }

  useEffect(() => {
    isAuth();
  }, []);

  // Show nothing while checking (prevents flickering)
  if (loading) return null;

  return (
    <Router>
      <div className="container">
        <Routes>
          <Route
            path="/login"
            element={!isAuthenticated ?
              <Login setAuth={setAuth} setUserRole={setUserRole} /> :
              <Navigate to={
                userRole === "admin" ? "/admin-dashboard" :
                  userRole === "team" ? "/team/analytics" :
                    "/dashboard"
              } />
            }
          />
          <Route
            path="/register"
            element={!isAuthenticated ? <Register setAuth={setAuth} /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/"
            element={!isAuthenticated ? <LandingPage /> : <Navigate to={userRole === "admin" ? "/admin-dashboard" : "/dashboard"} />}
          />

          {/* PLAYER ROUTE */}
          <Route
            path="/dashboard"
            element={isAuthenticated ? <Dashboard setAuth={setAuth} /> : <Navigate to="/login" />}
          />
          <Route
            path="/my-stats"
            element={isAuthenticated ? <PlayerStats /> : <Navigate to="/login" />}
          />
          <Route
            path="/my-finance"
            element={isAuthenticated ? <PlayerFinance /> : <Navigate to="/login" />}
          />
          <Route
            path="/my-attendance"
            element={isAuthenticated ? <PlayerAttendance /> : <Navigate to="/login" />}
          />
          <Route
            path="/career-stats"
            element={isAuthenticated ? <PlayerCareerStats /> : <Navigate to="/login" />}
          />
          <Route
            path="/team/analytics"
            element={
              isAuthenticated ? (
                <TeamAnalytics setAuth={setAuth} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* ADMIN ROUTE (Protected) */}
          <Route
            path="/admin-dashboard"
            element={isAuthenticated && userRole === "admin" ? <AdminDashboard setAuth={setAuth} /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/admin/tournaments"
            element={isAuthenticated && userRole === "admin" ? <AdminTournaments /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/admin/tournaments/:id/squad"
            element={isAuthenticated && userRole === "admin" ? <AdminSquad /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/admin/matches"
            element={isAuthenticated && userRole === "admin" ? <AdminMatches /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/admin/matches/:id/scorecard"
            element={isAuthenticated && userRole === "admin" ? <AdminScorecard /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/admin/finance"
            element={isAuthenticated && userRole === "admin" ? <AdminFinance /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/admin/attendance"
            element={isAuthenticated && userRole === "admin" ? <AdminAttendance /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/admin/players"
            element={isAuthenticated && userRole === "admin" ? <AdminPlayers /> : <Navigate to="/dashboard" />}
          />

          {/* TEAM ROUTE */}
          <Route
            path="/roster"
            element={isAuthenticated ? <Roster /> : <Navigate to="/login" />}
          />
          <Route
            path="/match/:id"
            element={isAuthenticated ? <MatchDetails /> : <Navigate to="/login" />}
          />
          <Route
            path="/team-stats"
            element={isAuthenticated ? <TeamStats /> : <Navigate to="/login" />}
          />

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <ToastContainer />
      </div>
    </Router>
  );
}

export default App;