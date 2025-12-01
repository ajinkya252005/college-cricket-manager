import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const TeamStats = () => {
  const [headline, setHeadline] = useState(null);
  const [leaders, setLeaders] = useState({ batting: [], bowling: [] });
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        const [statsRes, leadersRes, tournRes] = await Promise.all([
            fetch("http://localhost:5000/api/team/stats"),
            fetch("http://localhost:5000/api/team/leaderboard"),
            fetch("http://localhost:5000/api/team/tournaments")
        ]);

        setHeadline(await statsRes.json());
        setLeaders(await leadersRes.json());
        setTournaments(await tournRes.json());
        setLoading(false);
      } catch (err) { console.error(err); setLoading(false); }
    };
    getData();
  }, []);

  // Helper for Podium Colors
  const getRankStyle = (index) => {
      switch(index) {
          case 0: return "border-yellow-500/50 bg-yellow-500/10 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.2)]"; // Gold
          case 1: return "border-gray-400/50 bg-gray-400/10 text-gray-300"; // Silver
          case 2: return "border-orange-700/50 bg-orange-700/10 text-orange-400"; // Bronze
          default: return "border-gray-700 bg-gray-800/50 text-gray-400";
      }
  };

  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white tracking-widest animate-pulse font-bold">LOADING TEAM DATA...</div>;

  return (
    <div className="min-h-screen bg-[#0f172a] p-6 md:p-10 text-white relative overflow-x-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-indigo-900/20 to-gray-900 -z-10"></div>
      <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-7xl mx-auto">
        <Link to="/dashboard" className="text-gray-500 hover:text-white text-xs font-bold tracking-widest uppercase mb-8 inline-block transition">&larr; Locker Room</Link>
        
        <div className="mb-12 text-center">
            <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 drop-shadow-2xl mb-2">
                TEAM HQ
            </h1>
            <p className="text-gray-400 uppercase tracking-widest text-sm">Official Performance Center</p>
        </div>

        {/* 1. HERO STATS (Wins/Losses) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-2xl text-center backdrop-blur-sm">
                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Matches Played</p>
                <p className="text-4xl font-black text-white">{headline.total_matches}</p>
            </div>
            <div className="bg-green-900/20 border border-green-500/30 p-6 rounded-2xl text-center backdrop-blur-sm">
                <p className="text-green-400 text-xs font-bold uppercase tracking-wider mb-2">Won</p>
                <p className="text-4xl font-black text-green-400">{headline.wins}</p>
            </div>
            <div className="bg-red-900/20 border border-red-500/30 p-6 rounded-2xl text-center backdrop-blur-sm">
                <p className="text-red-400 text-xs font-bold uppercase tracking-wider mb-2">Lost</p>
                <p className="text-4xl font-black text-red-400">{headline.losses}</p>
            </div>
            <div className="bg-blue-900/20 border border-blue-500/30 p-6 rounded-2xl text-center backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                <p className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">Win Rate</p>
                <p className="text-4xl font-black text-blue-400">{headline.win_rate}%</p>
            </div>
        </div>

        {/* 2. LEADERBOARDS (Hall of Fame) */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
            
            {/* Batting Leaders */}
            <div className="bg-gray-800/30 border border-gray-700 rounded-3xl p-8 shadow-xl">
                <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
                    <span className="text-3xl">🏏</span> Top Run Scorers
                </h2>
                <div className="space-y-4">
                    {leaders.batting.map((p, i) => (
                        <div key={p.user_id} className={`flex items-center justify-between p-4 rounded-xl border ${getRankStyle(i)} transition-transform hover:scale-[1.02]`}>
                            <div className="flex items-center gap-4">
                                <span className="font-black text-xl opacity-50 w-6">#{i+1}</span>
                                <div>
                                    <p className="font-bold text-lg">{p.full_name}</p>
                                    <p className="text-[10px] uppercase tracking-wider opacity-70">{p.total_matches} Matches</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-black">{p.total_runs}</p>
                                <p className="text-[10px] uppercase tracking-wider opacity-70">Runs</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bowling Leaders */}
            <div className="bg-gray-800/30 border border-gray-700 rounded-3xl p-8 shadow-xl">
                <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
                    <span className="text-3xl">🎯</span> Top Wicket Takers
                </h2>
                <div className="space-y-4">
                    {leaders.bowling.map((p, i) => (
                        <div key={p.user_id} className={`flex items-center justify-between p-4 rounded-xl border ${getRankStyle(i)} transition-transform hover:scale-[1.02]`}>
                            <div className="flex items-center gap-4">
                                <span className="font-black text-xl opacity-50 w-6">#{i+1}</span>
                                <div>
                                    <p className="font-bold text-lg">{p.full_name}</p>
                                    <p className="text-[10px] uppercase tracking-wider opacity-70">{p.total_matches} Matches</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-black">{p.total_wickets}</p>
                                <p className="text-[10px] uppercase tracking-wider opacity-70">Wickets</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>

        {/* 3. TOURNAMENT PERFORMANCE */}
        <div className="bg-gray-800/40 border border-gray-700 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
                <span className="text-3xl">🏆</span> Series Performance
            </h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-700">
                            <th className="pb-4 pl-2">Tournament</th>
                            <th className="pb-4 text-center">Matches</th>
                            <th className="pb-4 text-center">Won</th>
                            <th className="pb-4 text-center">Lost</th>
                            <th className="pb-4 text-right pr-2">Win %</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/50">
                        {tournaments.map((t, i) => {
                            const rate = t.matches > 0 ? Math.round((t.wins / t.matches) * 100) : 0;
                            return (
                                <tr key={i} className="group hover:bg-gray-700/30 transition">
                                    <td className="py-4 pl-2 font-bold text-white group-hover:text-blue-400">{t.name}</td>
                                    <td className="py-4 text-center text-gray-300">{t.matches}</td>
                                    <td className="py-4 text-center text-green-400 font-bold">{t.wins}</td>
                                    <td className="py-4 text-center text-red-400 font-bold">{t.losses}</td>
                                    <td className="py-4 text-right pr-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${rate >= 50 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                            {rate}%
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>

      </div>
    </div>
  );
};

export default TeamStats;