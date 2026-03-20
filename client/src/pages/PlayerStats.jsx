import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const PlayerStats = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getHistory = async () => {
      try {
        const verifyRes = await fetch("${API_BASE_URL}/api/auth/verify", {
            method: "GET",
            headers: { token: localStorage.getItem("token") }
        });
        const user = await verifyRes.json();

        if (user.user_id) { 
            const historyRes = await fetch(`${API_BASE_URL}/api/matches/user/${user.user_id}`);
            const historyData = await historyRes.json();
            setHistory(historyData);
        }
        setLoading(false);

      } catch (err) {
        console.error(err.message);
        setLoading(false);
      }
    };

    getHistory();
  }, []);

  // Helper to guess result color based on text analysis
  const getResultStyle = (text) => {
      if(!text) return "bg-gray-800 text-gray-400 border-gray-700";
      const lower = text.toLowerCase();
      if(lower.includes("won")) return "bg-green-500/10 text-green-400 border-green-500/30";
      if(lower.includes("lost")) return "bg-red-500/10 text-red-400 border-red-500/30";
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
  };

  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white tracking-widest animate-pulse">LOADING HISTORY...</div>;

  return (
    <div className="min-h-screen bg-[#0f172a] p-6 md:p-10 text-white relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-full h-96 bg-gradient-to-b from-green-900/10 to-gray-900 -z-10"></div>
      
      <div className="max-w-5xl mx-auto">
        <Link to="/dashboard" className="text-gray-500 hover:text-white text-xs font-bold tracking-widest uppercase mb-8 inline-block transition">&larr; Locker Room</Link>
        
        <div className="flex justify-between items-end mb-10 border-b border-gray-800 pb-6">
            <div>
                <h1 className="text-4xl font-black text-white tracking-tight">
                    MATCH LOG
                </h1>
                <p className="text-gray-400 mt-2 text-sm">Your complete playing history.</p>
            </div>
            <div className="bg-gray-800 px-4 py-2 rounded-full border border-gray-700 text-xs font-bold text-gray-400 uppercase tracking-wider">
                {history.length} Matches
            </div>
        </div>

        <div className="space-y-4">
            {history.map((match, index) => (
                <div key={index} className="group bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-green-500/50 hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300 relative overflow-hidden">
                    
                    {/* Date Badge */}
                    <div className="absolute top-0 left-0 bg-gray-800 border-b border-r border-gray-700 px-4 py-2 rounded-br-xl text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        {new Date(match.match_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>

                    <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-6">
                        
                        {/* Match Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-2xl font-black text-white">VS {match.opponent_name}</span>
                                <span className="px-2 py-0.5 rounded bg-gray-700 text-[10px] font-bold text-gray-400 uppercase">{match.tournament_name}</span>
                            </div>
                            <div className={`inline-block px-3 py-1 rounded-lg border text-xs font-bold uppercase tracking-wide ${getResultStyle(match.result)}`}>
                                {match.result}
                            </div>
                        </div>

                        {/* Personal Stats */}
                        <div className="flex gap-4">
                            <div className="bg-gray-900/80 px-5 py-3 rounded-xl border border-gray-700 text-center min-w-[80px]">
                                <p className="text-[10px] text-gray-500 uppercase font-bold">Runs</p>
                                <p className={`text-2xl font-black ${match.runs_scored >= 50 ? 'text-green-400' : 'text-white'}`}>{match.runs_scored}</p>
                            </div>
                            <div className="bg-gray-900/80 px-5 py-3 rounded-xl border border-gray-700 text-center min-w-[80px]">
                                <p className="text-[10px] text-gray-500 uppercase font-bold">Wickets</p>
                                <p className={`text-2xl font-black ${match.wickets_taken >= 3 ? 'text-purple-400' : 'text-white'}`}>{match.wickets_taken}</p>
                            </div>
                        </div>

                        {/* Action */}
                        <Link 
                            to={`/match/${match.match_id}`}
                            className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg transition-transform transform group-hover:scale-105"
                        >
                            Full Scorecard &rarr;
                        </Link>

                    </div>
                </div>
            ))}
            {history.length === 0 && (
                <div className="text-center py-20 text-gray-500 italic">
                    No matches played yet. Go practice! 🏏
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default PlayerStats;