import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../config";

const AdminAttendance = () => {
  const [view, setView] = useState("list"); 
  const [history, setHistory] = useState([]);
  const [players, setPlayers] = useState([]);
  const [historyTab, setHistoryTab] = useState("practice"); 
  
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    start_time: "",
    end_time: "",
    event_type: "Practice Session",
    description: ""
  });

  // --- FETCH DATA ---
  const fetchHistory = async () => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/attendance/events`);
        setHistory(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchPlayers = async (dateParam) => {
    try {
        const targetDate = dateParam || new Date().toISOString().split('T')[0];
        const res = await fetch(`${API_BASE_URL}/api/players/active-on-date/${targetDate}`);
        setPlayers(await res.json());
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchHistory();
    fetchPlayers(formData.date);
  }, []);

  // --- HANDLERS ---
  const handleEdit = async (eventId) => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/attendance/event/${eventId}`);
        const data = await res.json();
        const eventDate = new Date(data.event.date).toISOString().split('T')[0];
        
        setFormData({
            date: eventDate,
            start_time: data.event.start_time || "",
            end_time: data.event.end_time || "",
            event_type: data.event.event_type,
            description: data.event.description || ""
        });
        await fetchPlayers(eventDate);
        setSelectedIds(data.present_ids);
        setEditId(eventId);
        setIsEditing(true);
        setView("form");
    } catch (err) { console.error(err); }
  };

  const handleCreateNew = () => {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        start_time: "",
        end_time: "",
        event_type: "Practice Session",
        description: ""
      });
      setSelectedIds([]);
      setIsEditing(false);
      setEditId(null);
      setView("form");
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(item => item !== id));
    else setSelectedIds([...selectedIds, id]);
  };

  const toggleAll = () => {
    if (selectedIds.length === players.length) setSelectedIds([]);
    else setSelectedIds(players.map(p => p.user_id));
  };

  const onSubmit = async () => {
    if(selectedIds.length === 0) return toast.warning("Select at least one player!");
    const endpoint = isEditing ? `${API_BASE_URL}/api/attendance/update/${editId}` : `${API_BASE_URL}/api/attendance/create`;
    const method = isEditing ? "PUT" : "POST";

    try {
      const response = await fetch(endpoint, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, user_ids: selectedIds }),
      });
      if (response.ok) {
        toast.success(isEditing ? "Session Updated!" : "Session Created!");
        fetchHistory();
        setView("list");
      } else {
        toast.error("Failed to save attendance");
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white relative">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
            <Link to="/admin-dashboard" className="text-gray-400 hover:text-white text-sm transition">&larr; Dashboard</Link>
            <h1 className="text-4xl font-extrabold mt-2 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
                Attendance Manager
            </h1>
        </div>
        {view === "list" ? (
            <button onClick={handleCreateNew} className="bg-teal-600 px-6 py-3 rounded-full font-bold hover:bg-teal-500 shadow-lg hover:shadow-teal-500/50 transition-all transform hover:scale-105">
                + New Session
            </button>
        ) : (
            <button onClick={() => setView("list")} className="bg-gray-700 px-6 py-3 rounded-full font-bold hover:bg-gray-600 transition">
                Cancel
            </button>
        )}
      </div>

      {/* --- VIEW: LIST HISTORY --- */}
      {view === "list" && (
          <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
              
              {/* CUSTOM TABS */}
              <div className="flex border-b border-gray-700">
                  <button 
                      onClick={() => setHistoryTab("practice")}
                      className={`flex-1 py-4 text-center font-bold uppercase tracking-widest text-sm transition-all ${
                          historyTab === "practice" 
                          ? "bg-teal-900/20 text-teal-400 border-b-4 border-teal-400" 
                          : "text-gray-500 hover:text-gray-300 hover:bg-gray-750"
                      }`}
                  >
                      🏋️ Practice Sessions
                  </button>
                  <button 
                      onClick={() => setHistoryTab("match")}
                      className={`flex-1 py-4 text-center font-bold uppercase tracking-widest text-sm transition-all ${
                          historyTab === "match" 
                          ? "bg-green-900/20 text-green-400 border-b-4 border-green-400" 
                          : "text-gray-500 hover:text-gray-300 hover:bg-gray-750"
                      }`}
                  >
                      🏆 Match Days
                  </button>
              </div>

              {/* TABLE */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-900/50 text-gray-400 uppercase text-xs tracking-wider">
                            <th className="p-5">Date</th>
                            <th className="p-5">Type</th>
                            <th className="p-5">Time</th>
                            <th className="p-5">Details</th>
                            <th className="p-5 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {history
                            .filter(ev => historyTab === "match" ? ev.event_type === 'Match Day' : ev.event_type !== 'Match Day')
                            .map(ev => (
                            <tr key={ev.event_id} className="hover:bg-gray-700/50 transition duration-150 group">
                                <td className="p-5 font-medium text-white">{new Date(ev.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                <td className="p-5">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                                        ev.event_type === 'Match Day' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                                    }`}>
                                        {ev.event_type}
                                    </span>
                                </td>
                                <td className="p-5 text-gray-300 font-mono text-sm">{ev.start_time ? `${ev.start_time.slice(0,5)} - ${ev.end_time?.slice(0,5)}` : '-'}</td>
                                <td className="p-5 text-gray-400 text-sm italic">{ev.description || "-"}</td>
                                <td className="p-5 text-right">
                                    <button onClick={() => handleEdit(ev.event_id)} className="text-teal-400 font-bold text-sm hover:text-teal-300 opacity-0 group-hover:opacity-100 transition-opacity">
                                        Edit ✎
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {history.filter(ev => historyTab === "match" ? ev.event_type === 'Match Day' : ev.event_type !== 'Match Day').length === 0 && (
                            <tr><td colSpan="5" className="p-8 text-center text-gray-500">No records found.</td></tr>
                        )}
                    </tbody>
                </table>
              </div>
          </div>
      )}

      {/* --- VIEW: FORM --- */}
      {view === "form" && (
          <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-white border-b border-gray-700 pb-4">
                {isEditing ? "Edit Attendance Register" : "New Attendance Register"}
            </h2>
            
            <div className="grid gap-6 md:grid-cols-2 mb-8">
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Date</label>
                    <input 
                        type="date" 
                        className="w-full p-3 rounded-lg bg-gray-900 border border-gray-600 text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition" 
                        value={formData.date} 
                        onChange={(e) => { setFormData({...formData, date: e.target.value}); fetchPlayers(e.target.value); }} 
                        disabled={isEditing && formData.event_type === 'Match Day'} 
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Event Type</label>
                    <select className="w-full p-3 rounded-lg bg-gray-900 border border-gray-600 text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition" value={formData.event_type} onChange={(e) => setFormData({...formData, event_type: e.target.value})}>
                        <option>Practice Session</option>
                        <option>Match Day</option>
                        <option>Other</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Time Duration</label>
                    <div className="flex gap-4">
                        <input type="time" className="w-1/2 p-3 rounded-lg bg-gray-900 border border-gray-600 text-white" value={formData.start_time} onChange={(e) => setFormData({...formData, start_time: e.target.value})} />
                        <input type="time" className="w-1/2 p-3 rounded-lg bg-gray-900 border border-gray-600 text-white" value={formData.end_time} onChange={(e) => setFormData({...formData, end_time: e.target.value})} />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Description</label>
                    <input type="text" placeholder="e.g. Nets / Fitness" className="w-full p-3 rounded-lg bg-gray-900 border border-gray-600 text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                </div>
            </div>

            <div className="mb-4 flex justify-between items-end border-b border-gray-700 pb-2">
                <h3 className="font-bold text-lg text-teal-400">Mark Present Members</h3>
                <button onClick={toggleAll} className="text-sm text-gray-400 hover:text-white underline">
                    {selectedIds.length === players.length ? "Deselect All" : "Select All"}
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar mb-8">
                {players.map(p => (
                    <div 
                        key={p.user_id} 
                        onClick={() => toggleSelect(p.user_id)}
                        className={`p-3 rounded-lg cursor-pointer border transition-all flex items-center gap-3 select-none ${
                            selectedIds.includes(p.user_id) 
                            ? "border-teal-500 bg-teal-500/20 shadow-[0_0_10px_rgba(20,184,166,0.2)]" 
                            : "border-gray-700 bg-gray-800 hover:bg-gray-700"
                        }`}
                    >
                        <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${selectedIds.includes(p.user_id) ? "bg-teal-500 border-teal-500" : "border-gray-500"}`}>
                            {selectedIds.includes(p.user_id) && <span className="text-xs text-black font-black">✓</span>}
                        </div>
                        <span className={`text-sm font-medium ${selectedIds.includes(p.user_id) ? "text-white" : "text-gray-400"}`}>{p.full_name}</span>
                    </div>
                ))}
            </div>

            <button onClick={onSubmit} className="w-full bg-teal-600 py-4 rounded-xl font-bold text-lg hover:bg-teal-500 shadow-lg hover:shadow-teal-500/40 transition-all transform hover:scale-[1.02]">
                💾 Save Attendance Register
            </button>
          </div>
      )}
    </div>
  );
};

export default AdminAttendance;