import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const AdminAttendance = () => {
  const [view, setView] = useState("list"); // 'list' or 'form'
  const [history, setHistory] = useState([]);
  const [players, setPlayers] = useState([]);
  const [historyTab, setHistoryTab] = useState("practice"); // 'practice' or 'match'
  // Form State
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
        const res = await fetch("http://localhost:5000/api/attendance/events");
        setHistory(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchPlayers = async () => {
    try {
        const res = await fetch("http://localhost:5000/api/players");
        setPlayers(await res.json());
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchHistory();
    fetchPlayers();
  }, []);

  // --- HANDLERS ---
  
  const handleEdit = async (eventId) => {
    try {
        const res = await fetch(`http://localhost:5000/api/attendance/event/${eventId}`);
        const data = await res.json();
        
        setFormData({
            date: new Date(data.event.date).toISOString().split('T')[0],
            start_time: data.event.start_time || "",
            end_time: data.event.end_time || "",
            event_type: data.event.event_type,
            description: data.event.description || ""
        });
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
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const toggleAll = () => {
    if (selectedIds.length === players.length) setSelectedIds([]);
    else setSelectedIds(players.map(p => p.user_id));
  };

  const onSubmit = async () => {
    if(selectedIds.length === 0) return toast.warning("Select at least one player!");

    const endpoint = isEditing 
        ? `http://localhost:5000/api/attendance/update/${editId}` 
        : "http://localhost:5000/api/attendance/create";
    
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
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      <Link to="/admin-dashboard" className="text-gray-400 hover:text-white mb-4 inline-block">&larr; Back to Dashboard</Link>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-teal-400">📅 Attendance Manager</h1>
        {view === "list" && (
            <button onClick={handleCreateNew} className="bg-teal-600 px-4 py-2 rounded font-bold hover:bg-teal-500">
                + New Session
            </button>
        )}
        {view === "form" && (
            <button onClick={() => setView("list")} className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">
                Cancel / View List
            </button>
        )}
      </div>

      {/* --- VIEW: LIST HISTORY --- */}
      {view === "list" && (
          <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              
              {/* HISTORY TABS */}
              <div className="flex border-b border-gray-700">
                  <button 
                      onClick={() => setHistoryTab("practice")}
                      className={`flex-1 py-3 font-bold text-sm uppercase tracking-wider ${
                          historyTab === "practice" ? "bg-gray-700 text-teal-400 border-b-2 border-teal-400" : "text-gray-500 hover:text-gray-300"
                      }`}
                  >
                      🏋️ Practice Sessions
                  </button>
                  <button 
                      onClick={() => setHistoryTab("match")}
                      className={`flex-1 py-3 font-bold text-sm uppercase tracking-wider ${
                          historyTab === "match" ? "bg-gray-700 text-green-400 border-b-2 border-green-400" : "text-gray-500 hover:text-gray-300"
                      }`}
                  >
                      🏆 Match Days
                  </button>
              </div>

              <table className="w-full text-left">
                  <thead className="bg-gray-700 text-gray-400 uppercase text-xs">
                      <tr>
                          <th className="p-4">Date</th>
                          <th className="p-4">Type</th>
                          <th className="p-4">Time</th>
                          <th className="p-4">Description</th>
                          <th className="p-4">Action</th>
                      </tr>
                  </thead>
                  <tbody>
                      {history
                        .filter(ev => historyTab === "match" ? ev.event_type === 'Match Day' : ev.event_type !== 'Match Day')
                        .map(ev => (
                          <tr key={ev.event_id} className="border-b border-gray-700 hover:bg-gray-750">
                              <td className="p-4">{new Date(ev.date).toLocaleDateString()}</td>
                              <td className="p-4">
                                  <span className={`px-2 py-1 rounded text-xs font-bold ${ev.event_type === 'Match Day' ? 'bg-green-900 text-green-300' : 'bg-blue-900 text-blue-300'}`}>
                                      {ev.event_type}
                                  </span>
                              </td>
                              <td className="p-4">{ev.start_time ? `${ev.start_time.slice(0,5)} - ${ev.end_time?.slice(0,5)}` : '-'}</td>
                              <td className="p-4 text-gray-400 text-sm">{ev.description || "-"}</td>
                              <td className="p-4">
                                  <button onClick={() => handleEdit(ev.event_id)} className="text-teal-400 hover:underline text-sm">
                                      Edit / View
                                  </button>
                              </td>
                          </tr>
                      ))}
                      {history.filter(ev => historyTab === "match" ? ev.event_type === 'Match Day' : ev.event_type !== 'Match Day').length === 0 && (
                          <tr><td colSpan="5" className="p-6 text-center text-gray-500">No records found in this category.</td></tr>
                      )}
                  </tbody>
              </table>
          </div>
      )}

      {/* --- VIEW: FORM (Create/Edit) --- */}
      {view === "form" && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-teal-300">{isEditing ? "Edit Attendance Register" : "New Attendance Register"}</h2>
            
            <div className="grid gap-4 md:grid-cols-2 mb-6 bg-gray-700 p-4 rounded">
                <div>
                    <label className="block text-xs text-gray-400 mb-1">Date</label>
                    <input type="date" className="w-full p-2 rounded bg-gray-900 border border-gray-600 text-white" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} disabled={isEditing && formData.event_type === 'Match Day'} />
                </div>
                <div>
                    <label className="block text-xs text-gray-400 mb-1">Event Type</label>
                    <select className="w-full p-2 rounded bg-gray-900 border border-gray-600 text-white" value={formData.event_type} onChange={(e) => setFormData({...formData, event_type: e.target.value})}>
                        <option>Practice Session</option>
                        <option>Match Day</option>
                        <option>Other</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs text-gray-400 mb-1">Time (From - To)</label>
                    <div className="flex gap-2">
                        <input type="time" className="w-1/2 p-2 rounded bg-gray-900 border border-gray-600 text-white" value={formData.start_time} onChange={(e) => setFormData({...formData, start_time: e.target.value})} />
                        <input type="time" className="w-1/2 p-2 rounded bg-gray-900 border border-gray-600 text-white" value={formData.end_time} onChange={(e) => setFormData({...formData, end_time: e.target.value})} />
                    </div>
                </div>
                <div>
                    <label className="block text-xs text-gray-400 mb-1">Description {formData.event_type === 'Other' && '(Required)'}</label>
                    <input type="text" placeholder="e.g. Fitness Test / Meeting" className="w-full p-2 rounded bg-gray-900 border border-gray-600 text-white" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                </div>
            </div>

            <div className="mb-4 flex justify-between items-center border-b border-gray-700 pb-2">
                <h3 className="font-bold">Select Present Members ({selectedIds.length})</h3>
                <button onClick={toggleAll} className="text-sm text-teal-400 hover:underline">
                    {selectedIds.length === players.length ? "Deselect All" : "Select All"}
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto mb-6">
                {players.map(p => (
                    <div 
                        key={p.user_id} 
                        onClick={() => toggleSelect(p.user_id)}
                        className={`p-3 rounded cursor-pointer border transition flex items-center gap-3 ${
                            selectedIds.includes(p.user_id) 
                            ? "border-teal-500 bg-teal-900 bg-opacity-30" 
                            : "border-gray-700 bg-gray-700 hover:bg-gray-600"
                        }`}
                    >
                        <div className={`w-4 h-4 rounded flex items-center justify-center border ${selectedIds.includes(p.user_id) ? "bg-teal-500 border-teal-500" : "border-gray-500"}`}>
                            {selectedIds.includes(p.user_id) && <span className="text-xs text-black font-bold">✓</span>}
                        </div>
                        <span className="font-semibold text-sm">{p.full_name}</span>
                    </div>
                ))}
            </div>

            <button onClick={onSubmit} className="w-full bg-teal-600 py-3 rounded font-bold hover:bg-teal-500 shadow-lg text-lg">
                💾 Save Attendance Register
            </button>
          </div>
      )}
    </div>
  );
};

export default AdminAttendance;