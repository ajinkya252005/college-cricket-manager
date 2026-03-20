import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const PlayerAttendance = () => {
  const [allLogs, setAllLogs] = useState([]);
  const [filter, setFilter] = useState("all"); // 'all', 'match', 'practice'
  const [stats, setStats] = useState({ 
      matchRate: 0, 
      matchTotal: 0, 
      matchPresent: 0,
      practiceRate: 0, 
      practiceTotal: 0,
      practicePresent: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        const verifyRes = await fetch("${API_BASE_URL}/api/auth/verify", {
            method: "GET",
            headers: { token: localStorage.getItem("token") }
        });
        const user = await verifyRes.json();

        if (user.user_id) {
            const res = await fetch(`${API_BASE_URL}/api/attendance/my/${user.user_id}`);
            const data = await res.json(); 
            setAllLogs(data);

            // Calculate Stats
            const matches = data.filter(l => l.event_type === 'Match Day');
            const practices = data.filter(l => l.event_type !== 'Match Day');

            const matchPresent = matches.filter(l => l.status === 'present').length;
            const practicePresent = practices.filter(l => l.status === 'present').length;

            setStats({
                matchTotal: matches.length,
                matchPresent,
                practiceTotal: practices.length,
                practicePresent,
                matchRate: matches.length === 0 ? 0 : Math.round((matchPresent / matches.length) * 100),
                practiceRate: practices.length === 0 ? 0 : Math.round((practicePresent / practices.length) * 100)
            });
        }
        setLoading(false);

      } catch (err) { console.error(err); setLoading(false); }
    };
    getData();
  }, []);

  // Filter Logic
  const filteredLogs = allLogs.filter(log => {
      if (filter === "match") return log.event_type === 'Match Day';
      if (filter === "practice") return log.event_type !== 'Match Day';
      return true;
  });

  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white tracking-widest animate-pulse">LOADING ATTENDANCE...</div>;

  return (
    <div className="min-h-screen bg-[#0f172a] p-6 md:p-10 text-white relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-teal-900/20 to-gray-900 -z-10"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-600/5 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-5xl mx-auto">
        <Link to="/dashboard" className="text-gray-500 hover:text-white text-xs font-bold tracking-widest uppercase mb-8 inline-block transition">&larr; Locker Room</Link>
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 border-b border-gray-800 pb-6">
            <div>
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-600 drop-shadow-lg">
                    ATTENDANCE LOG
                </h1>
                <p className="text-gray-400 mt-2 text-sm">Your discipline record.</p>
            </div>
        </div>

        {/* STATS OVERVIEW */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            
            {/* Match Card */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 flex items-center justify-between shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                <div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Match Availability</p>
                    <p className={`text-4xl font-black ${stats.matchRate >= 80 ? 'text-green-400' : 'text-yellow-400'}`}>{stats.matchRate}%</p>
                    <p className="text-xs text-gray-500 mt-2">{stats.matchPresent} / {stats.matchTotal} Games</p>
                </div>
                <div className="w-16 h-16 rounded-full border-4 border-gray-700 flex items-center justify-center">
                    <span className="text-2xl">🏆</span>
                </div>
            </div>

            {/* Practice Card */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 flex items-center justify-between shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-teal-500"></div>
                <div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Training Regularity</p>
                    <p className={`text-4xl font-black ${stats.practiceRate >= 75 ? 'text-teal-400' : 'text-orange-400'}`}>{stats.practiceRate}%</p>
                    <p className="text-xs text-gray-500 mt-2">{stats.practicePresent} / {stats.practiceTotal} Sessions</p>
                </div>
                <div className="w-16 h-16 rounded-full border-4 border-gray-700 flex items-center justify-center">
                    <span className="text-2xl">🏋️</span>
                </div>
            </div>

        </div>

        {/* FILTER TABS */}
        <div className="flex gap-4 mb-6 border-b border-gray-800 pb-1">
            {['all', 'match', 'practice'].map(type => (
                <button 
                    key={type}
                    onClick={() => setFilter(type)}
                    className={`px-4 py-2 text-sm font-bold uppercase tracking-wider transition-all ${
                        filter === type 
                        ? 'text-white border-b-2 border-teal-500' 
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                >
                    {type === 'all' ? 'All Logs' : type === 'match' ? 'Matches' : 'Practice'}
                </button>
            ))}
        </div>

        {/* LIST */}
        <div className="space-y-3">
            {filteredLogs.map((log, index) => (
                <div key={index} className="group bg-gray-800/30 border border-gray-700/50 rounded-xl p-4 hover:bg-gray-800 hover:border-gray-600 transition flex items-center justify-between">
                    
                    <div className="flex items-center gap-4">
                        {/* Date Box */}
                        <div className="bg-gray-900 w-14 h-14 rounded-lg flex flex-col items-center justify-center border border-gray-700 group-hover:border-gray-500 transition">
                            <span className="text-[10px] font-bold text-gray-500 uppercase">{new Date(log.final_date).toLocaleString('default', { month: 'short' })}</span>
                            <span className="text-lg font-black text-white">{new Date(log.final_date).getDate()}</span>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${log.event_type === 'Match Day' ? 'bg-green-900/30 text-green-400' : 'bg-teal-900/30 text-teal-400'}`}>
                                    {log.event_type}
                                </span>
                                {log.start_time && <span className="text-xs text-gray-500 font-mono">{log.start_time.slice(0,5)}</span>}
                            </div>
                            <p className="text-sm text-gray-300 font-medium">
                                {log.event_type === 'Match Day' && log.opponent_name 
                                    ? `vs ${log.opponent_name} (${log.tournament_name})` 
                                    : log.description || "No Description"}
                            </p>
                        </div>
                    </div>

                    {/* Status Pill */}
                    <div className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest border ${
                        log.status === 'present' 
                        ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                        {log.status}
                    </div>

                </div>
            ))}

            {filteredLogs.length === 0 && (
                <div className="text-center py-16 bg-gray-800/20 rounded-2xl border border-dashed border-gray-700">
                    <p className="text-gray-500 italic">No records found for this filter.</p>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default PlayerAttendance;