import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const AdminDashboard = ({ setAuth }) => {
  const [stats, setStats] = useState({
    pendingPlayers: 0,
    totalPlayers: 0,
    upcomingMatches: 0,
    fundBalance: 0
  });
  const [loading, setLoading] = useState(true);

  // --- FETCH LIVE STATS ---
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        // Parallel fetching for speed
        const [pendingRes, playersRes, matchesRes, fundsRes] = await Promise.all([
            fetch("${API_BASE_URL}/api/players/pending"),
            fetch("${API_BASE_URL}/api/players"),
            fetch("${API_BASE_URL}/api/matches"),
            fetch("${API_BASE_URL}/api/finance/funds")
        ]);

        const pending = await pendingRes.json();
        const players = await playersRes.json();
        const matches = await matchesRes.json();
        const funds = await fundsRes.json();

        // Calculate Logic
        const upcoming = matches.filter(m => new Date(m.match_date) > new Date()).length;

        setStats({
            pendingPlayers: pending.length,
            totalPlayers: players.length,
            upcomingMatches: upcoming,
            fundBalance: funds.balance || 0
        });
        setLoading(false);

      } catch (err) {
        console.error("Error loading dashboard stats");
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  const logout = (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    setAuth(false);
    toast.success("Logged out successfully");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 md:p-12 relative overflow-hidden">
      
      {/* Background Decor (Subtle Glows) */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              ADMIN COMMAND CENTER
            </h1>
            <p className="text-gray-400 mt-2 text-sm uppercase tracking-widest">System Operational • Welcome Captain</p>
          </div>
          <button
            onClick={(e) => logout(e)}
            className="mt-4 md:mt-0 px-6 py-2 rounded-full bg-red-600 bg-opacity-20 border border-red-600 text-red-400 hover:bg-red-600 hover:text-white transition-all duration-300 font-bold text-sm uppercase tracking-wider"
          >
            Terminate Session
          </button>
        </div>

        {/* LIVE TELEMETRY ROW */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            
            {/* Card 1: Squad Strength */}
            <div className="bg-gray-800 bg-opacity-50 border border-gray-700 p-6 rounded-xl backdrop-blur-sm">
                <p className="text-gray-400 text-xs font-bold uppercase mb-1">Active Squad</p>
                <p className="text-3xl font-bold text-white">{stats.totalPlayers}</p>
                <div className="w-full bg-gray-700 h-1 mt-3 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full" style={{ width: '70%' }}></div>
                </div>
            </div>

            {/* Card 2: Treasury */}
            <div className="bg-gray-800 bg-opacity-50 border border-gray-700 p-6 rounded-xl backdrop-blur-sm">
                <p className="text-gray-400 text-xs font-bold uppercase mb-1">Team Treasury</p>
                <p className="text-3xl font-bold text-green-400">₹{stats.fundBalance}</p>
                <div className="w-full bg-gray-700 h-1 mt-3 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full" style={{ width: '100%' }}></div>
                </div>
            </div>

             {/* Card 3: Pending Actions */}
             <div className={`bg-gray-800 bg-opacity-50 border p-6 rounded-xl backdrop-blur-sm transition-all ${stats.pendingPlayers > 0 ? 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'border-gray-700'}`}>
                <p className="text-gray-400 text-xs font-bold uppercase mb-1">Pending Approvals</p>
                <div className="flex items-center gap-3">
                    <p className={`text-3xl font-bold ${stats.pendingPlayers > 0 ? 'text-yellow-400' : 'text-white'}`}>{stats.pendingPlayers}</p>
                    {stats.pendingPlayers > 0 && <span className="animate-pulse w-2 h-2 bg-yellow-500 rounded-full"></span>}
                </div>
                <div className="w-full bg-gray-700 h-1 mt-3 rounded-full overflow-hidden">
                    <div className={`h-full ${stats.pendingPlayers > 0 ? 'bg-yellow-500' : 'bg-gray-500'}`} style={{ width: stats.pendingPlayers > 0 ? '100%' : '0%' }}></div>
                </div>
            </div>

            {/* Card 4: Schedule */}
            <div className="bg-gray-800 bg-opacity-50 border border-gray-700 p-6 rounded-xl backdrop-blur-sm">
                <p className="text-gray-400 text-xs font-bold uppercase mb-1">Upcoming Games</p>
                <p className="text-3xl font-bold text-blue-300">{stats.upcomingMatches}</p>
                 <div className="w-full bg-gray-700 h-1 mt-3 rounded-full overflow-hidden">
                    <div className="bg-blue-400 h-full" style={{ width: `${stats.upcomingMatches * 20}%` }}></div>
                </div>
            </div>
        </div>

        {/* MAIN CONTROL GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* 1. PLAYER MANAGER */}
            <Link to="/admin/players" className="group relative bg-gray-800 rounded-2xl p-8 border border-gray-700 hover:border-blue-500 transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="text-9xl font-black text-white">01</span>
                </div>
                <div className="relative z-10">
                    <h3 className="text-2xl font-bold text-blue-400 mb-2 group-hover:text-blue-300">Player Manager</h3>
                    <p className="text-gray-400 text-sm mb-6 h-10">Approve new registrations, manage active roster, and archive alumni.</p>
                    <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-500 border border-blue-900 bg-blue-900 bg-opacity-30 px-3 py-1 rounded group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        Access Module &rarr;
                    </span>
                </div>
            </Link>

            {/* 2. MATCH CENTER */}
            <Link to="/admin/matches" className="group relative bg-gray-800 rounded-2xl p-8 border border-gray-700 hover:border-green-500 transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="text-9xl font-black text-white">02</span>
                </div>
                <div className="relative z-10">
                    <h3 className="text-2xl font-bold text-green-400 mb-2 group-hover:text-green-300">Match Control</h3>
                    <p className="text-gray-400 text-sm mb-6 h-10">Schedule fixtures, manage live scorecards, and update results.</p>
                    <span className="inline-block text-xs font-bold uppercase tracking-widest text-green-500 border border-green-900 bg-green-900 bg-opacity-30 px-3 py-1 rounded group-hover:bg-green-600 group-hover:text-white transition-colors">
                        Enter Arena &rarr;
                    </span>
                </div>
            </Link>

             {/* 3. FINANCE VAULT */}
             <Link to="/admin/finance" className="group relative bg-gray-800 rounded-2xl p-8 border border-gray-700 hover:border-purple-500 transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="text-9xl font-black text-white">03</span>
                </div>
                <div className="relative z-10">
                    <h3 className="text-2xl font-bold text-purple-400 mb-2 group-hover:text-purple-300">Finance Vault</h3>
                    <p className="text-gray-400 text-sm mb-6 h-10">Track ledger, manage billing, and monitor the team treasury.</p>
                    <span className="inline-block text-xs font-bold uppercase tracking-widest text-purple-500 border border-purple-900 bg-purple-900 bg-opacity-30 px-3 py-1 rounded group-hover:bg-purple-600 group-hover:text-white transition-colors">
                        Open Vault &rarr;
                    </span>
                </div>
            </Link>

            {/* 4. TOURNAMENT HUB */}
            <Link to="/admin/tournaments" className="group relative bg-gray-800 rounded-2xl p-8 border border-gray-700 hover:border-yellow-500 transition-all duration-300 hover:shadow-[0_0_30px_rgba(234,179,8,0.15)] overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="text-9xl font-black text-white">04</span>
                </div>
                <div className="relative z-10">
                    <h3 className="text-2xl font-bold text-yellow-400 mb-2 group-hover:text-yellow-300">Tournament Hub</h3>
                    <p className="text-gray-400 text-sm mb-6 h-10">Create series, manage squads, and track trophy progress.</p>
                    <span className="inline-block text-xs font-bold uppercase tracking-widest text-yellow-500 border border-yellow-900 bg-yellow-900 bg-opacity-30 px-3 py-1 rounded group-hover:bg-yellow-600 group-hover:text-white transition-colors">
                        Manage Series &rarr;
                    </span>
                </div>
            </Link>

            {/* 5. ATTENDANCE LOG */}
            <Link to="/admin/attendance" className="group relative bg-gray-800 rounded-2xl p-8 border border-gray-700 hover:border-teal-500 transition-all duration-300 hover:shadow-[0_0_30px_rgba(20,184,166,0.15)] overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="text-9xl font-black text-white">05</span>
                </div>
                <div className="relative z-10">
                    <h3 className="text-2xl font-bold text-teal-400 mb-2 group-hover:text-teal-300">Attendance Log</h3>
                    <p className="text-gray-400 text-sm mb-6 h-10">Track practice discipline and match day availability.</p>
                    <span className="inline-block text-xs font-bold uppercase tracking-widest text-teal-500 border border-teal-900 bg-teal-900 bg-opacity-30 px-3 py-1 rounded group-hover:bg-teal-600 group-hover:text-white transition-colors">
                        View Register &rarr;
                    </span>
                </div>
            </Link>

        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;