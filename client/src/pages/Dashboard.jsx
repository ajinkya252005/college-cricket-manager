import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const Dashboard = ({ setAuth }) => {
const [name, setName] = useState("");
const [role, setRole] = useState("");
const [matches, setMatches] = useState(0);
const [runs, setRuns] = useState(0);
const [wickets, setWickets] = useState(0);

  const getProfile = async () => {
    try {
      // We send the token in the header so the backend knows who we are
      const response = await fetch("http://localhost:5000/api/auth/verify", {
        method: "GET",
        headers: { token: localStorage.getItem("token") },
      });

      const parseRes = await response.json();

      if (response.ok) {
        setName(parseRes.full_name);
        setRole(parseRes.role);
        setMatches(parseRes.total_matches);
        setRuns(parseRes.total_runs);
        setWickets(parseRes.total_wickets);
      } else {
        // If token is invalid, force logout
        localStorage.removeItem("token");
        setAuth(false);
        toast.error("Session Expired");
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  const logout = (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    setAuth(false);
    toast.success("Logged out successfully");
  };

  // useEffect runs once when the page loads
  useEffect(() => {
    getProfile();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Header Card */}
      <div className="mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Welcome, {name} 👋
            </h1>
            <p className="text-gray-600">Role: <span className="font-semibold uppercase text-blue-600">{role}</span></p>
          </div>
          <button
            onClick={(e) => logout(e)}
            className="rounded bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Stats Section */}
        <div className="mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow text-center">
                <h3 className="text-lg font-bold text-gray-500">Matches Played</h3>
                <p className="text-4xl font-bold text-blue-600">{matches}</p> {/* Changed */}
            </div>
            <div className="rounded-lg bg-white p-6 shadow text-center">
                <h3 className="text-lg font-bold text-gray-500">Total Runs</h3>
                <p className="text-4xl font-bold text-green-600">{runs}</p> {/* Changed */}
            </div>
            <div className="rounded-lg bg-white p-6 shadow text-center">
                <h3 className="text-lg font-bold text-gray-500">Wickets</h3>
                <p className="text-4xl font-bold text-purple-600">{wickets}</p> {/* Changed */}
            </div>
        </div>

        {/* Quick Actions */}
        <div className="mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
            
            <Link to="/roster" className="flex items-center justify-center p-4 bg-white rounded-lg shadow hover:bg-gray-50 transition border-l-4 border-blue-500">
                <span className="text-xl mr-2">👥</span>
                <span className="font-bold text-gray-700">View Team Roster</span>
            </Link>

            <Link to="/my-stats" className="flex items-center justify-center p-4 bg-white rounded-lg shadow hover:bg-gray-50 transition border-l-4 border-green-500">
                <span className="text-xl mr-2">📊</span>
                <span className="font-bold text-gray-700">My Match History</span>
            </Link>

            <Link to="/my-finance" className="flex items-center justify-center p-4 bg-white rounded-lg shadow hover:bg-gray-50 transition border-l-4 border-purple-500">
                <span className="text-xl mr-2">💰</span>
                <span className="font-bold text-gray-700">My Finances</span>
            </Link>

            <Link to="/my-attendance" className="flex items-center justify-center p-4 bg-white rounded-lg shadow hover:bg-gray-50 transition border-l-4 border-teal-500">
                <span className="text-xl mr-2">📅</span>
                <span className="font-bold text-gray-700">My Attendance</span>
            </Link>

        </div>

    </div>
  );
};

export default Dashboard;