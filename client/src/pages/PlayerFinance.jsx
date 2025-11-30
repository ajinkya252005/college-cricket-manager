import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const PlayerFinance = () => {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({ totalPaid: 0, totalReimbursed: 0 });

  useEffect(() => {
    const getData = async () => {
      try {
        // 1. Get User ID first
        const verifyRes = await fetch("http://localhost:5000/api/auth/verify", {
            method: "GET",
            headers: { token: localStorage.getItem("token") }
        });
        const user = await verifyRes.json();

        // 2. Fetch My Finance Records
        if (user.user_id) {
            const res = await fetch(`http://localhost:5000/api/finance/my/${user.user_id}`);
            const data = await res.json();
            setRecords(data);

            // 3. Calculate Totals
            let paid = 0;
            let reimbursed = 0;
            data.forEach(r => {
                if(r.type === 'payment_in') {
                    paid += parseFloat(r.amount);
                    reimbursed += parseFloat(r.reimbursed_amount || 0);
                }
            });
            setStats({ totalPaid: paid, totalReimbursed: reimbursed });
        }

      } catch (err) {
        console.error(err.message);
      }
    };

    getData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Link to="/dashboard" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Back to Dashboard</Link>
      
      <h1 className="text-3xl font-bold text-gray-800 mb-6">💰 My Financials</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded shadow border-l-4 border-blue-500">
            <h3 className="text-gray-500 font-bold">Total Paid</h3>
            <p className="text-2xl font-bold">₹{stats.totalPaid}</p>
        </div>
        <div className="bg-white p-6 rounded shadow border-l-4 border-green-500">
            <h3 className="text-gray-500 font-bold">Reimbursed</h3>
            <p className="text-2xl font-bold">₹{stats.totalReimbursed}</p>
        </div>
        <div className="bg-white p-6 rounded shadow border-l-4 border-purple-500">
            <h3 className="text-gray-500 font-bold">Net Spend</h3>
            <p className="text-2xl font-bold">₹{stats.totalPaid - stats.totalReimbursed}</p>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="p-4">Date</th>
              <th className="p-4">Description</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.record_id} className="border-b hover:bg-gray-50">
                <td className="p-4">{new Date(r.payment_date).toLocaleDateString()}</td>
                <td className="p-4 font-semibold">{r.description}</td>
                <td className="p-4 font-bold">₹{r.amount}</td>
                <td className="p-4">
                    {r.status === 'pending' ? (
                        <span className="px-2 py-1 rounded text-xs uppercase bg-red-100 text-red-800 font-bold border border-red-200">
                            Due / Pending
                        </span>
                    ) : (
                        <div className="flex flex-col">
                            <span className="text-sm font-bold">
                                ₹{r.reimbursed_amount} / ₹{r.amount}
                            </span>
                            <span className={`text-xs uppercase font-bold ${
                                parseFloat(r.reimbursed_amount) >= parseFloat(r.amount) 
                                ? 'text-green-600' 
                                : parseFloat(r.reimbursed_amount) > 0 
                                    ? 'text-yellow-600' 
                                    : 'text-green-600' // Paid but no reimburse
                            }`}>
                                {parseFloat(r.reimbursed_amount) > 0 ? 'Reimbursed' : 'Paid'}
                            </span>
                        </div>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {records.length === 0 && <p className="p-6 text-center text-gray-500">No transactions found.</p>}
      </div>
    </div>
  );
};

export default PlayerFinance;