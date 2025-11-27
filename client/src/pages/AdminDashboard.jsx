import React from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const AdminDashboard = ({ setAuth }) => {
  const logout = (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    setAuth(false);
    toast.success("Logged out successfully");
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-10 border-b border-gray-700 pb-4">
        <h1 className="text-3xl font-bold text-blue-400">🛡️ Admin Control Center</h1>
        <button
          onClick={(e) => logout(e)}
          className="rounded bg-red-600 px-4 py-2 font-bold hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {/* Admin Actions Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        
        {/* Card 1: Tournaments */}
        <Link to="/admin/tournaments" className="block transform rounded-lg bg-gray-800 p-6 shadow-lg transition hover:scale-105 hover:bg-gray-750">
          <h2 className="mb-2 text-2xl font-bold text-yellow-400">🏆 Tournaments</h2>
          <p className="text-gray-400">Create new tournaments and manage squads.</p>
        </Link>

        {/* Card 2: Matches */}
        <Link to="/admin/matches" className="block transform rounded-lg bg-gray-800 p-6 shadow-lg transition hover:scale-105 hover:bg-gray-750">
          <h2 className="mb-2 text-2xl font-bold text-green-400">🏏 Matches</h2>
          <p className="text-gray-400">Schedule matches and enter scorecards.</p>
        </Link>

        {/* Card 3: Players */}
        <Link to="/admin/players" className="block transform rounded-lg bg-gray-800 p-6 shadow-lg transition hover:scale-105 hover:bg-gray-750">
          <h2 className="mb-2 text-2xl font-bold text-blue-400">👥 Player Manager</h2>
          <p className="text-gray-400">Approve registrations and edit profiles.</p>
        </Link>

        {/* Card 4: Finance */}
        <Link to="/admin/finance" className="block transform rounded-lg bg-gray-800 p-6 shadow-lg transition hover:scale-105 hover:bg-gray-750">
          <h2 className="mb-2 text-2xl font-bold text-purple-400">💰 Finance</h2>
          <p className="text-gray-400">Log payments and track expenses.</p>
        </Link>

        {/* Card 4: Attendance */}
        <Link to="/admin/attendance" className="block transform rounded-lg bg-gray-800 p-6 shadow-lg transition hover:scale-105 hover:bg-gray-750">
          <h2 className="mb-2 text-2xl font-bold text-teal-400">📅 Attendance</h2>
          <p className="text-gray-400">Mark daily practice attendance.</p>
        </Link>

      </div>
    </div>
  );
};

export default AdminDashboard;