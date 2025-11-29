import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const PlayerCareerStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/auth/verify", {
            method: "GET",
            headers: { token: localStorage.getItem("token") }
        });
        const data = await response.json();
        setStats(data);
        setLoading(false);
      } catch (err) {
        console.error(err.message);
        setLoading(false);
      }
    };
    getData();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading Stats...</div>;

  // --- CALCULATIONS ---
  const battingSR = stats.total_balls_faced > 0 
      ? ((stats.total_runs / stats.total_balls_faced) * 100).toFixed(2) 
      : "0.00";

  const bowlingEcon = stats.total_overs_bowled > 0 
      ? (stats.total_runs_conceded / stats.total_overs_bowled).toFixed(2) 
      : "0.00";

  const bowlingAvg = stats.total_wickets > 0 
      ? (stats.total_runs_conceded / stats.total_wickets).toFixed(2) 
      : "0.00";

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <Link to="/dashboard" className="text-gray-400 hover:text-white mb-6 inline-block">&larr; Back to Dashboard</Link>

      <div className="max-w-4xl mx-auto">
        {/* Header Profile */}
        <div className="bg-gray-800 rounded-lg p-8 mb-8 flex flex-col md:flex-row items-center gap-6 shadow-2xl border-t-4 border-blue-500">
            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center text-4xl font-bold text-blue-400">
                {stats.full_name.charAt(0)}
            </div>
            <div className="text-center md:text-left">
                <h1 className="text-4xl font-bold">{stats.full_name}</h1>
                <p className="text-gray-400 uppercase tracking-widest">{stats.role} • {stats.branch}</p>
                <div className="mt-4 flex gap-4 justify-center md:justify-start">
                    <div className="bg-gray-700 px-4 py-2 rounded">
                        <span className="block text-xs text-gray-400">MATCHES</span>
                        <span className="font-bold text-xl">{stats.total_matches}</span>
                    </div>
                    <div className="bg-gray-700 px-4 py-2 rounded">
                        <span className="block text-xs text-gray-400">JOINED</span>
                        <span className="font-bold text-xl">{stats.joining_year}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* BATTING CARD */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 shadow-lg">
            <h2 className="text-2xl font-bold text-blue-400 mb-4 border-b border-gray-700 pb-2">🏏 Batting Career</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                    <p className="text-gray-500 text-sm">RUNS</p>
                    <p className="text-3xl font-bold">{stats.total_runs}</p>
                </div>
                <div>
                    <p className="text-gray-500 text-sm">BALLS FACED</p>
                    <p className="text-3xl font-bold">{stats.total_balls_faced}</p>
                </div>
                <div>
                    <p className="text-gray-500 text-sm">STRIKE RATE</p>
                    <p className="text-3xl font-bold text-green-400">{battingSR}</p>
                </div>
                <div>
                    <p className="text-gray-500 text-sm">BOUNDARIES</p>
                    <p className="text-xl font-bold text-yellow-400">{stats.total_fours} (4s) / {stats.total_sixes} (6s)</p>
                </div>
            </div>
        </div>

        {/* BOWLING CARD */}
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-purple-400 mb-4 border-b border-gray-700 pb-2">🎯 Bowling Career</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                    <p className="text-gray-500 text-sm">WICKETS</p>
                    <p className="text-3xl font-bold">{stats.total_wickets}</p>
                </div>
                <div>
                    <p className="text-gray-500 text-sm">OVERS</p>
                    <p className="text-3xl font-bold">{stats.total_overs_bowled}</p>
                </div>
                <div>
                    <p className="text-gray-500 text-sm">ECONOMY</p>
                    <p className="text-3xl font-bold text-green-400">{bowlingEcon}</p>
                </div>
                <div>
                    <p className="text-gray-500 text-sm">MAIDENS</p>
                    <p className="text-3xl font-bold text-gray-300">{stats.total_maidens}</p>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default PlayerCareerStats;