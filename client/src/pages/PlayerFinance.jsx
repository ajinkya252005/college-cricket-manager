import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../config";

const PlayerFinance = () => {
  const [categories, setCategories] = useState({ practice: [], tournament: [], other: [] });
  const [stats, setStats] = useState({ totalSpent: 0, totalReceived: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        const verifyRes = await fetch(`${API_BASE_URL}/api/auth/verify`, {
            method: "GET",
            headers: { token: localStorage.getItem("token") }
        });
        const user = await verifyRes.json();

        if (user.user_id) {
            const res = await fetch(`${API_BASE_URL}/api/finance/my/${user.user_id}`);
            const data = await res.json();

            // 1. Calculate Totals
            let spent = 0;    
            let received = 0; 

            data.forEach(r => {
                if(r.type === 'payment_in') {
                    spent += parseFloat(r.amount || 0);
                    received += parseFloat(r.reimbursed_amount || 0);
                }
            });

            setStats({ 
                totalSpent: spent, 
                totalReceived: received, 
                pending: spent - received 
            });

            // 2. Categorize Data
            const practice = data.filter(r => r.related_event_id);
            const tournament = data.filter(r => r.related_tournament_id);
            const other = data.filter(r => !r.related_event_id && !r.related_tournament_id);

            setCategories({ practice, tournament, other });
            setLoading(false);
        }
      } catch (err) { console.error(err.message); setLoading(false); }
    };
    getData();
  }, []);

  // --- UI COMPONENT: TRANSACTION ROW ---
  const TransactionRow = ({ r }) => {
      const paid = parseFloat(r.amount);
      const reimbursed = parseFloat(r.reimbursed_amount || 0);
      
      let statusColor, statusText;
      if (reimbursed >= paid) {
          statusColor = "text-green-400 bg-green-400/10 border-green-400/20";
          statusText = "Settled";
      } else if (reimbursed > 0) {
          statusColor = "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
          statusText = `Partial (${Math.round((reimbursed/paid)*100)}%)`;
      } else {
          statusColor = "text-gray-400 bg-gray-700/30 border-gray-600";
          statusText = "No Return";
      }

      return (
        <div className="flex items-center justify-between p-4 bg-gray-800/30 border border-gray-700/50 rounded-xl hover:bg-gray-800/50 transition mb-3">
            <div className="flex items-center gap-4">
                <div className="flex flex-col items-center justify-center w-12 h-12 bg-gray-800 rounded-lg border border-gray-700 text-xs font-bold text-gray-500 uppercase">
                    <span>{new Date(r.final_date).getDate()}</span>
                    <span>{new Date(r.final_date).toLocaleString('default', { month: 'short' })}</span>
                </div>
                <div>
                    <p className="text-white font-bold text-sm">{r.description}</p>
                    <p className="text-xs text-gray-500">{new Date(r.final_date).toLocaleDateString()}</p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-white font-bold">₹{paid}</p>
                {reimbursed > 0 && <p className="text-xs text-green-400">+₹{reimbursed} back</p>}
                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold border ${statusColor}`}>
                    {statusText}
                </span>
            </div>
        </div>
      );
  };

  // --- UI COMPONENT: SECTION ---
  const FinanceSection = ({ title, icon, data, color }) => (
    <div className="mb-10">
        <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${color}`}>
            <span className="text-xl">{icon}</span> {title}
            <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-full ml-auto">{data.length} Records</span>
        </h3>
        {data.length > 0 ? (
            data.map(r => <TransactionRow key={r.record_id} r={r} />)
        ) : (
            <div className="p-6 bg-gray-800/20 border border-dashed border-gray-700 rounded-xl text-center text-gray-500 text-sm">
                No transactions recorded in this category.
            </div>
        )}
    </div>
  );

  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white tracking-widest animate-pulse">LOADING WALLET...</div>;

  return (
    <div className="min-h-screen bg-[#0f172a] p-6 md:p-10 text-white relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-full h-96 bg-gradient-to-b from-purple-900/20 to-gray-900 -z-10"></div>
      
      <div className="max-w-5xl mx-auto">
        <Link to="/dashboard" className="text-gray-500 hover:text-white text-xs font-bold tracking-widest uppercase mb-8 inline-block transition">&larr; Locker Room</Link>
        
        <div className="flex justify-between items-end mb-10">
            <div>
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                    MY WALLET
                </h1>
                <p className="text-gray-400 mt-2 text-sm">Track your team investments & reimbursements.</p>
            </div>
        </div>

        {/* CARDS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            
            {/* Card 1: Spent */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 shadow-2xl transform hover:-translate-y-1 transition duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-20"><span className="text-6xl">💸</span></div>
                <p className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-1">Total Invested</p>
                <p className="text-4xl font-black text-white">₹{stats.totalSpent}</p>
                <p className="text-[10px] text-blue-200 mt-4">Amount paid out of pocket</p>
            </div>

            {/* Card 2: Received */}
            <div className="relative overflow-hidden bg-gradient-to-br from-green-600 to-emerald-800 rounded-2xl p-6 shadow-2xl transform hover:-translate-y-1 transition duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-20"><span className="text-6xl">🏦</span></div>
                <p className="text-green-200 text-xs font-bold uppercase tracking-wider mb-1">Reimbursed</p>
                <p className="text-4xl font-black text-white">₹{stats.totalReceived}</p>
                <p className="text-[10px] text-green-200 mt-4">Amount received back</p>
            </div>

            {/* Card 3: Net Expense */}
            <div className="relative overflow-hidden bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-xl transform hover:-translate-y-1 transition duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-10"><span className="text-6xl">📉</span></div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Net Expense</p>
                <p className="text-4xl font-black text-white">₹{stats.pending}</p>
                <p className="text-[10px] text-gray-500 mt-4">Actual cost after returns</p>
            </div>

        </div>

        {/* SECTIONS */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8 shadow-2xl">
            <FinanceSection title="Practice & Training" icon="🏋️" data={categories.practice} color="text-teal-400" />
            <FinanceSection title="Tournament Fees" icon="🏆" data={categories.tournament} color="text-yellow-400" />
            <FinanceSection title="Other Expenses" icon="📝" data={categories.other} color="text-blue-400" />
        </div>

      </div>
    </div>
  );
};

export default PlayerFinance;