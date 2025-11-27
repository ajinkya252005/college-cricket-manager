import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Roster = () => {
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null); // For the popup
  const [loading, setLoading] = useState(true);

  // 1. Fetch All Players
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/players");
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

  // 2. Fetch Detailed Public Profile when clicking a card
  const openProfile = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/players/${userId}`);
      const data = await response.json();
      setSelectedPlayer(data);
    } catch (err) {
      console.error(err.message);
    }
  };

  const closeProfile = () => setSelectedPlayer(null);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Link to="/dashboard" className="text-blue-600 hover:underline mb-4 inline-block">
        &larr; Back to Dashboard
      </Link>
      
      <h1 className="text-3xl font-bold text-gray-800 mb-6">👥 Team Roster</h1>

      {loading ? (
        <p>Loading team...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {players.map((player) => (
            <div 
              key={player.user_id} 
              onClick={() => openProfile(player.user_id)}
              className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-xl hover:scale-105 transition transform"
            >
              {/* Avatar Placeholder */}
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl mb-4 mx-auto">
                {player.full_name.charAt(0)}
              </div>
              
              <h3 className="text-lg font-bold text-center text-gray-800">{player.full_name}</h3>
              <p className="text-center text-sm text-gray-500 uppercase">{player.role}</p>
            </div>
          ))}
        </div>
      )}

      {/* PUBLIC PROFILE MODAL (The Drill-Down) */}
      {selectedPlayer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden relative">
            
            {/* Close Button */}
            <button 
              onClick={closeProfile}
              className="absolute top-4 right-4 text-gray-500 hover:text-black font-bold text-xl"
            >
              &times;
            </button>

            {/* Header */}
            <div className="bg-blue-600 p-6 text-center text-white">
              <div className="w-20 h-20 bg-white text-blue-600 rounded-full flex items-center justify-center font-bold text-3xl mx-auto mb-3">
                {selectedPlayer.full_name.charAt(0)}
              </div>
              <h2 className="text-2xl font-bold">{selectedPlayer.full_name}</h2>
              <p className="opacity-80 uppercase text-sm">{selectedPlayer.role} • {selectedPlayer.branch}</p>
            </div>

            {/* Stats Grid */}
            <div className="p-6">
              <div className="grid grid-cols-3 gap-4 text-center mb-6">
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-xs text-gray-500 uppercase">Matches</p>
                  <p className="text-xl font-bold text-gray-800">{selectedPlayer.total_matches}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-xs text-gray-500 uppercase">Runs</p>
                  <p className="text-xl font-bold text-blue-600">{selectedPlayer.total_runs}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-xs text-gray-500 uppercase">Wickets</p>
                  <p className="text-xl font-bold text-purple-600">{selectedPlayer.total_wickets}</p>
                </div>
              </div>

              <div className="text-center text-sm text-gray-500">
                Joined Team in {selectedPlayer.joining_year}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Roster;