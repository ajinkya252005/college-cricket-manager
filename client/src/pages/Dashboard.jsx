import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const Dashboard = ({ setAuth }) => {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [matches, setMatches] = useState(0);
  const [runs, setRuns] = useState(0);
  const [wickets, setWickets] = useState(0);
  const [loading, setLoading] = useState(true);

  const getProfile = async () => {
    try {
      const response = await fetch("${API_BASE_URL}/api/auth/verify", {
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
        setLoading(false);
      } else {
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

  useEffect(() => {
    getProfile();
  }, []);

  // Helper for Avatar Color
  const getAvatarColor = (n) => {
      if(!n) return "bg-gray-600";
      const colors = ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-yellow-500", "bg-teal-500"];
      return colors[n.charCodeAt(0) % colors.length];
  };

  if(loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading Locker Room...</div>;

  return (
    <div className="min-h-screen bg-gray-900 p-6 md:p-10 text-white relative overflow-hidden">
      
      {/* Background FX */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-900/20 to-gray-900 -z-10"></div>
      <div className="absolute top-10 right-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-6xl mx-auto">
        
        {/* 1. HEADER / PROFILE HERO */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 bg-gray-800/50 backdrop-blur-md p-6 rounded-3xl border border-gray-700 shadow-2xl">
          <div className="flex items-center gap-6">
            <div className={`w-24 h-24 ${getAvatarColor(name)} rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-lg ring-4 ring-gray-700`}>
                {name.charAt(0)}
            </div>
            <div>
                <h2 className="text-sm text-gray-400 uppercase tracking-widest font-bold mb-1">Welcome Back</h2>
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">{name}</h1>
                <span className="inline-block mt-2 px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold rounded-full uppercase border border-blue-500/30">
                    {role}
                </span>
            </div>
          </div>
          <button
            onClick={(e) => logout(e)}
            className="mt-6 md:mt-0 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 border border-red-500/30"
          >
            Log Out
          </button>
        </div>

        {/* 2. KEY STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg relative overflow-hidden group hover:border-blue-500 transition-all">
                <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition"><span className="text-6xl">🏏</span></div>
                <p className="text-gray-400 text-xs font-bold uppercase">Matches Played</p>
                <p className="text-5xl font-black text-white mt-2 group-hover:text-blue-400 transition">{matches}</p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg relative overflow-hidden group hover:border-green-500 transition-all">
                <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition"><span className="text-6xl">⚡</span></div>
                <p className="text-gray-400 text-xs font-bold uppercase">Total Runs</p>
                <p className="text-5xl font-black text-white mt-2 group-hover:text-green-400 transition">{runs}</p>
            </div>

            <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg relative overflow-hidden group hover:border-purple-500 transition-all">
                <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition"><span className="text-6xl">🎯</span></div>
                <p className="text-gray-400 text-xs font-bold uppercase">Total Wickets</p>
                <p className="text-5xl font-black text-white mt-2 group-hover:text-purple-400 transition">{wickets}</p>
            </div>
        </div>

        {/* 3. QUICK ACTIONS GRID */}
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-2 h-8 bg-blue-500 rounded-full"></span> 
            Player Zone
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Career Stats (Featured) */}
            <Link to="/career-stats" className="col-span-1 md:col-span-2 bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-8 flex items-center justify-between hover:shadow-xl hover:shadow-blue-900/50 transition-all transform hover:-translate-y-1 group border border-blue-700">
                <div>
                    <h3 className="text-2xl font-bold text-white mb-1">Detailed Career Analysis</h3>
                    <p className="text-blue-200 text-sm">Deep dive into your Strike Rate, Economy, and Form Guide.</p>
                </div>
                <div className="bg-white/10 p-3 rounded-full group-hover:bg-white/20 transition">
                    <span className="text-2xl">📈</span>
                </div>
            </Link>

            {/* Roster */}
            <Link to="/roster" className="bg-gray-800 hover:bg-gray-750 border border-gray-700 p-6 rounded-2xl flex items-center gap-4 transition-all group">
                <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center text-xl group-hover:bg-blue-600 group-hover:text-white transition">👥</div>
                <div>
                    <h4 className="font-bold text-white">Team Roster</h4>
                    <p className="text-xs text-gray-400">View squad details</p>
                </div>
            </Link>

            {/* Match History */}
            <Link to="/my-stats" className="bg-gray-800 hover:bg-gray-750 border border-gray-700 p-6 rounded-2xl flex items-center gap-4 transition-all group">
                <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center text-xl group-hover:bg-green-600 group-hover:text-white transition">📊</div>
                <div>
                    <h4 className="font-bold text-white">Match History</h4>
                    <p className="text-xs text-gray-400">Past games & scorecards</p>
                </div>
            </Link>

            {/* Finance */}
            <Link to="/my-finance" className="bg-gray-800 hover:bg-gray-750 border border-gray-700 p-6 rounded-2xl flex items-center gap-4 transition-all group">
                <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center text-xl group-hover:bg-purple-600 group-hover:text-white transition">💰</div>
                <div>
                    <h4 className="font-bold text-white">My Finances</h4>
                    <p className="text-xs text-gray-400">Track payments & dues</p>
                </div>
            </Link>

            {/* Attendance */}
            <Link to="/my-attendance" className="bg-gray-800 hover:bg-gray-750 border border-gray-700 p-6 rounded-2xl flex items-center gap-4 transition-all group">
                <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center text-xl group-hover:bg-teal-600 group-hover:text-white transition">📅</div>
                <div>
                    <h4 className="font-bold text-white">Attendance Log</h4>
                    <p className="text-xs text-gray-400">Check your regularity</p>
                </div>
            </Link>

            {/* Team Stats */}
            <Link to="/team-stats" className="bg-gray-800 hover:bg-gray-750 border border-gray-700 p-6 rounded-2xl flex items-center gap-4 transition-all group">
                <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center text-xl group-hover:bg-yellow-500 group-hover:text-black transition">🏆</div>
                <div>
                    <h4 className="font-bold text-white">Team HQ</h4>
                    <p className="text-xs text-gray-400">Leaderboards & Records</p>
                </div>
            </Link>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;