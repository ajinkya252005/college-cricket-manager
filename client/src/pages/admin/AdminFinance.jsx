import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const AdminFinance = () => {
  const [activeTab, setActiveTab] = useState("practice"); 
  const [pendingPractice, setPendingPractice] = useState([]);
  const [pendingTournaments, setPendingTournaments] = useState([]);
  const [players, setPlayers] = useState([]);
  const [ledger, setLedger] = useState({ practice: [], tournament: [], other: [] });
  
  // Billing States
  const [billAmount, setBillAmount] = useState("");
  const [manualSplit, setManualSplit] = useState("");
  const [selectedIds, setSelectedIds] = useState([]); // For custom billing
  const [desc, setDesc] = useState("");

  const fetchData = async () => {
    try {
      const prac = await fetch("http://localhost:5000/api/finance/pending-practice");
      const tourn = await fetch("http://localhost:5000/api/finance/pending-tournaments");
      const play = await fetch("http://localhost:5000/api/players");
      const ledg = await fetch("http://localhost:5000/api/finance/ledger");

      setPendingPractice(await prac.json());
      setPendingTournaments(await tourn.json());
      setPlayers(await play.json());
      setLedger(await ledg.json());
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  // --- HELPERS ---
  const calculateSplit = (total, count) => count > 0 ? (total / count).toFixed(2) : 0;

  // --- ACTIONS ---
  const handleBillPractice = async (session) => {
      if(!billAmount || !manualSplit) return toast.warning("Enter amounts!");
      try {
          await fetch("http://localhost:5000/api/finance/bill/practice", {
              method: "POST",
              headers: { "Content-Type": "application/json", "token": localStorage.getItem("token") },
              body: JSON.stringify({ 
                  event_id: session.event_id, 
                  per_head_amount: manualSplit, 
                  description: `Practice: ${session.description || 'Session'} (${new Date(session.date).toLocaleDateString()})` 
              })
          });
          toast.success("Billed!");
          fetchData();
          setBillAmount(""); setManualSplit("");
      } catch (err) { console.error(err); }
  };

  const handleBillGeneral = async (type, id=null) => { // type: 'tournament' or 'general'
      if(!billAmount || !manualSplit) return toast.warning("Enter amounts!");
      const payload = {
          total_bill: billAmount,
          per_head_amount: manualSplit,
          description: desc,
          tournament_id: id,
          custom_user_ids: type === 'general' ? selectedIds : [] // Empty means all active
      };
      try {
          await fetch("http://localhost:5000/api/finance/bill/general", {
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
          await fetch(`http://localhost:5000/api/finance/reimburse/${recordId}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json", "token": localStorage.getItem("token") },
              body: JSON.stringify({ amount: val })
          });
          fetchData();
      }
  };

  // --- RENDER COMPONENT: BILLING CARD ---
  const BillingCard = ({ title, count, onBill }) => (
      <div className="bg-gray-800 p-4 rounded mb-4 border border-gray-700">
          <h3 className="font-bold text-lg mb-2">{title}</h3>
          <div className="grid grid-cols-3 gap-2 items-end">
              <div>
                  <label className="text-xs text-gray-400">Total Amount</label>
                  <input type="number" className="w-full bg-gray-900 p-1 rounded" value={billAmount} onChange={e=>setBillAmount(e.target.value)} />
              </div>
              <div className="text-center text-xs text-gray-500 pb-2">
                  Suggested: {calculateSplit(billAmount, count)}
              </div>
              <div>
                  <label className="text-xs text-gray-400">Your Split</label>
                  <input type="number" className="w-full bg-gray-900 p-1 rounded border border-green-600" value={manualSplit} onChange={e=>setManualSplit(e.target.value)} />
              </div>
          </div>
          <button onClick={onBill} className="w-full mt-3 bg-green-600 py-1 rounded font-bold hover:bg-green-500">Bill {count} Players</button>
      </div>
  );

  // --- RENDER COMPONENT: LEDGER ROW ---
  const LedgerRow = ({ item }) => {
      const [isOpen, setIsOpen] = useState(false);
      
      // Calculate Total Reimbursed for this event
      const totalReimbursed = item.players.reduce((sum, p) => sum + (parseFloat(p.reimbursed) || 0), 0);
      const totalBill = item.amount; // The total expense amount
      const displayTitle = item.tournament_name || item.description;
      const displayDate = item.start_date || item.payment_date;
      return (
          <div className="bg-gray-800 rounded mb-2 overflow-hidden border border-gray-700">
              <div onClick={() => setIsOpen(!isOpen)} className="p-3 flex justify-between items-center cursor-pointer hover:bg-gray-700 transition">
                  <div>
                      <p className="font-bold text-sm text-purple-300">{displayTitle}</p>
                      <p className="text-xs text-gray-400">{new Date(displayDate).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                      <p className="font-bold text-white">₹{totalBill}</p>
                      <p className="text-xs text-green-400">Recvd: ₹{totalReimbursed}</p>
                  </div>
              </div>
              
              {isOpen && (
                  <div className="bg-gray-900 p-3 border-t border-gray-700 animate-fadeIn">
                      <table className="w-full text-xs text-left">
                          <thead>
                              <tr className="text-gray-500 uppercase border-b border-gray-700">
                                  <th className="py-2">Player</th>
                                  <th className="py-2 text-center">Paid (Share)</th>
                                  <th className="py-2 text-center">Reimbursed</th>
                                  <th className="py-2 text-right">Action</th>
                              </tr>
                          </thead>
                          <tbody>
                              {item.players.map(p => (
                                  <tr key={p.id} className="border-b border-gray-800 hover:bg-gray-800">
                                      <td className="py-2 font-medium">{p.name}</td>
                                      <td className="py-2 text-center text-gray-300">₹{p.amount}</td>
                                      <td className={`py-2 text-center font-bold ${parseFloat(p.reimbursed) >= parseFloat(p.amount) ? 'text-green-500' : 'text-yellow-500'}`}>
                                          ₹{p.reimbursed || 0}
                                      </td>
                                      <td className="py-2 text-right">
                                          <button 
                                            onClick={()=>handleReimburse(p.id, p.reimbursed)} 
                                            className="text-blue-400 hover:text-blue-300 border border-blue-900 bg-blue-900 bg-opacity-20 px-2 py-1 rounded"
                                          >
                                              Edit
                                          </button>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              )}
          </div>
      );
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
        <Link to="/admin-dashboard" className="text-gray-400">&larr; Back</Link>
        <h1 className="text-3xl font-bold text-purple-400 mb-6 mt-2">💰 Finance & Billing</h1>

        {/* TABS */}
        <div className="flex border-b border-gray-700 mb-6">
            {['practice', 'tournament', 'other', 'ledger'].map(tab => (
                <button 
                    key={tab}
                    onClick={() => { setActiveTab(tab); setBillAmount(""); setManualSplit(""); }}
                    className={`px-6 py-3 font-bold uppercase text-sm ${activeTab === tab ? 'border-b-2 border-purple-500 text-purple-400' : 'text-gray-500'}`}
                >
                    {tab}
                </button>
            ))}
        </div>

        {/* --- 1. PRACTICE --- */}
        {activeTab === 'practice' && (
            <div className="grid gap-4 md:grid-cols-2">
                {pendingPractice.map(s => (
                    <BillingCard 
                        key={s.event_id} 
                        title={`Session: ${new Date(s.date).toLocaleDateString()}`} 
                        count={s.present_count}
                        onBill={() => handleBillPractice(s)}
                    />
                ))}
                {pendingPractice.length === 0 && <p className="text-gray-500">No unbilled practice sessions.</p>}
            </div>
        )}

        {/* --- 2. TOURNAMENT --- */}
        {activeTab === 'tournament' && (
            <div className="grid gap-4 md:grid-cols-2">
                {pendingTournaments.map(t => (
                    <BillingCard 
                        key={t.tournament_id}
                        title={`Tournament: ${t.name}`}
                        count={players.length} // All active players
                        onBill={() => { setDesc(`${t.name} Fee`); handleBillGeneral('tournament', t.tournament_id); }}
                    />
                ))}
            </div>
        )}

        {/* --- 3. OTHER / GENERAL --- */}
        {activeTab === 'other' && (
            <div className="bg-gray-800 p-6 rounded shadow-lg max-w-2xl">
                <h3 className="font-bold mb-4">Create General Expense</h3>
                <input type="text" placeholder="Description (e.g. Party)" className="w-full bg-gray-900 p-2 rounded mb-4" value={desc} onChange={e=>setDesc(e.target.value)} />
                
                <label className="block text-xs text-gray-400 mb-2">Select Payers (Leave empty for ALL)</label>
                <div className="grid grid-cols-3 gap-2 mb-4 max-h-40 overflow-y-auto bg-gray-900 p-2 rounded">
                    {players.map(p => (
                        <label key={p.user_id} className="flex items-center gap-2 text-xs">
                            <input type="checkbox" onChange={e => {
                                if(e.target.checked) setSelectedIds([...selectedIds, p.user_id]);
                                else setSelectedIds(selectedIds.filter(id => id !== p.user_id));
                            }} />
                            {p.full_name}
                        </label>
                    ))}
                </div>

                <BillingCard 
                    title="Split Cost" 
                    count={selectedIds.length > 0 ? selectedIds.length : players.length}
                    onBill={() => handleBillGeneral('general')}
                />
            </div>
        )}

        {/* --- 4. LEDGER (VIEW ONLY) --- */}
        {activeTab === 'ledger' && (
            <div className="grid gap-6 md:grid-cols-3">
                <div>
                    <h3 className="text-teal-400 font-bold mb-2 uppercase text-sm border-b border-gray-700 pb-1">Practice History</h3>
                    {ledger.practice.map(item => <LedgerRow key={item.related_event_id} item={item} />)}
                </div>
                <div>
                    <h3 className="text-yellow-400 font-bold mb-2 uppercase text-sm border-b border-gray-700 pb-1">Tournament Fees</h3>
                    {ledger.tournament.map(item => <LedgerRow key={item.related_tournament_id} item={item} />)}
                </div>
                <div>
                    <h3 className="text-blue-400 font-bold mb-2 uppercase text-sm border-b border-gray-700 pb-1">Other Expenses</h3>
                    {ledger.other.map((item, i) => <LedgerRow key={i} item={item} />)}
                </div>
            </div>
        )}

    </div>
  );
};

export default AdminFinance;