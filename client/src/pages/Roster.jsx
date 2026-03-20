import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../config";

const Roster = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/players`);
        const data = await response.json();
        setPlayers(data);
        setLoading(false);
      } catch (err) {
        console.error(err.message);
        setLoading(false);
      }
    };
    fetchPlayers();
  }, []);

  // Helper for Avatar Color
  const getAvatarColor = (name) => {
    const colors = ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-yellow-500", "bg-teal-500"];
    return colors[name.charCodeAt(0) % colors.length];
  };

  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white tracking-widest animate-pulse">LOADING SQUAD...</div>;

  return (
    <div className="min-h-screen bg-[#0f172a] p-6 md:p-10 text-white relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-900/20 to-gray-900 -z-10"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-7xl mx-auto">
        <Link to="/dashboard" className="text-gray-500 hover:text-white text-xs font-bold tracking-widest uppercase mb-8 inline-block transition">&larr; Locker Room</Link>
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 border-b border-gray-800 pb-6">
            <div>
                <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600 drop-shadow-lg">
                    TEAM ROSTER
                </h1>
                <p className="text-gray-400 mt-2 text-sm">Meet the squad representing the college.</p>
            </div>
            <div className="bg-gray-800 px-4 py-2 rounded-full border border-gray-700 text-xs font-bold text-gray-400 uppercase tracking-wider mt-4 md:mt-0">
                Active Squad: <span className="text-white text-lg ml-1">{players.length}</span>
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {players.map((player) => (
            <div 
              key={player.user_id} 
              className="group relative bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex flex-col items-center text-center">
                
                {/* Glowing Avatar */}
                <div className={`w-20 h-20 ${getAvatarColor(player.full_name)} rounded-full p-0.5 mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <div className="w-full h-full bg-gray-800 rounded-full flex items-center justify-center text-2xl font-black text-white border-4 border-gray-800">
                        {player.full_name.charAt(0)}
                    </div>
                </div>
                
                <h3 className="text-lg font-bold text-white truncate w-full mb-1 group-hover:text-blue-400 transition">{player.full_name}</h3>
                
                <div className="flex gap-2 mb-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${player.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                        {player.role}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-700/50 text-gray-400 border border-gray-600">
                        {player.branch}
                    </span>
                </div>

              </div>

              {/* STATS GRID (Directly Visible) */}
              <div className="mt-2 pt-4 border-t border-gray-700/50 grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-900/50 p-2 rounded-lg">
                      <p className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Matches</p>
                      <p className="text-lg font-black text-white">{player.total_matches}</p>
                  </div>
                  <div className="bg-gray-900/50 p-2 rounded-lg">
                      <p className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Runs</p>
                      <p className="text-lg font-black text-green-400">{player.total_runs}</p>
                  </div>
                  <div className="bg-gray-900/50 p-2 rounded-lg">
                      <p className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Wickets</p>
                      <p className="text-lg font-black text-purple-400">{player.total_wickets}</p>
                  </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Roster;