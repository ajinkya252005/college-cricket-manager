import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const AdminScorecard = () => {
  const { id } = useParams(); // Match ID
  const navigate = useNavigate();

  const [matchDetails, setMatchDetails] = useState({});
  const [squad, setSquad] = useState([]);
  const [result, setResult] = useState("");
  
  // This object will hold the stats input: { user_id: { runs: 0, wickets: 0 } }
  const [inputStats, setInputStats] = useState({});

  // 1. Fetch Match Info & The Squad involved
  useEffect(() => {
    const fetchInfo = async () => {
      try {
        // Get Match Info
        const matchRes = await fetch(`http://localhost:5000/api/matches/${id}`);
        const matchData = await matchRes.json();
        setMatchDetails(matchData);

        // Get Squad for that Tournament
        // Note: matchData.tournament_id is needed here
        if (matchData.tournament_id) {
            const squadRes = await fetch(`http://localhost:5000/api/tournaments/${matchData.tournament_id}/squad`);
            const squadData = await squadRes.json();
            setSquad(squadData);
            
            // Initialize input state for each player
            const initialStats = {};
            squadData.forEach(p => {
                initialStats[p.user_id] = { runs: 0, wickets: 0, played: false };
            });
            setInputStats(initialStats);
        }

      } catch (err) {
        console.error(err.message);
      }
    };
    fetchInfo();
  }, [id]);

  // Handle Input Change
  const handleStatChange = (userId, field, value) => {
    setInputStats(prev => ({
        ...prev,
        [userId]: {
            ...prev[userId],
            [field]: parseInt(value) || 0 // Ensure it's a number
        }
    }));
  };

  // Toggle "Played" Checkbox
  const handlePlayedToggle = (userId) => {
    setInputStats(prev => ({
        ...prev,
        [userId]: {
            ...prev[userId],
            played: !prev[userId].played
        }
    }));
  };

  // Submit Logic
  const onSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Filter only players who were marked as "Played"
    const playersToSubmit = squad
        .filter(p => inputStats[p.user_id]?.played)
        .map(p => ({
            user_id: p.user_id,
            runs: inputStats[p.user_id].runs,
            wickets: inputStats[p.user_id].wickets
        }));

    if(playersToSubmit.length === 0) {
        return toast.warning("Select at least one player!");
    }

    try {
        const body = { result, player_stats: playersToSubmit };
        
        const response = await fetch(`http://localhost:5000/api/matches/${id}/scorecard`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        if (response.ok) {
            toast.success("Scorecard Saved & Stats Updated!");
            navigate("/admin/matches");
        } else {
            toast.error("Failed to update stats");
        }

    } catch (err) {
        console.error(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      <Link to="/admin/matches" className="text-gray-400 hover:text-white mb-4 inline-block">&larr; Back to Matches</Link>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-green-400">📝 Enter Scorecard</h1>
        <div className="text-right">
            <h2 className="text-xl font-bold">{matchDetails.opponent_name}</h2>
            <p className="text-gray-400">{new Date(matchDetails.match_date).toDateString()}</p>
        </div>
      </div>

      <form onSubmit={onSubmit}>
        {/* Match Result Input */}
        <div className="bg-gray-800 p-6 rounded-lg mb-6 shadow-lg">
            <label className="block text-sm font-bold mb-2">Match Result (Summary)</label>
            <input 
                type="text" 
                placeholder="e.g. Won by 20 Runs" 
                className="w-full p-2 rounded bg-gray-700 text-white"
                value={result}
                onChange={e => setResult(e.target.value)}
                required
            />
        </div>

        {/* Player Stats Grid */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Squad Performance</h3>
            <div className="grid gap-4">
                {squad.map(player => (
                    <div key={player.user_id} className={`flex items-center justify-between p-3 rounded ${inputStats[player.user_id]?.played ? 'bg-gray-700 border-l-4 border-green-500' : 'bg-gray-700 opacity-50'}`}>
                        
                        {/* Checkbox for "Did they play?" */}
                        <div className="flex items-center gap-3 w-1/3">
                            <input 
                                type="checkbox" 
                                className="w-5 h-5 cursor-pointer"
                                checked={inputStats[player.user_id]?.played || false}
                                onChange={() => handlePlayedToggle(player.user_id)}
                            />
                            <span className="font-semibold">{player.full_name}</span>
                        </div>

                        {/* Stats Inputs (Only visible if played) */}
                        {inputStats[player.user_id]?.played && (
                            <div className="flex gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 block">Runs</label>
                                    <input 
                                        type="number" 
                                        className="w-20 p-1 rounded bg-gray-900 border border-gray-600"
                                        value={inputStats[player.user_id]?.runs}
                                        onChange={(e) => handleStatChange(player.user_id, 'runs', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 block">Wickets</label>
                                    <input 
                                        type="number" 
                                        className="w-20 p-1 rounded bg-gray-900 border border-gray-600"
                                        value={inputStats[player.user_id]?.wickets}
                                        onChange={(e) => handleStatChange(player.user_id, 'wickets', e.target.value)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>

        <button className="mt-8 w-full bg-green-600 py-4 rounded font-bold text-xl hover:bg-green-500 shadow-lg">
            🚀 Submit Scorecard & Update Stats
        </button>
      </form>
    </div>
  );
};

export default AdminScorecard;