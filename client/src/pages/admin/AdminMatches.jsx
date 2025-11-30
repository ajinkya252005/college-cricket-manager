import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const AdminMatches = () => {
  const [matches, setMatches] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  
  const [formData, setFormData] = useState({
    tournament_id: "",
    opponent_name: "",
    match_date: "",
  });

  // Fetch Data (Matches AND Tournaments)
  const fetchData = async () => {
    try {
      const matchRes = await fetch("http://localhost:5000/api/matches");
      const tournRes = await fetch("http://localhost:5000/api/tournaments");
      
      const matchData = await matchRes.json();
      const tournData = await tournRes.json();

      setMatches(matchData);
      setTournaments(tournData);
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmitForm = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Match Scheduled!");
        setFormData({ tournament_id: "", opponent_name: "", match_date: "" });
        fetchData();
      } else {
        toast.error("Failed to schedule match");
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      <Link to="/admin-dashboard" className="text-gray-400 hover:text-white mb-4 inline-block">
        &larr; Back to Dashboard
      </Link>
      
      <h1 className="mb-6 text-3xl font-bold text-green-400">🏏 Schedule Matches</h1>

      {/* CREATE FORM */}
      <div className="mb-8 rounded-lg bg-gray-800 p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold">New Match Details</h2>
        <form onSubmit={onSubmitForm} className="grid gap-4 md:grid-cols-4">
          
          {/* Tournament Dropdown */}
          <select
            name="tournament_id"
            className="rounded bg-gray-700 p-2 text-white focus:outline-none"
            value={formData.tournament_id}
            onChange={onChange}
            required
          >
            <option value="">Select Tournament</option>
            {tournaments.map((t) => (
              <option key={t.tournament_id} value={t.tournament_id}>
                {t.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            name="opponent_name"
            placeholder="Opponent Name (e.g. MIT Pune)"
            className="rounded bg-gray-700 p-2 text-white focus:outline-none"
            value={formData.opponent_name}
            onChange={onChange}
            required
          />
          <input
            type="date"
            name="match_date"
            className="rounded bg-gray-700 p-2 text-white focus:outline-none"
            value={formData.match_date}
            onChange={onChange}
            required
          />
          <button className="rounded bg-green-600 font-bold text-white hover:bg-green-500">
            Schedule Match
          </button>
        </form>
      </div>

      {/* MATCH LIST SECTION */}
      <div className="grid gap-8 md:grid-cols-2">
        
        {/* LEFT COL: UPCOMING MATCHES */}
        <div className="rounded-lg bg-gray-800 p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-bold text-blue-400">📅 Upcoming Matches</h2>
            <div className="space-y-4">
                {matches
                    .filter(m => new Date(m.match_date) > new Date().setHours(0,0,0,0)) // Future dates
                    .map((m) => (
                    <div key={m.match_id} className="flex flex-col gap-2 rounded bg-gray-700 p-4 border-l-4 border-blue-500">
                        <div>
                            <h3 className="text-lg font-bold">{m.opponent_name}</h3>
                            <p className="text-xs text-gray-400">{m.tournament_name}</p>
                            <p className="text-sm font-semibold mt-1">
                                {new Date(m.match_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                            </p>
                        </div>
                        {/* Edit Button (Optional, or just placeholder) */}
                        <div className="text-xs text-gray-500 italic">Scheduled</div>
                    </div>
                ))}
                {matches.filter(m => new Date(m.match_date) > new Date().setHours(0,0,0,0)).length === 0 && (
                    <p className="text-gray-500">No upcoming matches.</p>
                )}
            </div>
        </div>

        {/* RIGHT COL: FINISHED / TODAY MATCHES */}
        <div className="rounded-lg bg-gray-800 p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-bold text-green-400">✅ Finished / Today</h2>
            <div className="space-y-4">
                {matches
                    .filter(m => new Date(m.match_date) <= new Date().setHours(0,0,0,0)) // Today or Past
                    .map((m) => (
                    <div key={m.match_id} className="flex items-center justify-between rounded bg-gray-700 p-4 border-l-4 border-green-500">
                        <div>
                            <h3 className="text-lg font-bold">{m.opponent_name}</h3>
                            <p className="text-xs text-gray-400">{new Date(m.match_date).toLocaleDateString()}</p>
                            <p className="text-xs text-yellow-400 mt-1 font-mono">
                                {m.result || "No Result Entered"}
                            </p>
                        </div>
                        
                        <Link 
                            to={`/admin/matches/${m.match_id}/scorecard`}
                            className="rounded border border-green-500 px-3 py-1 text-xs font-bold text-green-400 hover:bg-green-500 hover:text-white transition"
                        >
                            Scorecard &rarr;
                        </Link>
                    </div>
                ))}
                {matches.filter(m => new Date(m.match_date) <= new Date().setHours(0,0,0,0)).length === 0 && (
                    <p className="text-gray-500">No past matches.</p>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};

export default AdminMatches;