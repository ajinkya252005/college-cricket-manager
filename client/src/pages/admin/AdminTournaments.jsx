import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../config";

const AdminTournaments = () => {
  const [tournaments, setTournaments] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    start_date: "",
    end_date: "",
  });

  // Fetch existing tournaments
  const getTournaments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tournaments`);
      const jsonData = await response.json();
      setTournaments(jsonData);
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    getTournaments();
  }, []);

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmitForm = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/tournaments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Tournament Created!");
        setFormData({ name: "", start_date: "", end_date: "" });
        getTournaments();
      } else {
        toast.error("Failed to create");
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  // Helper for Status Badge
  const getStatusStyle = (status) => {
    switch(status) {
        case 'ongoing': return 'bg-green-500/10 text-green-400 border border-green-500/50 shadow-[0_0_10px_rgba(74,222,128,0.2)]';
        case 'upcoming': return 'bg-blue-500/10 text-blue-400 border border-blue-500/50';
        default: return 'bg-gray-700/50 text-gray-400 border border-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white relative">
      
      {/* BACKGROUND GLOW */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-600/10 rounded-full blur-3xl -z-10"></div>

      {/* HEADER */}
      <div className="flex justify-between items-end mb-10">
        <div>
            <Link to="/admin-dashboard" className="text-gray-500 hover:text-yellow-500 transition text-sm font-bold tracking-widest uppercase mb-2 inline-block">&larr; Command Center</Link>
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 drop-shadow-lg">
                TOURNAMENT HUB
            </h1>
            <p className="text-gray-400 mt-2 text-lg">Manage series, leagues, and championships.</p>
        </div>
      </div>

      {/* CREATE FORM CARD */}
      <div className="mb-12 bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-yellow-500 to-orange-600"></div>
        
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="bg-yellow-500 text-black w-8 h-8 rounded-lg flex items-center justify-center text-lg font-black">+</span>
            Launch New Tournament
        </h2>

        <form onSubmit={onSubmitForm} className="grid gap-6 md:grid-cols-12 items-end">
          <div className="md:col-span-5">
             <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Tournament Name</label>
             <input
                type="text"
                name="name"
                placeholder="e.g. Champions Trophy 2025"
                className="w-full bg-gray-900/80 border border-gray-700 text-white rounded-xl p-4 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition outline-none placeholder-gray-600"
                value={formData.name}
                onChange={onChange}
                required
             />
          </div>
          
          <div className="md:col-span-3">
             <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Start Date</label>
             <input
                type="date"
                name="start_date"
                className="w-full bg-gray-900/80 border border-gray-700 text-white rounded-xl p-4 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition outline-none"
                value={formData.start_date}
                onChange={onChange}
                required
             />
          </div>

          <div className="md:col-span-3">
             <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">End Date</label>
             <input
                type="date"
                name="end_date"
                className="w-full bg-gray-900/80 border border-gray-700 text-white rounded-xl p-4 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition outline-none"
                value={formData.end_date}
                onChange={onChange}
                required
             />
          </div>

          <div className="md:col-span-1">
             <button className="w-full h-[58px] bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-black font-black rounded-xl shadow-lg hover:shadow-orange-500/20 transition transform hover:-translate-y-1">
                GO
             </button>
          </div>
        </form>
      </div>

      {/* LIST VIEW */}
      <div className="bg-gray-800 border border-gray-700 rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-700 bg-gray-800/80">
            <h2 className="text-xl font-bold text-gray-300 uppercase tracking-wider">Active & Past Series</h2>
        </div>

        <table className="w-full text-left">
          <thead className="bg-gray-900/50 text-gray-500 uppercase text-xs tracking-widest font-bold">
            <tr>
              <th className="p-6">Tournament Name</th>
              <th className="p-6">Duration</th>
              <th className="p-6 text-center">Status</th>
              <th className="p-6 text-right">Squad Management</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {tournaments.map((t) => (
              <tr key={t.tournament_id} className="hover:bg-gray-700/30 transition duration-200 group">
                <td className="p-6">
                    <span className="text-lg font-bold text-white group-hover:text-yellow-400 transition">{t.name}</span>
                </td>
                <td className="p-6 text-gray-400 font-mono text-sm">
                    {new Date(t.start_date).toLocaleDateString()} <span className="text-gray-600 mx-2">→</span> {new Date(t.end_date).toLocaleDateString()}
                </td>
                <td className="p-6 text-center">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusStyle(t.status)}`}>
                    {t.status}
                  </span>
                </td>
                <td className="p-6 text-right">
                    <Link 
                    to={`/admin/tournaments/${t.tournament_id}/squad`}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-lg border border-gray-600 text-gray-300 font-bold text-sm hover:bg-white hover:text-black hover:border-white transition-all shadow-sm"
                    >
                    <span className="text-lg">🛡️</span> Manage Squad
                    </Link>
                </td>
              </tr>
            ))}
            {tournaments.length === 0 && (
                <tr>
                    <td colSpan="4" className="p-12 text-center text-gray-500 italic text-lg">
                        No tournaments found. Create one above to begin the season.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default AdminTournaments;