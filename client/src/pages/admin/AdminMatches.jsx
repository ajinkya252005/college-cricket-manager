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

  // Fetch Data
  const fetchData = async () => {
    try {
      const matchRes = await fetch("${API_BASE_URL}/api/matches");
      const tournRes = await fetch("${API_BASE_URL}/api/tournaments");

      setMatches(await matchRes.json());
      setTournaments(await tournRes.json());
    } catch (err) {
      console.error(err.message);
    }
  };
  // ... existing deleteMatch function or place this inside AdminMatches component ...
  const deleteMatch = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this match? This will remove all associated data and revert player stats."
    );

    if (confirmDelete) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/matches/${id}`, {
          method: "DELETE",
          headers: { token: localStorage.getItem("token") },
        });

        if (response.ok) {
          setMatches(matches.filter((match) => match.match_id !== id));
          toast.success("Match Deleted Successfully");
        } else {
          toast.error("Failed to delete match");
        }
      } catch (err) {
        console.error(err.message);
        toast.error("Error deleting match");
      }
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
      const response = await fetch("${API_BASE_URL}/api/matches", {
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

  // Helper to format date nicely
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      full: date.toLocaleDateString()
    };
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white relative overflow-x-hidden">

      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-green-900/20 to-gray-900 -z-10"></div>
      <div className="absolute top-20 right-10 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -z-10"></div>

      {/* Header */}
      <div className="mb-12 flex justify-between items-end">
        <div>
          <Link to="/admin-dashboard" className="text-gray-400 hover:text-white text-sm font-bold tracking-widest uppercase mb-2 inline-block">&larr; Command Center</Link>
          <h1 className="text-5xl font-black text-white tracking-tight">
            MATCH <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">CONTROL</span>
          </h1>
        </div>
      </div>

      {/* CREATE FORM */}
      <div className="mb-16 bg-gray-800/40 backdrop-blur-lg border border-green-500/30 rounded-2xl p-8 shadow-[0_0_40px_rgba(16,185,129,0.1)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>

        <h2 className="text-xl font-bold text-green-400 mb-6 uppercase tracking-wider">Schedule New Fixture</h2>

        <form onSubmit={onSubmitForm} className="grid gap-6 md:grid-cols-12 items-end">
          <div className="md:col-span-4">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tournament</label>
            <select
              name="tournament_id"
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-3 focus:border-green-500 focus:ring-1 focus:ring-green-500 transition outline-none"
              value={formData.tournament_id}
              onChange={onChange}
              required
            >
              <option value="">Select Series...</option>
              {tournaments.map((t) => (
                <option key={t.tournament_id} value={t.tournament_id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-4">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Opponent Team</label>
            <input
              type="text"
              name="opponent_name"
              placeholder="e.g. MIT Pune"
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-3 focus:border-green-500 focus:ring-1 focus:ring-green-500 transition outline-none"
              value={formData.opponent_name}
              onChange={onChange}
              required
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Match Date</label>
            <input
              type="date"
              name="match_date"
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-3 focus:border-green-500 focus:ring-1 focus:ring-green-500 transition outline-none"
              value={formData.match_date}
              onChange={onChange}
              required
            />
          </div>

          <div className="md:col-span-1">
            <button className="w-full h-[50px] bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg shadow-lg transition transform hover:scale-105 flex items-center justify-center text-xl">
              +
            </button>
          </div>
        </form>
      </div>

      {/* MATCH LISTS */}
      <div className="grid gap-12 lg:grid-cols-2">

        {/* LEFT COL: UPCOMING */}
        <div>
          <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <h2 className="text-2xl font-bold text-white">Upcoming Fixtures</h2>
          </div>

          <div className="space-y-4">
            {matches
              .filter(m => new Date(m.match_date) > new Date().setHours(0, 0, 0, 0))
              .map((m) => {
                const d = formatDate(m.match_date);
                return (
                  <div key={m.match_id} className="group flex items-center bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-blue-500/50 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    {/* Date Box */}
                    <div className="bg-gray-900 w-20 h-24 flex flex-col items-center justify-center border-r border-gray-700 group-hover:border-blue-500/30 transition">
                      <span className="text-xs font-bold text-blue-400 uppercase">{d.month}</span>
                      <span className="text-2xl font-black text-white">{d.day}</span>
                    </div>

                    {/* Info */}
                    <div className="p-4 flex-1">
                      <span className="inline-block px-2 py-1 rounded bg-gray-700 text-[10px] font-bold text-gray-300 uppercase mb-2 tracking-wider">
                        {m.tournament_name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-500">VS</span>
                        <h3 className="text-xl font-bold text-white">{m.opponent_name}</h3>
                      </div>
                    </div>
                  </div>
                );
              })}
            {matches.filter(m => new Date(m.match_date) > new Date().setHours(0, 0, 0, 0)).length === 0 && (
              <p className="text-gray-600 italic">No upcoming matches scheduled.</p>
            )}
          </div>
        </div>

        {/* RIGHT COL: FINISHED */}
        <div>
          <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-white">Results Center</h2>
          </div>

          <div className="space-y-4">
            {matches
              .filter(m => new Date(m.match_date) <= new Date().setHours(0, 0, 0, 0))
              .map((m) => {
                const d = formatDate(m.match_date);
                return (
                  <div key={m.match_id} className="relative flex flex-col bg-gray-800 border border-gray-700 rounded-xl overflow-hidden transition-all hover:border-green-500/50">
                    <div className="flex items-center p-5">
                      {/* Match Info */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-bold text-gray-500 uppercase">{d.full} • {m.tournament_name}</span>
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-2xl font-bold text-white">VS {m.opponent_name}</h3>
                        </div>
                        <p className="text-sm font-mono text-yellow-400 bg-yellow-400/10 inline-block px-2 py-1 rounded">
                          {m.result || "Match Completed - No Result Entered"}
                        </p>
                      </div>
                    </div>

                    {/* Action Footer */}
                    <div className="bg-gray-900/50 p-3 border-t border-gray-700 flex justify-end">
                      <Link
                        to={`/admin/matches/${m.match_id}/scorecard`}
                        className="inline-flex items-center gap-2 text-sm font-bold text-green-400 hover:text-green-300 transition"
                      >
                        <span>EDIT SCORECARD</span>
                        <span className="bg-green-500/20 rounded-full w-6 h-6 flex items-center justify-center text-xs">&rarr;</span>
                      </Link>
                      <button
                        onClick={() => deleteMatch(m.match_id)}
                        className="btn btn-danger btn-sm"
                      >
                        <i className="fas fa-trash"></i> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            {matches.filter(m => new Date(m.match_date) <= new Date().setHours(0, 0, 0, 0)).length === 0 && (
              <p className="text-gray-600 italic">No past matches found.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminMatches;
//${API_BASE_URL}/api/matches/${id}