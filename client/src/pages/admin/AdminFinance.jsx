import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const AdminFinance = () => {
  const [activeTab, setActiveTab] = useState("practice"); 
  const [pendingPractice, setPendingPractice] = useState([]);
  const [pendingTournaments, setPendingTournaments] = useState([]);
  const [players, setPlayers] = useState([]);
  const [ledger, setLedger] = useState({ practice: [], tournament: [], other: [] });
  const [fundBalance, setFundBalance] = useState(0); 
  
  // Ledger Form
  const [formData, setFormData] = useState({ 
      user_id: "", amount: "", type: "payment_in", description: "", 
      date: new Date().toISOString().split('T')[0]
  });
  
  // Billing States
  const [billAmount, setBillAmount] = useState("");
  const [manualSplit, setManualSplit] = useState("");
  const [selectedIds, setSelectedIds] = useState([]); 
  const [desc, setDesc] = useState("");
  const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);

  // Modals
  const [fundModal, setFundModal] = useState(null);
  const [fundForm, setFundForm] = useState({ amount: "", description: "" });
  
  // NEW: State for Ledger Modal (To see detailed list of who paid)
  const [ledgerModalItem, setLedgerModalItem] = useState(null);

  const fetchData = async () => {
    try {
      const recRes = await fetch("https://cricket-api-ll8u.onrender.com/api/finance/all");
      const playRes = await fetch("https://cricket-api-ll8u.onrender.com/api/players");
      const sessRes = await fetch("https://cricket-api-ll8u.onrender.com/api/finance/unbilled");
      const fundRes = await fetch("https://cricket-api-ll8u.onrender.com/api/finance/funds");
      const ledg = await fetch("https://cricket-api-ll8u.onrender.com/api/finance/ledger");
      const tourRes = await fetch("https://cricket-api-ll8u.onrender.com/api/finance/pending-tournaments");

      if (recRes.ok) {} // (Unused here but good for debugging)
      if (playRes.ok) setPlayers(await playRes.json());
      
      if (sessRes.ok) {
          const sessData = await sessRes.json();
          setPendingPractice(Array.isArray(sessData) ? sessData : []);
      }
      if(tourRes.ok) setPendingTournaments(await tourRes.json());
      if (ledg.ok) setLedger(await ledg.json());

      if (fundRes.ok) {
          const fundData = await fundRes.json();
          setFundBalance(fundData ? fundData.balance : 0);
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  const calculateSplit = (total, count) => count > 0 ? (total / count).toFixed(2) : 0;

  // --- ACTIONS ---
  const handleBillPractice = async (session) => {
      if(!billAmount || !manualSplit) return toast.warning("Enter amounts!");
      try {
          await fetch("https://cricket-api-ll8u.onrender.com/api/finance/bill/practice", {
              method: "POST",
              headers: { "Content-Type": "application/json", "token": localStorage.getItem("token") },
              body: JSON.stringify({ 
                  event_id: session.event_id, 
                  per_head_amount: manualSplit, 
                  description: `Practice: ${session.description || 'Session'}`,
                  date: customDate
              })
          });
          toast.success("Billed!");
          fetchData();
          setBillAmount(""); setManualSplit("");
      } catch (err) { console.error(err); }
  };

  const handleBillGeneral = async (type, id=null) => { 
      if(!billAmount || !manualSplit) return toast.warning("Enter amounts!");
      const payload = {
          total_bill: billAmount,
          per_head_amount: manualSplit,
          description: desc,
          tournament_id: id,
          custom_user_ids: type === 'general' ? selectedIds : [],
          date: customDate
      };
      try {
          await fetch("https://cricket-api-ll8u.onrender.com/api/finance/bill/general", {
              method: "POST",
              headers: { "Content-Type": "application/json", "token": localStorage.getItem("token") },
              body: JSON.stringify(payload)
          });
          toast.success("Billed!");
          fetchData();
          setBillAmount(""); setManualSplit(""); setDesc(""); setSelectedIds([]);
      } catch (err) { console.error(err); }
  };

  const handleReimburse = async (recordId, current) => {
      const val = prompt("Enter Reimbursed Amount:", current);
      if(val !== null) {
          await fetch(`https://cricket-api-ll8u.onrender.com/api/finance/reimburse/${recordId}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json", "token": localStorage.getItem("token") },
              body: JSON.stringify({ amount: val })
          });
          fetchData();
          // Refresh modal data if open
          if(ledgerModalItem) {
             // Since fetching whole ledger is async, we do a quick hack or re-fetch.
             // Ideally re-fetch ledger and find the item again. For simplicity, we rely on background refresh.
          }
      }
  };

  const onSubmitLedger = async (e) => {
    e.preventDefault();
    try {
      const body = { ...formData, user_id: formData.user_id || null };
      const response = await fetch("https://cricket-api-ll8u.onrender.com/api/finance/add", {
        method: "POST",
        headers: { "Content-Type": "application/json", "token": localStorage.getItem("token") },
        body: JSON.stringify(body),
      });
      if (response.ok) {
        toast.success("Transaction Logged!");
        setFormData({ user_id: "", amount: "", type: "payment_in", description: "", date: new Date().toISOString().split('T')[0] });
        fetchData();
      }
    } catch (err) { console.error(err); }
  };

  const handleFundUpdate = async () => {
      try {
        const response = await fetch("https://cricket-api-ll8u.onrender.com/api/finance/funds/update", {
            method: "POST",
            headers: { "Content-Type": "application/json", "token": localStorage.getItem("token") },
            body: JSON.stringify({ amount: fundForm.amount, type: fundModal, description: fundForm.description })
        });
        if(response.ok) { toast.success("Fund Updated!"); setFundModal(null); setFundForm({ amount: "", description: "" }); fetchData(); }
      } catch (err) { console.error(err); }
  };
  
  const markAsPaid = async (id) => {
      if(!window.confirm("Confirm payment received?")) return;
      try {
          const response = await fetch(`https://cricket-api-ll8u.onrender.com/api/finance/mark-paid/${id}`, {
              method: "PUT",
              headers: { "token": localStorage.getItem("token") }
          });
          if(response.ok) { toast.success("Marked as Paid"); fetchData(); }
      } catch (err) { console.error(err); }
  };
  const updateReimburse = async (id, currentAmount, totalAmount) => {
    const newAmount = prompt(`Enter Reimbursement Amount (Total: ₹${totalAmount})`, currentAmount);
    if (newAmount !== null) { 
        try {
            await fetch(`https://cricket-api-ll8u.onrender.com/api/finance/reimburse/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "token": localStorage.getItem("token") },
                body: JSON.stringify({ amount: newAmount })
            });
            fetchData();
        } catch (err) { console.error(err); }
    }
  };


  // --- UI COMPONENTS ---

  const BillingCard = ({ title, count, onBill, subtitle }) => (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-xl hover:border-purple-500/50 transition-all duration-300 group">
          <div className="flex justify-between items-start mb-4">
            <div>
                <h3 className="font-bold text-lg text-white group-hover:text-purple-300 transition">{title}</h3>
                <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
            </div>
            <span className="bg-purple-500/20 text-purple-300 text-xs font-bold px-2 py-1 rounded-full border border-purple-500/30">{count} Players</span>
          </div>
          
          <div className="mb-3">
              <label className="text-[10px] text-blue-300 font-bold uppercase mb-1 block tracking-wider">Billing Date</label>
              <input type="date" className="w-full bg-gray-900/80 border border-gray-700 p-2 rounded-lg text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" value={customDate} onChange={e=>setCustomDate(e.target.value)} />
          </div>

          <div className="grid grid-cols-3 gap-3 items-end mb-4">
              <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Total (₹)</label>
                  <input type="number" className="w-full bg-gray-900/80 border border-gray-700 p-2 rounded-lg text-white font-mono" value={billAmount} onChange={e=>setBillAmount(e.target.value)} />
              </div>
              <div className="text-center pb-2">
                  <p className="text-[10px] text-gray-500 uppercase">Suggested</p>
                  <p className="text-sm font-bold text-gray-300">₹{calculateSplit(billAmount, count)}</p>
              </div>
              <div>
                  <label className="text-[10px] text-green-500 font-bold uppercase mb-1 block">Rounded (₹)</label>
                  <input type="number" className="w-full bg-gray-900/80 border border-green-500/50 p-2 rounded-lg text-white font-bold font-mono focus:border-green-400 focus:ring-1 focus:ring-green-400 outline-none" value={manualSplit} onChange={e=>setManualSplit(e.target.value)} />
              </div>
          </div>
          <button onClick={onBill} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-bold text-sm uppercase tracking-widest hover:shadow-lg hover:shadow-purple-500/30 transition-all transform hover:-translate-y-0.5">
              Generate Bill
          </button>
      </div>
  );

  // Ledger Row - Just a summary now, click to open details
  const LedgerSummaryCard = ({ item }) => {
    const totalReimbursed = item.players.reduce((sum, p) => sum + (parseFloat(p.reimbursed) || 0), 0);
    const totalBill = item.amount * item.players.length; // Roughly total expected (if split evenly) or just item.amount if it represents per head. Actually backend returns amount per head usually.
    // Wait, backend 'amount' is per head. So total expected = amount * players.length
    
    const percent = totalBill > 0 ? Math.round((totalReimbursed / totalBill) * 100) : 0;

    return (
        <div 
            onClick={() => setLedgerModalItem(item)}
            className="bg-gray-800/40 border border-gray-700 p-4 rounded-xl cursor-pointer hover:bg-gray-800 hover:border-gray-500 transition group"
        >
            <div className="flex justify-between items-start mb-2">
                <div>
                    <p className="font-bold text-gray-200 text-sm group-hover:text-white">{item.tournament_name || item.description}</p>
                    <p className="text-xs text-gray-500">{new Date(item.payment_date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                    <p className="font-bold text-white text-lg">₹{item.amount}</p>
                    <p className="text-[10px] text-gray-400 uppercase">Per Person</p>
                </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden mt-2">
                <div className={`h-full ${percent === 100 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${percent}%` }}></div>
            </div>
            <div className="flex justify-between mt-1">
                <p className="text-[10px] text-gray-400">{percent}% Collected</p>
                <p className={`text-[10px] font-bold ${percent === 100 ? 'text-green-400' : 'text-yellow-400'}`}>
                    ₹{totalReimbursed} / ₹{totalBill}
                </p>
            </div>
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6 md:p-10 text-white relative overflow-hidden">
        
        {/* Background Glows */}
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-purple-600/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-green-600/10 rounded-full blur-3xl -z-10"></div>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 border-b border-gray-800 pb-6">
            <div>
                <Link to="/admin-dashboard" className="text-gray-500 hover:text-white text-xs font-bold tracking-widest uppercase mb-2 inline-block transition">&larr; Command Center</Link>
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 drop-shadow-lg">
                    FINANCE VAULT
                </h1>
            </div>

            {/* TREASURY CARD */}
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-1 pr-2 flex items-center gap-4 shadow-2xl mt-4 md:mt-0">
                <div className="bg-gray-900 rounded-xl px-5 py-3 border border-gray-700">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Team Treasury</p>
                    <p className="text-3xl font-mono font-bold text-green-400">₹{Number(fundBalance).toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setFundModal("add")} className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/50 text-green-500 hover:bg-green-500 hover:text-black transition font-black text-xl">+</button>
                    <button onClick={() => setFundModal("subtract")} className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-black transition font-black text-xl">-</button>
                </div>
            </div>
        </div>

        {/* TABS */}
        <div className="flex gap-6 mb-8 overflow-x-auto pb-2">
            {['practice', 'tournament', 'other', 'ledger'].map(tab => (
                <button 
                    key={tab}
                    onClick={() => { setActiveTab(tab); setBillAmount(""); setManualSplit(""); }}
                    className={`pb-2 px-1 font-bold text-sm uppercase tracking-widest transition-all whitespace-nowrap ${
                        activeTab === tab 
                        ? 'text-white border-b-4 border-purple-500' 
                        : 'text-gray-500 hover:text-gray-300 border-b-4 border-transparent'
                    }`}
                >
                    {tab === 'ledger' ? '📊 Ledger History' : tab === 'other' ? '📝 Custom Bill' : tab === 'tournament' ? '🏆 Tournament Fees' : '🏋️ Practice Costs'}
                </button>
            ))}
        </div>

        {/* === CONTENT SECTIONS === */}

        {/* 1. PRACTICE */}
        {activeTab === 'practice' && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pendingPractice.map(s => (
                    <BillingCard 
                        key={s.event_id} 
                        title="Unbilled Session" 
                        subtitle={`${new Date(s.date).toLocaleDateString()} • ${s.event_type}`}
                        count={s.present_count}
                        onBill={() => handleBillPractice(s)}
                    />
                ))}
                {pendingPractice.length === 0 && (
                    <div className="col-span-full text-center py-20 bg-gray-800/30 rounded-2xl border border-dashed border-gray-700">
                        <p className="text-gray-500 text-lg">All practice sessions are billed. Good job!</p>
                    </div>
                )}
            </div>
        )}

        {/* 2. TOURNAMENT */}
        {activeTab === 'tournament' && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pendingTournaments.map(t => (
                    <BillingCard 
                        key={t.tournament_id}
                        title={t.name}
                        subtitle={`Start: ${new Date(t.start_date).toLocaleDateString()}`}
                        count={players.length} 
                        onBill={() => { setDesc(`${t.name} Fee`); handleBillGeneral('tournament', t.tournament_id); }}
                    />
                ))}
                {pendingTournaments.length === 0 && (
                    <div className="col-span-full text-center py-20 bg-gray-800/30 rounded-2xl border border-dashed border-gray-700">
                        <p className="text-gray-500 text-lg">No new tournaments pending billing.</p>
                    </div>
                )}
            </div>
        )}

        {/* 3. OTHER */}
        {activeTab === 'other' && (
            <div className="max-w-3xl mx-auto bg-gray-800 border border-gray-700 rounded-2xl p-8 shadow-2xl">
                <div className="mb-6 border-b border-gray-700 pb-4">
                    <h2 className="text-2xl font-bold text-white">Custom Team Expense</h2>
                    <p className="text-gray-400 text-sm">Split any cost (party, travel, food) amongst specific players.</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                     <div>
                        <label className="text-xs text-blue-300 font-bold uppercase mb-1 block">Billing Date</label>
                        <input type="date" className="w-full bg-gray-900 border border-gray-600 p-3 rounded-lg text-white" value={customDate} onChange={e=>setCustomDate(e.target.value)} />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 font-bold uppercase mb-1 block">Description</label>
                        <input type="text" placeholder="e.g. Bus Rent" className="w-full bg-gray-900 border border-gray-600 p-3 rounded-lg text-white" value={desc} onChange={e=>setDesc(e.target.value)} />
                    </div>
                </div>

                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 mb-6">
                    <div className="flex justify-between items-center mb-3">
                        <label className="text-xs text-gray-400 font-bold uppercase">Select Payers</label>
                        <span className="text-xs bg-gray-700 px-2 py-1 rounded text-white">{selectedIds.length > 0 ? selectedIds.length : players.length} Selected</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto custom-scrollbar">
                        {players.map(p => (
                            <label key={p.user_id} className={`flex items-center gap-2 p-2 rounded cursor-pointer border transition-all ${selectedIds.includes(p.user_id) ? 'bg-purple-500/20 border-purple-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'}`}>
                                <input type="checkbox" className="accent-purple-500" onChange={e => {
                                    if(e.target.checked) setSelectedIds([...selectedIds, p.user_id]);
                                    else setSelectedIds(selectedIds.filter(id => id !== p.user_id));
                                }} />
                                <span className="text-xs font-bold truncate">{p.full_name}</span>
                            </label>
                        ))}
                    </div>
                    <p className="text-[10px] text-gray-500 mt-2 text-center italic">Leave empty to bill everyone.</p>
                </div>

                <BillingCard 
                    title="Finalize Bill" 
                    subtitle="Review amounts before sending"
                    count={selectedIds.length > 0 ? selectedIds.length : players.length}
                    onBill={() => handleBillGeneral('general')}
                />
            </div>
        )}

        {/* 4. LEDGER DASHBOARD */}
        {activeTab === 'ledger' && (
            <div className="grid gap-8 lg:grid-cols-3">
                
                {/* Col 1: Practice */}
                <div className="bg-gray-800/30 p-4 rounded-2xl border border-gray-700/50">
                    <h3 className="text-teal-400 font-black uppercase text-xs tracking-widest mb-4 border-b border-gray-700 pb-2">Practice History</h3>
                    <div className="space-y-3">
                        {ledger.practice.map(item => <LedgerSummaryCard key={item.related_event_id} item={item} />)}
                    </div>
                </div>

                {/* Col 2: Tournaments */}
                <div className="bg-gray-800/30 p-4 rounded-2xl border border-gray-700/50">
                    <h3 className="text-yellow-400 font-black uppercase text-xs tracking-widest mb-4 border-b border-gray-700 pb-2">Tournament Fees</h3>
                    <div className="space-y-3">
                        {ledger.tournament.map(item => <LedgerSummaryCard key={item.related_tournament_id} item={item} />)}
                    </div>
                </div>

                {/* Col 3: Other/Manual */}
                <div className="bg-gray-800/30 p-4 rounded-2xl border border-gray-700/50">
                    <h3 className="text-blue-400 font-black uppercase text-xs tracking-widest mb-4 border-b border-gray-700 pb-2">Ad-Hoc / Other</h3>
                    
                    {/* Mini Manual Form */}
                    <div className="mb-4 bg-gray-800 p-3 rounded-lg border border-gray-600">
                         <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Quick Manual Entry</p>
                         <div className="grid grid-cols-2 gap-2 mb-2">
                             <select name="type" className="bg-gray-900 text-xs p-1 rounded text-white" value={formData.type} onChange={e => setFormData({ ...formData, [e.target.name]: e.target.value })}><option value="payment_in">In (Cash)</option><option value="expense">Out (Exp)</option></select>
                             <input type="number" placeholder="₹" className="bg-gray-900 text-xs p-1 rounded text-white" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} />
                         </div>
                         <select name="user_id" className="w-full bg-gray-900 text-xs p-1 rounded text-white mb-2" value={formData.user_id} onChange={e => setFormData({ ...formData, user_id: e.target.value })}><option value="">Select Payer...</option>{players.map(p => <option key={p.user_id} value={p.user_id}>{p.full_name}</option>)}</select>
                         <input type="text" placeholder="Desc" className="w-full bg-gray-900 text-xs p-1 rounded text-white mb-2" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                         <button onClick={onSubmitLedger} className="w-full bg-purple-600 text-xs font-bold py-1 rounded hover:bg-purple-500">Log Entry</button>
                    </div>

                    <div className="space-y-3">
                        {ledger.other.map((item, i) => <LedgerSummaryCard key={i} item={item} />)}
                    </div>
                </div>
            </div>
        )}

        {/* --- MODALS --- */}

        {/* Fund Modal */}
        {fundModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-gray-600 transform transition-all scale-100">
                  <h2 className="text-xl font-bold mb-4 text-white">
                      {fundModal === 'add' ? 'Top-up Team Funds' : 'Withdraw Team Funds'}
                  </h2>
                  <div className="flex flex-col gap-4">
                      <input type="number" placeholder="Amount (₹)" className="p-3 rounded-lg bg-gray-900 text-white border border-gray-600 focus:border-blue-500 outline-none" value={fundForm.amount} onChange={e => setFundForm({...fundForm, amount: e.target.value})} autoFocus />
                      <input type="text" placeholder="Reason (e.g. Donation)" className="p-3 rounded-lg bg-gray-900 text-white border border-gray-600 focus:border-blue-500 outline-none" value={fundForm.description} onChange={e => setFundForm({...fundForm, description: e.target.value})} />
                      <div className="flex gap-2 mt-2">
                          <button onClick={() => setFundModal(null)} className="flex-1 bg-gray-700 py-3 rounded-xl hover:bg-gray-600 transition">Cancel</button>
                          <button onClick={handleFundUpdate} className={`flex-1 py-3 rounded-xl font-bold shadow-lg ${fundModal === 'add' ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'}`}>
                              {fundModal === 'add' ? 'Deposit' : 'Withdraw'}
                          </button>
                      </div>
                  </div>
              </div>
          </div>
        )}

        {/* Ledger Detail Modal */}
        {ledgerModalItem && (
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
                <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-600 flex flex-col max-h-[90vh]">
                    <div className="p-6 border-b border-gray-700 flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-white">{ledgerModalItem.tournament_name || ledgerModalItem.description}</h2>
                            <p className="text-gray-400 text-sm mt-1">{new Date(ledgerModalItem.payment_date).toLocaleDateString()} • Total Bill: <span className="text-white font-bold">₹{ledgerModalItem.amount * ledgerModalItem.players.length}</span></p>
                        </div>
                        <button onClick={() => setLedgerModalItem(null)} className="text-gray-500 hover:text-white text-2xl">&times;</button>
                    </div>
                    
                    <div className="p-0 overflow-y-auto flex-1 custom-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-gray-900/50 text-gray-400 text-xs uppercase sticky top-0 backdrop-blur-md">
                                <tr>
                                    <th className="p-4">Player</th>
                                    <th className="p-4 text-center">Bill Share</th>
                                    <th className="p-4 text-center">Reimbursed</th>
                                    <th className="p-4 text-right">Update</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {ledgerModalItem.players.map(p => (
                                    <tr key={p.id} className="hover:bg-gray-700/30">
                                        <td className="p-4 font-medium text-white">{p.name}</td>
                                        <td className="p-4 text-center text-gray-400">₹{p.amount}</td>
                                        <td className={`p-4 text-center font-bold ${parseFloat(p.reimbursed) >= parseFloat(p.amount) ? 'text-green-400' : 'text-yellow-400'}`}>
                                            ₹{p.reimbursed || 0}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button onClick={()=>handleReimburse(p.id, p.reimbursed)} className="text-xs bg-blue-600/20 text-blue-400 border border-blue-500/50 px-3 py-1 rounded hover:bg-blue-600 hover:text-white transition">
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t border-gray-700 bg-gray-800 rounded-b-2xl text-center">
                        <button onClick={() => setLedgerModalItem(null)} className="text-gray-400 text-sm hover:text-white">Close Details</button>
                    </div>
                </div>
            </div>
        )}

    </div>
  );
};

export default AdminFinance;