import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";

const AdminSquad = () => {
  const { id } = useParams(); // Get tournament ID from URL
  const [allPlayers, setAllPlayers] = useState([]);
  const [squad, setSquad] = useState([]);

  // Fetch Data
  const fetchData = async () => {
    try {
      // 1. Get all players
      const playersRes = await fetch("http://localhost:5000/api/players");
      const playersData = await playersRes.json();

      // 2. Get current squad
      const squadRes = await fetch(`http://localhost:5000/api/tournaments/${id}/squad`);
      const squadData = await squadRes.json();

      setAllPlayers(playersData);
      setSquad(squadData);
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Add to Squad Function
  const addToSquad = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tournaments/${id}/squad`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });

      if (response.ok) {
        toast.success("Player Added!");
        fetchData(); // Refresh lists
      } else {
        toast.error("Could not add player");
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  // Filter: Don't show players in the "Available" list if they are already in the "Squad"
  const availablePlayers = allPlayers.filter(
    (p) => !squad.some((s) => s.user_id === p.user_id)
  );

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      <Link to="/admin/tournaments" className="text-gray-400 hover:text-white mb-4 inline-block">
        &larr; Back to Tournaments
      </Link>
      
      <h1 className="mb-6 text-3xl font-bold text-yellow-400">🛡️ Manage Squad</h1>

      <div className="grid gap-6 md:grid-cols-2">
        
        {/* LEFT: Available Players */}
        <div className="rounded-lg bg-gray-800 p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-bold text-blue-300">Available Players</h2>
          <div className="max-h-96 overflow-y-auto">
            {availablePlayers.length === 0 ? <p className="text-gray-500">No players available.</p> : null}
            {availablePlayers.map((player) => (
              <div key={player.user_id} className="mb-2 flex items-center justify-between rounded bg-gray-700 p-3">
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
        <div className="rounded-lg bg-gray-800 p-6 shadow-lg border border-yellow-600">
          <h2 className="mb-4 text-xl font-bold text-yellow-400">Current Squad ({squad.length})</h2>
          <div className="max-h-96 overflow-y-auto">
             {squad.length === 0 ? <p className="text-gray-500">Squad is empty.</p> : null}
             {squad.map((player) => (
              <div key={player.user_id} className="mb-2 flex items-center justify-between rounded bg-gray-700 p-3 border-l-4 border-yellow-500">
                <span>{player.full_name}</span>
                <span className="text-xs text-green-400 font-bold">SELECTED</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminSquad;