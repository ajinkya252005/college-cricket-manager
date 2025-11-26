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

        <div className="mx-auto mt-6 max-w-4xl text-right">
          <Link 
            to="/my-stats"
            className="inline-block rounded bg-blue-600 px-6 py-2 font-bold text-white hover:bg-blue-700 shadow"
          >
            View Detailed History &rarr;
          </Link>
        </div>

    </div>
  );
};

export default Dashboard;