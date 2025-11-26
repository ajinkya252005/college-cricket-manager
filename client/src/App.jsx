import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(""); // Store role here
  const [loading, setLoading] = useState(true); // Wait for check to finish

  const setAuth = (boolean) => {
    setIsAuthenticated(boolean);
  };

  async function isAuth() {
    try {
      const response = await fetch("http://localhost:5000/api/auth/verify", {
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
            element={!isAuthenticated ? <Login setAuth={setAuth} /> : <Navigate to={userRole === "admin" ? "/admin-dashboard" : "/dashboard"} />} 
          />
          <Route 
            path="/register" 
            element={!isAuthenticated ? <Register setAuth={setAuth} /> : <Navigate to="/dashboard" />} 
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
          
          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
        <ToastContainer />
      </div>
    </Router>
  );
}

export default App;