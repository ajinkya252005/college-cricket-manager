import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const AdminFinance = () => {
  const [records, setRecords] = useState([]);
  const [players, setPlayers] = useState([]);
  
  const [formData, setFormData] = useState({
    user_id: "",
    amount: "",
    type: "payment_in", // Default to incoming payment
    description: "",
  });

  // Fetch Data (Records + List of Players to select from)
  const fetchData = async () => {
    try {
      const recRes = await fetch("http://localhost:5000/api/finance/all");
      const playRes = await fetch("http://localhost:5000/api/players"); // Reuse our players API!

      setRecords(await recRes.json());
      setPlayers(await playRes.json());
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Submit New Transaction
  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const body = {
        ...formData,
        user_id: formData.user_id === "" ? null : formData.user_id // Handle empty as null
      };

      const response = await fetch("http://localhost:5000/api/finance/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        toast.success("Transaction Logged!");
        setFormData({ user_id: "", amount: "", type: "payment_in", description: "" });
        fetchData();
      } else {
        toast.error("Failed to log transaction");
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  const updateReimburse = async (id, currentAmount, totalAmount) => {
    // Ask admin for amount (Default to full amount if 0, or keep current)
    const newAmount = prompt(
        `Enter Reimbursement Amount (Total: ₹${totalAmount})`, 
        currentAmount
    );

    if (newAmount !== null) { // If they didn't click Cancel
        try {
            const response = await fetch(`http://localhost:5000/api/finance/reimburse/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: newAmount })
            });
            if(response.ok) {
                toast.success("Updated Reimbursement!");
                fetchData();
            }
        } catch (err) {
            console.error(err.message);
        }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      <Link to="/admin-dashboard" className="text-gray-400 hover:text-white mb-4 inline-block">&larr; Back to Dashboard</Link>
      
      <h1 className="mb-6 text-3xl font-bold text-purple-400">💰 Team Finance Ledger</h1>

      {/* CREATE FORM */}
      <div className="mb-8 rounded-lg bg-gray-800 p-6 shadow-lg border-t-4 border-purple-500">
        <h2 className="mb-4 text-xl font-bold">Log New Transaction</h2>
        <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-5">
          
          <select
            name="type"
            className="rounded bg-gray-700 p-2 text-white"
            value={formData.type}
            onChange={onChange}
          >
            <option value="payment_in">Incoming (Player Pays)</option>
            <option value="expense">Expense (Team Spends)</option>
          </select>

          {/* Only show Player Dropdown if it's NOT an expense */}
          {formData.type === "payment_in" && (
            <select
                name="user_id"
                className="rounded bg-gray-700 p-2 text-white"
                value={formData.user_id}
                onChange={onChange}
                required
            >
                <option value="">Select Player</option>
                {players.map(p => (
                    <option key={p.user_id} value={p.user_id}>{p.full_name} ({p.player_id})</option>
                ))}
            </select>
          )}

          <input
            type="number"
            name="amount"
            placeholder="Amount (₹)"
            className="rounded bg-gray-700 p-2 text-white"
            value={formData.amount}
            onChange={onChange}
            required
          />

          <input
            type="text"
            name="description"
            placeholder="Description (e.g. Jersey Fee)"
            className="rounded bg-gray-700 p-2 text-white md:col-span-1"
            value={formData.description}
            onChange={onChange}
            required
          />

          <button className="rounded bg-purple-600 font-bold text-white hover:bg-purple-500">
            Log Transaction
          </button>
        </form>
      </div>

      {/* LEDGER TABLE */}
      <div className="rounded-lg bg-gray-800 p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold">Recent Transactions</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-700 text-gray-400">
              <th className="pb-2">Date</th>
              <th className="pb-2">Type</th>
              <th className="pb-2">Description</th>
              <th className="pb-2">Player</th>
              <th className="pb-2">Amount</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.record_id} className="border-b border-gray-700 hover:bg-gray-700">
                <td className="py-3">{new Date(r.payment_date).toLocaleDateString()}</td>
                <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs uppercase ${r.type === 'payment_in' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                        {r.type === 'payment_in' ? 'Income' : 'Expense'}
                    </span>
                </td>
                <td className="py-3">{r.description}</td>
                <td className="py-3 text-gray-400">{r.full_name || "Team Expense"}</td>
                <td className="py-3 font-bold">₹{r.amount}</td>
                <td className="py-3">
                    {r.type === 'expense' ? (
                        <span className="text-gray-500">-</span>
                    ) : (
                        <div>
                            {/* Show Partial Status */}
                            <span className={`px-2 py-1 rounded text-xs uppercase ${
                                parseFloat(r.reimbursed_amount) >= parseFloat(r.amount) 
                                ? 'bg-blue-900 text-blue-300' // Fully Reimbursed
                                : parseFloat(r.reimbursed_amount) > 0 
                                    ? 'bg-yellow-900 text-yellow-300' // Partially
                                    : 'bg-red-900 text-red-300' // None
                            }`}>
                                {parseFloat(r.reimbursed_amount) >= parseFloat(r.amount) ? 'Full' : 'Partial'}
                            </span>
                            <div className="text-xs text-gray-400 mt-1">
                                Recvd: ₹{r.reimbursed_amount}
                            </div>
                        </div>
                    )}
                </td>
                <td className="py-3">
                    {r.type === 'payment_in' && (
                        <button 
                            onClick={() => updateReimburse(r.record_id, r.reimbursed_amount, r.amount)}
                            className="text-xs border border-blue-500 text-blue-400 px-2 py-1 rounded hover:bg-blue-500 hover:text-white"
                        >
                            Edit Reimburse
                        </button>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminFinance;