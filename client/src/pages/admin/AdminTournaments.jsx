import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

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
      const response = await fetch("http://localhost:5000/api/tournaments");
      const jsonData = await response.json();
      setTournaments(jsonData);
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    getTournaments();
  }, []);

  // Handle Form Input
  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Submit New Tournament
  const onSubmitForm = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Tournament Created!");
        setFormData({ name: "", start_date: "", end_date: "" }); // Clear form
        getTournaments(); // Refresh list
      } else {
        toast.error("Failed to create");
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
      
      <h1 className="mb-6 text-3xl font-bold text-yellow-400">🏆 Manage Tournaments</h1>

      {/* CREATE FORM */}
      <div className="mb-8 rounded-lg bg-gray-800 p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold">Create New Tournament</h2>
        <form onSubmit={onSubmitForm} className="grid gap-4 md:grid-cols-4">
          <input
            type="text"
            name="name"
            placeholder="Tournament Name (e.g. IPL 2025)"
            className="rounded bg-gray-700 p-2 text-white focus:outline-none"
            value={formData.name}
            onChange={onChange}
            required
          />
          <input
            type="date"
            name="start_date"
            className="rounded bg-gray-700 p-2 text-white focus:outline-none"
            value={formData.start_date}
            onChange={onChange}
            required
          />
          <input
            type="date"
            name="end_date"
            className="rounded bg-gray-700 p-2 text-white focus:outline-none"
            value={formData.end_date}
            onChange={onChange}
            required
          />
          <button className="rounded bg-yellow-500 font-bold text-black hover:bg-yellow-400">
            Create
          </button>
        </form>
      </div>

      {/* LIST VIEW */}
      <div className="rounded-lg bg-gray-800 p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold">Existing Tournaments</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-700 text-gray-400">
              <th className="pb-2">Name</th>
              <th className="pb-2">Start Date</th>
              <th className="pb-2">End Date</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {tournaments.map((t) => (
              <tr key={t.tournament_id} className="border-b border-gray-700 hover:bg-gray-700">
                <td className="py-3">{t.name}</td>
                <td className="py-3">{new Date(t.start_date).toLocaleDateString()}</td>
                <td className="py-3">{new Date(t.end_date).toLocaleDateString()}</td>
                <td className="py-3">
                  <span className="rounded bg-green-900 px-2 py-1 text-xs text-green-300 uppercase">
                    {t.status}
                  </span>
                </td>
                <td className="py-3">
                    <Link 
                    to={`/admin/tournaments/${t.tournament_id}/squad`}
                    className="rounded bg-blue-600 px-3 py-1 text-xs font-bold text-white hover:bg-blue-500"
                    >
                    Manage Squad
                    </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {tournaments.length === 0 && <p className="mt-4 text-gray-500">No tournaments found.</p>}
      </div>
    </div>
  );
};

export default AdminTournaments;