import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, Area, ComposedChart
} from 'recharts';

const PlayerCareerStats = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        const verifyRes = await fetch("https://cricket-api-ll8u.onrender.com/api/auth/verify", {
            method: "GET",
            headers: { token: localStorage.getItem("token") }
        });
        const user = await verifyRes.json();

        if(user.user_id) {
            const statsRes = await fetch(`https://cricket-api-ll8u.onrender.com/api/players/stats/rich/${user.user_id}`);
            const statsData = await statsRes.json();
            setData(statsData);
        }
        setLoading(false);
      } catch (err) { console.error(err); setLoading(false); }
    };
    getData();
  }, []);

  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white font-bold tracking-widest animate-pulse">LOADING ANALYTICS...</div>;
  if (!data) return null;

  const { profile, batting, best_bowling, recent } = data;

  // --- MATH ---
  const battingAvg = (parseInt(batting.innings_played) - parseInt(batting.not_outs)) > 0
      ? (profile.total_runs / (parseInt(batting.innings_played) - parseInt(batting.not_outs))).toFixed(2)
      : profile.total_runs; 

  const battingSR = profile.total_balls_faced > 0 
      ? ((profile.total_runs / profile.total_balls_faced) * 100).toFixed(2) : "0.00";

  const bowlingAvg = profile.total_wickets > 0 
      ? (profile.total_runs_conceded / profile.total_wickets).toFixed(2) : "0.00";

  const bowlingSR = profile.total_wickets > 0
      ? ((profile.total_overs_bowled * 6) / profile.total_wickets).toFixed(2) : "0.00";

  const bowlingEcon = profile.total_overs_bowled > 0 
      ? (profile.total_runs_conceded / profile.total_overs_bowled).toFixed(2) : "0.00";

  // --- GRAPH DATA ---
  const graphData = recent ? recent.map((m, i) => ({
      name: m.opponent_name ? m.opponent_name.split(' ')[0] : `M${i+1}`,
      Runs: m.runs_scored,
      Wickets: m.wickets_taken,
      isOut: m.is_out
  })) : [];

  // --- UI COMPONENTS ---
  const StatBox = ({ label, value, color = "text-white", subLabel }) => (
      <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-4 hover:border-gray-600 transition duration-300 group">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 group-hover:text-gray-400 transition">{label}</p>
          <p className={`text-2xl font-black ${color}`}>{value}</p>
          {subLabel && <p className="text-[10px] text-gray-600 mt-1">{subLabel}</p>}
      </div>
  );

  // Helper for Avatar Color
  const getAvatarColor = (n) => {
    if(!n) return "bg-gray-600";
    const colors = ["from-red-500 to-orange-600", "from-blue-500 to-cyan-600", "from-green-500 to-emerald-600", "from-purple-500 to-pink-600", "from-yellow-500 to-amber-600"];
    return colors[n.charCodeAt(0) % colors.length];
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-4 md:p-10 relative overflow-x-hidden">
      
      {/* Ambient Background */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-900/20 via-gray-900/50 to-gray-900 -z-10"></div>
      <div className="absolute top-[-100px] right-[-100px] w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-[-100px] w-96 h-96 bg-purple-600/10 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-7xl mx-auto">
        <Link to="/dashboard" className="text-gray-500 hover:text-white text-xs font-bold tracking-widest uppercase mb-6 inline-block transition">&larr; Locker Room</Link>

        {/* 1. HERO PROFILE */}
        <div className="relative bg-gray-800/40 backdrop-blur-xl border border-gray-700 rounded-3xl p-8 md:p-10 shadow-2xl mb-10 overflow-hidden">
            {/* Decorative Line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
            
            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                {/* Avatar */}
                <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${getAvatarColor(profile.full_name)} p-1 shadow-2xl`}>
                    <div className="w-full h-full bg-gray-900 rounded-full flex items-center justify-center text-5xl font-black text-white">
                        {profile.full_name.charAt(0)}
                    </div>
                </div>
                
                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2">{profile.full_name}</h1>
                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                        <span className="px-3 py-1 rounded-full bg-gray-700/50 border border-gray-600 text-xs font-bold uppercase text-gray-300">{profile.role}</span>
                        <span className="px-3 py-1 rounded-full bg-gray-700/50 border border-gray-600 text-xs font-bold uppercase text-gray-300">{profile.branch}</span>
                        <span className="px-3 py-1 rounded-full bg-blue-900/30 border border-blue-500/30 text-xs font-bold uppercase text-blue-400">Year {profile.year_of_study}</span>
                    </div>
                </div>

                {/* Hero Stats */}
                <div className="flex gap-6 border-t md:border-t-0 md:border-l border-gray-700 pt-6 md:pt-0 md:pl-8 mt-6 md:mt-0">
                    <div className="text-center">
                        <p className="text-3xl font-black text-white">{profile.total_matches}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Matches</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-black text-green-400">{profile.total_runs}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Runs</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-black text-purple-400">{profile.total_wickets}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Wickets</p>
                    </div>
                </div>
            </div>
        </div>

        {/* 2. GRAPHS ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            
            {/* Batting Graph */}
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-3xl p-6 shadow-xl backdrop-blur-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-6 bg-green-500 rounded-full"></span> Batting Form
                    </h3>
                    <span className="text-[10px] text-gray-500 uppercase font-bold bg-gray-900 px-2 py-1 rounded">Last 5 Innings</span>
                </div>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={graphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRuns" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                            <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                            <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px' }} 
                                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                            />
                            <Area type="monotone" dataKey="Runs" stroke="#10b981" fillOpacity={1} fill="url(#colorRuns)" strokeWidth={3} />
                            <Line type="monotone" dataKey="Runs" stroke="#34d399" strokeWidth={2} dot={{ r: 4, fill: '#0f172a', stroke: '#34d399', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Bowling Graph */}
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-3xl p-6 shadow-xl backdrop-blur-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-6 bg-purple-500 rounded-full"></span> Bowling Form
                    </h3>
                    <span className="text-[10px] text-gray-500 uppercase font-bold bg-gray-900 px-2 py-1 rounded">Last 5 Innings</span>
                </div>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={graphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                            <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                            <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px' }} 
                                cursor={{fill: 'rgba(255,255,255,0.05)'}}
                            />
                            <Bar dataKey="Wickets" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>

        {/* 3. DETAILED STATS GRIDS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* BATTING */}
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-3xl p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-600"></div>
                <h2 className="text-xl font-black text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                    <span className="text-2xl">🏏</span> Batting Analytics
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <StatBox label="Average" value={battingAvg} color="text-white" />
                    <StatBox label="Strike Rate" value={battingSR} color="text-green-400" />
                    <StatBox label="Highest Score" value={batting.highest_score || 0} color="text-yellow-400" />
                    <StatBox label="Boundaries" value={parseInt(profile.total_fours) + parseInt(profile.total_sixes)} subLabel={`${profile.total_fours} (4s) • ${profile.total_sixes} (6s)`} />
                    <StatBox label="Innings" value={batting.innings_played} />
                    <StatBox label="Not Outs" value={batting.not_outs} />
                    <StatBox label="100s / 50s" value={`${batting.hundreds} / ${batting.fifties}`} color="text-blue-300" />
                    <StatBox label="Balls Faced" value={profile.total_balls_faced} />
                    <StatBox label="Ducks" value={batting.ducks} color="text-red-400" />
                </div>
            </div>

            {/* BOWLING */}
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-3xl p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-pink-600"></div>
                <h2 className="text-xl font-black text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                    <span className="text-2xl">🎯</span> Bowling Analytics
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <StatBox label="Wickets" value={profile.total_wickets} color="text-purple-400" />
                    <StatBox label="Economy" value={bowlingEcon} color="text-green-400" />
                    <StatBox label="Best (BBI)" value={`${best_bowling.wickets_taken}/${best_bowling.runs_conceded}`} color="text-yellow-400" />
                    <StatBox label="Average" value={bowlingAvg} />
                    <StatBox label="Strike Rate" value={bowlingSR} />
                    <StatBox label="Maidens" value={profile.total_maidens} color="text-blue-300" />
                    <StatBox label="Overs" value={profile.total_overs_bowled} />
                    <StatBox label="Runs Given" value={profile.total_runs_conceded} />
                </div>
            </div>

        </div>

      </div>
    </div>
  );
};

export default PlayerCareerStats;