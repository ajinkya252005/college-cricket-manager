import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";

const AdminSquad = () => {
  const { id } = useParams(); // Tournament ID
  const [allPlayers, setAllPlayers] = useState([]);
  const [squad, setSquad] = useState([]);
  const [isLocked, setIsLocked] = useState(false); // True if matches exist

  // Fetch Data
  const fetchData = async () => {
    try {
      // 1. Get all players
      const playersRes = await fetch("https://cricket-api-ll8u.onrender.com/api/players");
      const playersData = await playersRes.json();

      // 2. Get current squad
      const squadRes = await fetch(`https://cricket-api-ll8u.onrender.com/api/tournaments/${id}/squad`);
      const squadData = await squadRes.json();

      // 3. CHECK IF LOCKED (Are there matches?)
      // We reuse the matches API. Ideally we'd have a specific endpoint, 
      // but filtering the full match list works fine for now.
      const matchRes = await fetch("https://cricket-api-ll8u.onrender.com/api/matches");
      const matchData = await matchRes.json();
      // Check if any match belongs to THIS tournament
      const hasMatches = matchData.some(m => m.tournament_id === parseInt(id));
      setIsLocked(hasMatches);

      setAllPlayers(playersData);
      setSquad(squadData);
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Add to Squad
  const addToSquad = async (userId) => {
    try {
      const response = await fetch(`https://cricket-api-ll8u.onrender.com/api/tournaments/${id}/squad`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });

      if (response.ok) {
        toast.success("Player Added!");
        fetchData();
      } else {
        toast.error("Could not add player");
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  // Remove from Squad (New Function)
  const removeFromSquad = async (userId) => {
    if(!window.confirm("Remove this player from the squad?")) return;

    try {
        const response = await fetch(`https://cricket-api-ll8u.onrender.com/api/tournaments/${id}/squad/${userId}`, {
            method: "DELETE"
        });

        if (response.ok) {
            toast.warn("Player Removed");
            fetchData();
        } else {
            const errorText = await response.json();
            toast.error(errorText); // Show the "Matches Scheduled" error
        }
    } catch (err) {
        console.error(err.message);
    }
  };

  // Filter Available Players
  const availablePlayers = allPlayers.filter(
    (p) => !squad.some((s) => s.user_id === p.user_id)
  );

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      <Link to="/admin/tournaments" className="text-gray-400 hover:text-white mb-4 inline-block">
        &larr; Back to Tournaments
      </Link>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-yellow-400">🛡️ Manage Squad</h1>
        {isLocked && (
            <div className="bg-red-900 text-red-200 px-4 py-2 rounded border border-red-500 text-sm font-bold animate-pulse">
                🔒 Squad Locked (Matches Scheduled)
            </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        
        {/* LEFT: Available Players */}
        <div className="rounded-lg bg-gray-800 p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-bold text-blue-300">Available Players</h2>
          <div className="max-h-96 overflow-y-auto">
            {availablePlayers.length === 0 ? <p className="text-gray-500">No players available.</p> : null}
            {availablePlayers.map((player) => (
              <div key={player.user_id} className="mb-2 flex items-center justify-between rounded bg-gray-700 p-3 hover:bg-gray-600 transition">
                <span>{player.full_name} <span className="text-xs text-gray-400">({player.player_id})</span></span>
                <button 
                  onClick={() => addToSquad(player.user_id)}
                  className="rounded bg-green-600 px-3 py-1 text-sm font-bold hover:bg-green-500"
                >
                  Add +
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Selected Squad */}
        <div className={`rounded-lg p-6 shadow-lg border ${isLocked ? 'bg-gray-800 border-red-900' : 'bg-gray-800 border-yellow-600'}`}>
          <h2 className="mb-4 text-xl font-bold text-yellow-400 flex justify-between">
              Current Squad 
              <span className="bg-gray-700 text-white text-xs px-2 py-1 rounded-full">{squad.length} Players</span>
          </h2>
          
          <div className="max-h-96 overflow-y-auto">
             {squad.length === 0 ? <p className="text-gray-500">Squad is empty.</p> : null}
             {squad.map((player) => (
              <div key={player.user_id} className="mb-2 flex items-center justify-between rounded bg-gray-700 p-3 border-l-4 border-yellow-500">
                <span>{player.full_name}</span>
                
                {/* Remove Button (Hidden if Locked) */}
                {!isLocked ? (
                    <button 
                        onClick={() => removeFromSquad(player.user_id)}
                        className="text-red-400 hover:text-red-200 font-bold px-2"
                        title="Remove from Squad"
                    >
                        ✕
                    </button>
                ) : (
                    <span className="text-gray-500 text-xs italic">Locked</span>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminSquad;