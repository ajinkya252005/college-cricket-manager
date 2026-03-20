import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const AdminPlayers = () => {
  const [pending, setPending] = useState([]);
  const [active, setActive] = useState([]);
  const [alumni, setAlumni] = useState([]);
  
  const [editPlayer, setEditPlayer] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({});

  const fetchData = async () => {
    try {
      const pendingRes = await fetch("${API_BASE_URL}/api/players/pending");
      const activeRes = await fetch("${API_BASE_URL}/api/players");
      const alumniRes = await fetch("${API_BASE_URL}/api/players/alumni");

      setPending(await pendingRes.json());
      setActive(await activeRes.json());
      setAlumni(await alumniRes.json());
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  // --- ACTIONS ---
  const handleApprove = async (id) => {
    await fetch(`${API_BASE_URL}/api/players/approve/${id}`, { method: "PUT" });
    toast.success("Player Approved!"); fetchData();
  };

  const handleReject = async (id) => {
    if(window.confirm("Reject request?")) {
        await fetch(`${API_BASE_URL}/api/players/reject/${id}`, { method: "DELETE" });
        toast.error("Rejected"); fetchData();
    }
  };

  const handleArchive = async (id) => {
    if(window.confirm("Move to Alumni?")) {
        await fetch(`${API_BASE_URL}/api/players/archive/${id}`, { method: "PUT" });
        toast.info("Archived"); fetchData();
    }
  };

  const handleRestore = async (id) => {
      if(window.confirm("Restore this player to Active Team?")) {
        await fetch(`${API_BASE_URL}/api/players/approve/${id}`, { method: "PUT" }); 
        toast.success("Player Restored!"); fetchData();
      }
  };

  // --- MODAL LOGIC ---
  const openEdit = async (id) => {
      const res = await fetch(`${API_BASE_URL}/api/players/${id}`);
      const data = await res.json();
      setEditPlayer(data);
      setFormData({
          first_name: data.first_name || data.full_name.split(' ')[0],
          middle_name: data.middle_name || "",
          last_name: data.last_name || data.full_name.split(' ')[1] || "",
          branch: data.branch || "",
          year_of_study: data.year_of_study || 1,
          joining_date: data.joining_date ? new Date(data.joining_date).toISOString().split('T')[0] : "",
          birth_date: data.birth_date ? new Date(data.birth_date).toISOString().split('T')[0] : ""
      });
  };

  const submitEdit = async (e) => {
      e.preventDefault();
      try {
          const res = await fetch(`${API_BASE_URL}/api/players/update/${editPlayer.user_id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(formData)
          });
          if(res.ok) { toast.success("Profile Updated"); setEditPlayer(null); fetchData(); }
      } catch (err) { console.error(err); }
  };

  const openCreate = () => {
      setFormData({
          player_id: "", password: "", 
          first_name: "", middle_name: "", last_name: "",
          branch: "", year_of_study: "1",
          joining_date: new Date().toISOString().split('T')[0],
          birth_date: ""
      });
      setShowCreate(true);
  };

  const submitCreate = async (e) => {
      e.preventDefault();
      try {
          const res = await fetch("${API_BASE_URL}/api/players/add", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(formData)
          });
          if(res.ok) { toast.success("Player Added!"); setShowCreate(false); fetchData(); }
          else { const err = await res.json(); toast.error(err); }
      } catch (err) { console.error(err); }
  };

  // Helper for Avatar Color
  const getAvatarColor = (name) => {
      const colors = ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-yellow-500", "bg-teal-500"];
      const index = name.charCodeAt(0) % colors.length;
      return colors[index];
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white relative">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-10">
        <div>
            <Link to="/admin-dashboard" className="text-gray-500 hover:text-blue-400 text-xs font-bold tracking-widest uppercase mb-2 inline-block transition">&larr; Command Center</Link>
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600 drop-shadow-lg">
                SQUAD MANAGER
            </h1>
        </div>
        <button onClick={openCreate} className="bg-blue-600 px-6 py-3 rounded-full font-bold hover:bg-blue-500 shadow-lg hover:shadow-blue-500/40 transition-all transform hover:scale-105 flex items-center gap-2">
            <span className="text-xl">+</span> New Player
        </button>
      </div>

      {/* 1. PENDING REQUESTS */}
      {pending.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2 uppercase tracking-wider">
                <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                Pending Approvals ({pending.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pending.map(p => (
                    <div key={p.user_id} className="bg-yellow-900/10 border border-yellow-500/30 p-4 rounded-xl flex items-center justify-between hover:bg-yellow-900/20 transition duration-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center font-bold">?</div>
                            <div>
                                <p className="font-bold text-white">{p.full_name}</p>
                                <p className="text-xs text-gray-400">{p.branch} • {p.player_id}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => handleApprove(p.user_id)} className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-black transition flex items-center justify-center font-bold">✓</button>
                            <button onClick={() => handleReject(p.user_id)} className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-black transition flex items-center justify-center font-bold">✕</button>
                        </div>
                    </div>
                ))}
            </div>
          </div>
      )}

      {/* 2. ACTIVE ROSTER */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-2">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="text-blue-500">●</span> Active Roster
            </h2>
            <span className="bg-gray-800 text-gray-400 px-3 py-1 rounded-full text-xs font-bold">{active.length} Players</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {active.map(p => (
                <div key={p.user_id} className="group relative bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300">
                    
                    {/* Edit Button (Hidden until hover) */}
                    <button onClick={() => openEdit(p.user_id)} className="absolute top-4 right-4 text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">✎</button>
                    
                    <div className="flex flex-col items-center text-center mb-4">
                        <div className={`w-20 h-20 ${getAvatarColor(p.full_name)} rounded-full flex items-center justify-center text-2xl font-black text-white mb-3 shadow-lg ring-4 ring-gray-800 group-hover:scale-110 transition-transform duration-300`}>
                            {p.full_name.charAt(0)}
                        </div>
                        <h3 className="text-lg font-bold text-white truncate w-full">{p.full_name}</h3>
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-400/10 px-2 py-1 rounded mt-1">{p.role}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-center text-xs text-gray-400 border-t border-gray-700 pt-4 mb-4">
                        <div>
                            <span className="block text-white font-bold">{p.branch || '-'}</span>
                            <span>Branch</span>
                        </div>
                        <div>
                            <span className="block text-white font-bold">Year {p.year_of_study || '-'}</span>
                            <span>Academic</span>
                        </div>
                    </div>

                    <button onClick={() => handleArchive(p.user_id)} className="w-full py-2 rounded-lg border border-gray-600 text-gray-400 text-xs font-bold hover:bg-gray-700 hover:text-white transition">
                        Move to Alumni
                    </button>
                </div>
            ))}
        </div>
      </div>

      {/* 3. ALUMNI */}
      {alumni.length > 0 && (
          <div className="bg-gray-800/30 rounded-3xl p-8 border border-dashed border-gray-700">
            <h2 className="text-xl font-bold text-purple-400 mb-6 flex items-center gap-2">
                <span>🎓</span> Hall of Fame / Alumni
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {alumni.map(p => (
                    <div key={p.user_id} className="bg-gray-900 p-4 rounded-xl border border-gray-700 flex items-center justify-between opacity-70 hover:opacity-100 transition">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-500 font-bold text-sm">
                                {p.full_name.charAt(0)}
                            </div>
                            <div>
                                <p className="font-bold text-gray-300 text-sm">{p.full_name}</p>
                                <p className="text-[10px] text-gray-500">Left: {p.leaving_date ? new Date(p.leaving_date).getFullYear() : 'Unknown'}</p>
                            </div>
                        </div>
                        <button onClick={() => handleRestore(p.user_id)} className="text-xs text-green-500 hover:text-green-400 font-bold px-2 py-1 bg-green-500/10 rounded">Restore</button>
                    </div>
                ))}
            </div>
          </div>
      )}

      {/* CREATE MODAL */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-700 overflow-hidden transform transition-all scale-100">
                <div className="bg-gray-900 p-6 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Draft New Player</h2>
                    <button onClick={() => setShowCreate(false)} className="text-gray-500 hover:text-white text-2xl">&times;</button>
                </div>
                <form onSubmit={submitCreate} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs text-gray-400 uppercase">Player ID</label><input type="text" className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white mt-1" value={formData.player_id} onChange={e=>setFormData({...formData, player_id: e.target.value})} required /></div>
                        <div><label className="text-xs text-gray-400 uppercase">Password</label><input type="password" className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white mt-1" value={formData.password} onChange={e=>setFormData({...formData, password: e.target.value})} required /></div>
                    </div>
                    
                    <label className="text-xs text-gray-400 uppercase">Full Name Components</label>
                    <div className="grid grid-cols-3 gap-2">
                        <input type="text" placeholder="First" className="bg-gray-900 border border-gray-600 rounded p-2 text-white" value={formData.first_name} onChange={e=>setFormData({...formData, first_name: e.target.value})} required />
                        <input type="text" placeholder="Middle" className="bg-gray-900 border border-gray-600 rounded p-2 text-white" value={formData.middle_name} onChange={e=>setFormData({...formData, middle_name: e.target.value})} />
                        <input type="text" placeholder="Last" className="bg-gray-900 border border-gray-600 rounded p-2 text-white" value={formData.last_name} onChange={e=>setFormData({...formData, last_name: e.target.value})} required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs text-gray-400 uppercase">Branch</label>
                        <select className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white mt-1" value={formData.branch} onChange={e=>setFormData({...formData, branch: e.target.value})} required>
                            <option value="">Select...</option>
                            {["Printing","AI&DS","CS","IT","Electrical","Mechanical","E&TC"].map(b=><option key={b}>{b}</option>)}
                        </select></div>
                        <div><label className="text-xs text-gray-400 uppercase">Year</label>
                        <select className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white mt-1" value={formData.year_of_study} onChange={e=>setFormData({...formData, year_of_study: e.target.value})}>
                            <option value="1">1st Year</option>
                            <option value="2">2nd Year</option>
                            <option value="3">3rd Year</option>
                            <option value="4">4th Year</option>
                        </select></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs text-gray-400 uppercase">Join Date</label><input type="date" className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white mt-1" value={formData.joining_date} onChange={e=>setFormData({...formData, joining_date: e.target.value})} /></div>
                        <div><label className="text-xs text-gray-400 uppercase">DOB</label><input type="date" className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white mt-1" value={formData.birth_date} onChange={e=>setFormData({...formData, birth_date: e.target.value})} /></div>
                    </div>
                    <button className="w-full bg-blue-600 py-3 rounded font-bold hover:bg-blue-500 shadow-lg mt-4">Create Player</button>
                </form>
            </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editPlayer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-700 overflow-hidden">
                <div className="bg-gray-900 p-6 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Edit Profile: {editPlayer.full_name}</h2>
                    <button onClick={() => setEditPlayer(null)} className="text-gray-500 hover:text-white text-2xl">&times;</button>
                </div>
                <form onSubmit={submitEdit} className="p-6 space-y-4">
                    <label className="text-xs text-gray-400 uppercase">Full Name</label>
                    <div className="grid grid-cols-3 gap-2">
                        <input type="text" className="bg-gray-900 border border-gray-600 rounded p-2 text-white" value={formData.first_name} onChange={e=>setFormData({...formData, first_name: e.target.value})} />
                        <input type="text" className="bg-gray-900 border border-gray-600 rounded p-2 text-white" value={formData.middle_name} onChange={e=>setFormData({...formData, middle_name: e.target.value})} />
                        <input type="text" className="bg-gray-900 border border-gray-600 rounded p-2 text-white" value={formData.last_name} onChange={e=>setFormData({...formData, last_name: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs text-gray-400 uppercase">Branch</label><select className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white mt-1" value={formData.branch} onChange={e=>setFormData({...formData, branch: e.target.value})}>{["Printing","AI&DS","CS","IT","Electrical","Mechanical","E&TC"].map(b=><option key={b}>{b}</option>)}</select></div>
                        <div><label className="text-xs text-gray-400 uppercase">Year</label><input type="number" className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white mt-1" value={formData.year_of_study} onChange={e=>setFormData({...formData, year_of_study: e.target.value})} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs text-gray-400 uppercase">Joined</label><input type="date" className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white mt-1" value={formData.joining_date} onChange={e=>setFormData({...formData, joining_date: e.target.value})} /></div>
                        <div><label className="text-xs text-gray-400 uppercase">DOB</label><input type="date" className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white mt-1" value={formData.birth_date} onChange={e=>setFormData({...formData, birth_date: e.target.value})} /></div>
                    </div>
                    <button className="w-full bg-blue-600 py-3 rounded font-bold hover:bg-blue-500 shadow-lg mt-4">Save Changes</button>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};

export default AdminPlayers;