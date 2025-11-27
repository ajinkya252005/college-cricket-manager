import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const AdminPlayers = () => {
  const [pending, setPending] = useState([]);
  const [active, setActive] = useState([]);

  // Fetch Data
  const fetchData = async () => {
    try {
      // Get Pending
      const pendingRes = await fetch("http://localhost:5000/api/players/pending");
      setPending(await pendingRes.json());

      // Get Active (Using our existing route)
      const activeRes = await fetch("http://localhost:5000/api/players");
      setActive(await activeRes.json());
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Approve
  const handleApprove = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/players/approve/${id}`, {
        method: "PUT"
      });
      if(response.ok) {
        toast.success("Player Approved!");
        fetchData(); // Refresh list
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  // Handle Reject
  const handleReject = async (id) => {
    if(!window.confirm("Are you sure you want to reject and delete this request?")) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/players/reject/${id}`, {
        method: "DELETE"
      });
      if(response.ok) {
        toast.error("Player Rejected");
        fetchData();
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      <Link to="/admin-dashboard" className="text-gray-400 hover:text-white mb-4 inline-block">&larr; Back to Dashboard</Link>
      
      <h1 className="mb-6 text-3xl font-bold text-blue-400">👥 Player Manager</h1>

      {/* SECTION 1: PENDING REQUESTS */}
      <div className="mb-8 rounded-lg bg-gray-800 p-6 shadow-lg border-l-4 border-yellow-500">
        <h2 className="mb-4 text-xl font-bold text-yellow-400 flex items-center">
            ⏳ Pending Requests 
            <span className="ml-2 bg-yellow-600 text-white text-sm px-2 py-1 rounded-full">{pending.length}</span>
        </h2>
        
        {pending.length === 0 ? (
            <p className="text-gray-500">No new registration requests.</p>
        ) : (
            <div className="space-y-3">
                {pending.map(p => (
                    <div key={p.user_id} className="flex flex-col md:flex-row items-center justify-between bg-gray-700 p-4 rounded">
                        <div>
                            <p className="font-bold text-lg">{p.full_name} <span className="text-sm text-gray-400">({p.player_id})</span></p>
                            <p className="text-sm text-gray-400">{p.branch} • Year {p.year_of_study}</p>
                        </div>
                        <div className="flex gap-2 mt-3 md:mt-0">
                            <button 
                                onClick={() => handleApprove(p.user_id)}
                                className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded font-bold"
                            >
                                ✓ Approve
                            </button>
                            <button 
                                onClick={() => handleReject(p.user_id)}
                                className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded font-bold"
                            >
                                ✕ Reject
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* SECTION 2: ACTIVE ROSTER */}
      <div className="rounded-lg bg-gray-800 p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold text-blue-400">✅ Active Players ({active.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {active.map(p => (
                <div key={p.user_id} className="bg-gray-700 p-3 rounded flex items-center justify-between">
                    <span>{p.full_name}</span>
                    <span className="text-xs text-gray-400 uppercase">{p.role}</span>
                </div>
            ))}
        </div>
      </div>

    </div>
  );
};

export default AdminPlayers;