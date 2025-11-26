import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const PlayerStats = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getHistory = async () => {
      try {
        // 1. We need to decode the token to get our own User ID
        // (Or we can fetch /verify again, but let's use the Verify route method for consistency)
        const verifyRes = await fetch("http://localhost:5000/api/auth/verify", {
            method: "GET",
            headers: { token: localStorage.getItem("token") }
        });
        const user = await verifyRes.json();

        // 2. Fetch history using that ID
        if (user.player_id) { // Check if we got a valid user back
            const historyRes = await fetch(`http://localhost:5000/api/matches/user/${user.user_id}`); // Note: Backend returns user_id not player_id
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

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Link to="/dashboard" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Back to Dashboard</Link>
      
      <h1 className="text-3xl font-bold text-gray-800 mb-6">🏏 My Match History</h1>

      {loading ? (
        <p>Loading stats...</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">Tournament</th>
                <th className="p-4">Opponent</th>
                <th className="p-4">Result</th>
                <th className="p-4 text-center bg-blue-900">Runs</th>
                <th className="p-4 text-center bg-purple-900">Wickets</th>
              </tr>
            </thead>
            <tbody>
              {history.map((match, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="p-4">{new Date(match.match_date).toLocaleDateString()}</td>
                  <td className="p-4 text-sm text-gray-600">{match.tournament_name}</td>
                  <td className="p-4 font-bold">{match.opponent_name}</td>
                  <td className="p-4 text-sm">{match.result}</td>
                  <td className="p-4 text-center font-bold text-blue-600 text-lg">{match.runs_scored}</td>
                  <td className="p-4 text-center font-bold text-purple-600 text-lg">{match.wickets_taken}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {history.length === 0 && <p className="p-6 text-center text-gray-500">You haven't played any matches yet.</p>}
        </div>
      )}
    </div>
  );
};

export default PlayerStats;