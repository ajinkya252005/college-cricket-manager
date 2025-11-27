import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const AdminAttendance = () => {
  const [players, setPlayers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0], // Default to Today
    event_type: "Practice Session"
  });

  // Fetch Players
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/players");
        setPlayers(await res.json());
      } catch (err) {
        console.error(err.message);
      }
    };
    fetchPlayers();
  }, []);

  // Handle Checkbox Toggle
  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Select All / Deselect All
  const toggleAll = () => {
    if (selectedIds.length === players.length) {
        setSelectedIds([]);
    } else {
        setSelectedIds(players.map(p => p.user_id));
    }
  };

  const onSubmit = async () => {
    if(selectedIds.length === 0) return toast.warning("Select at least one player!");

    try {
      const body = { 
          date: formData.date, 
          event_type: formData.event_type, 
          user_ids: selectedIds 
      };

      const response = await fetch("http://localhost:5000/api/attendance/mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        toast.success("Attendance Marked!");
        setSelectedIds([]); // Reset selection
      } else {
        toast.error("Failed to mark attendance");
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      <Link to="/admin-dashboard" className="text-gray-400 hover:text-white mb-4 inline-block">&larr; Back to Dashboard</Link>
      
      <h1 className="mb-6 text-3xl font-bold text-teal-400">📅 Attendance Register</h1>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
        <div className="grid gap-4 md:grid-cols-2 mb-6">
            <div>
                <label className="block text-gray-400 mb-1">Date</label>
                <input 
                    type="date" 
                    className="w-full p-2 rounded bg-gray-700 text-white"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-gray-400 mb-1">Event Type</label>
                <select 
                    className="w-full p-2 rounded bg-gray-700 text-white"
                    value={formData.event_type}
                    onChange={(e) => setFormData({...formData, event_type: e.target.value})}
                >
                    <option>Practice Session</option>
                    <option>Team Meeting</option>
                    <option>Fitness Test</option>
                </select>
            </div>
        </div>

        <div className="mb-4 flex justify-between items-center border-b border-gray-700 pb-2">
            <h3 className="text-xl font-bold">Mark Present Members</h3>
            <button onClick={toggleAll} className="text-sm text-blue-400 hover:underline">
                {selectedIds.length === players.length ? "Deselect All" : "Select All"}
            </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
            {players.map(p => (
                <div 
                    key={p.user_id} 
                    onClick={() => toggleSelect(p.user_id)}
                    className={`p-3 rounded cursor-pointer border-2 transition ${
                        selectedIds.includes(p.user_id) 
                        ? "border-green-500 bg-gray-700" 
                        : "border-transparent bg-gray-700 hover:bg-gray-600"
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full ${selectedIds.includes(p.user_id) ? "bg-green-500" : "bg-gray-500"}`}></div>
                        <span className="font-semibold">{p.full_name}</span>
                    </div>
                </div>
            ))}
        </div>

        <button 
            onClick={onSubmit}
            className="w-full mt-6 bg-teal-600 py-3 rounded font-bold hover:bg-teal-500 shadow-lg"
        >
            💾 Save Attendance ({selectedIds.length} Present)
        </button>
      </div>
    </div>
  );
};

export default AdminAttendance;