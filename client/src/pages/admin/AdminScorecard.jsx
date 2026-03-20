import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../config";

// --- HELPER COMPONENTS (Moved Outside) ---

const BattingRow = ({ isUs, p, index, ourStats, updateOurStat, updateOppStat }) => {
  const s = isUs ? (ourStats[p.user_id] || {}) : p;
  const handleChange = (field, val) => isUs ? updateOurStat(p.user_id, field, val) : updateOppStat('bat', index, field, val);

  return (
    <div className={`grid grid-cols-12 gap-1 items-center p-1 rounded mb-1 transition-all ${
      isUs && !s.played ? 'bg-gray-100 opacity-60' : 
      isUs ? 'bg-blue-50 border-b border-blue-200' : 'bg-red-50 border-b border-red-200'
    }`}>
      <div className="col-span-3 flex items-center gap-2 pl-2 overflow-hidden">
        {isUs && <div className="cursor-move text-gray-400 hover:text-gray-600 px-1 font-bold text-lg select-none" title="Drag to reorder">☰</div>}
        {isUs && <input type="checkbox" className="w-4 h-4 cursor-pointer accent-blue-600" checked={s.played || false} onChange={() => updateOurStat(p.user_id, 'played', !s.played)} />}
        {isUs ? <span className={`text-sm truncate ${s.played ? 'font-bold text-gray-800' : 'text-gray-500 italic'}`}>{p.full_name}</span> : <input type="text" placeholder={`Batter ${index+1}`} className="w-full p-1 text-sm border rounded" value={s.player_name} onChange={e=>handleChange('player_name', e.target.value)} />}
      </div>
      {(isUs ? s.played : true) ? (
        <>
          <input type="number" className="col-span-1 p-1 border rounded text-center font-semibold" value={s.runs} onChange={e=>handleChange('runs', e.target.value)} />
          <input type="number" className="col-span-1 p-1 border rounded text-center" value={s.balls} onChange={e=>handleChange('balls', e.target.value)} />
          <input type="number" className="col-span-1 p-1 border rounded text-center" value={s.fours} onChange={e=>handleChange('fours', e.target.value)} />
          <input type="number" className="col-span-1 p-1 border rounded text-center" value={s.sixes} onChange={e=>handleChange('sixes', e.target.value)} />
          <div className="col-span-5 flex flex-col gap-1">
            <div className="flex gap-1">
              <select className={`text-xs p-1 rounded border w-24 ${s.is_out ? 'bg-red-100 text-red-700 font-bold' : 'bg-green-100 text-green-700'}`} value={s.is_out ? "out" : "not"} onChange={e=>{const val = e.target.value === 'out'; handleChange('is_out', val); if(!val) { handleChange('dismissal_type', ""); handleChange('dismissal_bowler', ""); handleChange('dismissal_fielder', ""); }}}>
                <option value="not">Not Out</option><option value="out">OUT</option>
              </select>
              {s.is_out && <select className="flex-1 text-xs p-1 border rounded" value={s.dismissal_type} onChange={e=>handleChange('dismissal_type', e.target.value)}><option value="">Select Type...</option><option value="bowled">Bowled</option><option value="caught">Caught</option><option value="lbw">LBW</option><option value="run_out">Run Out</option><option value="stumped">Stumped</option><option value="caught_and_bowled">C & B</option></select>}
            </div>
            {s.is_out && (<div className="flex gap-1 animate-fadeIn">{(['bowled','lbw','caught','stumped','caught_and_bowled'].includes(s.dismissal_type)) && (<input type="text" placeholder="Bowler Name" className="w-1/2 text-xs p-1 border rounded" value={s.dismissal_bowler} onChange={e=>handleChange('dismissal_bowler', e.target.value)} />)}{(['caught','run_out','stumped'].includes(s.dismissal_type)) && (<input type="text" placeholder="Fielder Name" className="w-1/2 text-xs p-1 border rounded" value={s.dismissal_fielder} onChange={e=>handleChange('dismissal_fielder', e.target.value)} />)}</div>)}
          </div>
        </>
      ) : <div className="col-span-9 text-center text-xs text-gray-400 italic py-2">- Not in Playing XI -</div>}
    </div>
  );
};

const BattingTable = ({ isUs, matchDetails, squad, oppBatting, ourStats, updateOurStat, updateOppStat, dragItem, dragOverItem, handleSort }) => (
  <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
    <div className="bg-gray-800 text-white p-3 flex justify-between items-center"><h3 className="font-bold">🏏 Batting: {isUs ? "Our Team" : matchDetails.opponent_name}</h3></div>
    <div className="grid grid-cols-12 gap-1 bg-gray-200 p-2 text-xs font-bold text-gray-700 uppercase border-b border-gray-300"><div className="col-span-3 pl-2">Player</div><div className="col-span-1 text-center">Runs</div><div className="col-span-1 text-center">Balls</div><div className="col-span-1 text-center">4s</div><div className="col-span-1 text-center">6s</div><div className="col-span-5 text-center">Dismissal</div></div>
    <div className="p-2">
      {isUs ? squad.map((p, index) => (
        <div key={p.user_id} draggable onDragStart={() => (dragItem.current = index)} onDragEnter={() => (dragOverItem.current = index)} onDragEnd={handleSort} onDragOver={(e) => e.preventDefault()} className="transition-transform duration-200">
          <BattingRow isUs={true} p={p} index={index} ourStats={ourStats} updateOurStat={updateOurStat} updateOppStat={updateOppStat} />
        </div>
      )) : oppBatting.map((row, i) => (
        <BattingRow key={i} isUs={false} p={row} index={i} ourStats={ourStats} updateOurStat={updateOurStat} updateOppStat={updateOppStat} />
      ))}
    </div>
  </div>
);

const BowlingTable = ({ isUs, matchDetails, squad, oppBowling, ourStats, updateOurStat, updateOppStat }) => (
  <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
    <div className="bg-gray-800 text-white p-3"><h3 className="font-bold">🎯 Bowling: {isUs ? "Our Team" : matchDetails.opponent_name}</h3></div>
    <div className="grid grid-cols-12 gap-1 bg-gray-100 p-2 text-xs font-bold text-gray-600 uppercase border-b border-gray-300"><div className="col-span-4">Bowler</div><div className="col-span-2 text-center">Overs</div><div className="col-span-2 text-center">Maidens</div><div className="col-span-2 text-center">Runs</div><div className="col-span-2 text-center">Wickets</div></div>
    <div className="p-2">
      {isUs ? squad.map(p => { 
        const s = ourStats[p.user_id] || {}; 
        if(!s.played) return null; 
        return (
          <div key={p.user_id} className="grid grid-cols-12 gap-1 items-center p-1 rounded hover:bg-gray-50 mb-1 border-b">
            <div className="col-span-4 text-sm font-semibold">{p.full_name}</div>
            <input type="number" className="col-span-2 p-1 border rounded text-center" value={s.overs} onChange={e=>updateOurStat(p.user_id, 'overs', e.target.value)} />
            <input type="number" className="col-span-2 p-1 border rounded text-center" value={s.maidens} onChange={e=>updateOurStat(p.user_id, 'maidens', e.target.value)} />
            <input type="number" className="col-span-2 p-1 border rounded text-center" value={s.runs_given} onChange={e=>updateOurStat(p.user_id, 'runs_given', e.target.value)} />
            <input type="number" className="col-span-2 p-1 border rounded text-center font-bold text-blue-600" value={s.wickets} onChange={e=>updateOurStat(p.user_id, 'wickets', e.target.value)} />
          </div>
        )
      }) : oppBowling.map((row, i) => (
        <div key={i} className="grid grid-cols-12 gap-1 items-center p-1 rounded hover:bg-gray-50 mb-1 border-b">
          <div className="col-span-4"><input type="text" placeholder={`Bowler ${i+1}`} className="w-full p-1 text-sm border rounded" value={row.player_name} onChange={e=>updateOppStat('bowl', i, 'player_name', e.target.value)} /></div>
          <input type="number" className="col-span-2 p-1 border rounded text-center" value={row.overs} onChange={e=>updateOppStat('bowl', i, 'overs', e.target.value)} />
          <input type="number" className="col-span-2 p-1 border rounded text-center" value={row.maidens} onChange={e=>updateOppStat('bowl', i, 'maidens', e.target.value)} />
          <input type="number" className="col-span-2 p-1 border rounded text-center" value={row.runs_given} onChange={e=>updateOppStat('bowl', i, 'runs_given', e.target.value)} />
          <input type="number" className="col-span-2 p-1 border rounded text-center font-bold text-blue-600" value={row.wickets} onChange={e=>updateOppStat('bowl', i, 'wickets', e.target.value)} />
        </div>
      ))}
    </div>
  </div>
);

// --- MAIN COMPONENT ---

const AdminScorecard = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Match Data
  const [matchDetails, setMatchDetails] = useState({});
  const [squad, setSquad] = useState([]); 
  
  // UI State
  const [activeInnings, setActiveInnings] = useState(1); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- RESULT BUILDER STATE ---
  const [toss, setToss] = useState({ winner: "us", decision: "bat" });
  const [outcome, setOutcome] = useState({ winner: "us", type: "runs", margin: "" }); 
  
  // DATA STATE
  const [ourStats, setOurStats] = useState({});
  const [oppBatting, setOppBatting] = useState([]);
  const [oppBowling, setOppBowling] = useState([]);
  const [summary, setSummary] = useState({
    team1_runs: "", team1_wickets: "", team1_overs: "",
    team2_runs: "", team2_wickets: "", team2_overs: ""
  });

  // Drag & Drop Refs
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  // --- INITIALIZATION ---
  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        const matchRes = await fetch(`${API_BASE_URL}/api/matches/${id}`, { headers: { token } });
        const matchData = await matchRes.json();
        setMatchDetails(matchData);

        // Pre-fill Totals
        if(matchData.team1_score !== undefined) {
            setSummary({
                team1_runs: matchData.team1_score || "", team1_wickets: matchData.team1_wickets || "", team1_overs: matchData.team1_overs || "",
                team2_runs: matchData.team2_score || "", team2_wickets: matchData.team2_wickets || "", team2_overs: matchData.team2_overs || ""
            });
        }

        if (matchData.tournament_id) {
            const squadRes = await fetch(`${API_BASE_URL}/api/tournaments/${matchData.tournament_id}/squad`);
            const squadData = await squadRes.json();
            setSquad(squadData);
            
            const initialOurStats = {};
            squadData.forEach(p => {
                initialOurStats[p.user_id] = { played: false, runs: 0, balls: 0, fours: 0, sixes: 0, is_out: false, dismissal_type: "", dismissal_text: "", overs: 0, runs_given: 0, wickets: 0, maidens: 0 };
            });

            const initialOppBat = Array(11).fill(null).map(() => ({ player_name: "", runs: 0, balls: 0, fours: 0, sixes: 0, is_out: false, dismissal_text: "" }));
            const initialOppBowl = Array(8).fill(null).map(() => ({ player_name: "", overs: 0, runs_given: 0, wickets: 0, maidens: 0 }));

            if (matchData.scorecard_data) {
                const sc = matchData.scorecard_data;
                if(sc.our_team && sc.our_team.length > 0) {
                    sc.our_team.forEach(p => {
                        if(initialOurStats[p.user_id]) initialOurStats[p.user_id] = { ...initialOurStats[p.user_id], ...p, played: true };
                    });
                    // Restore Squad Order
                    const savedOrder = sc.our_team.map(p => p.user_id);
                    squadData.sort((a, b) => {
                        const idxA = savedOrder.indexOf(a.user_id);
                        const idxB = savedOrder.indexOf(b.user_id);
                        if (idxA === -1 && idxB === -1) return 0;
                        if (idxA === -1) return 1;
                        if (idxB === -1) return -1;
                        return idxA - idxB;
                    });
                    setSquad(squadData);
                }
                if(sc.opponent_batting) sc.opponent_batting.forEach((p, i) => { if(initialOppBat[i]) initialOppBat[i] = { ...initialOppBat[i], ...p }; });
                if(sc.opponent_bowling) sc.opponent_bowling.forEach((p, i) => { if(initialOppBowl[i]) initialOppBowl[i] = { ...initialOppBowl[i], ...p }; });
            }

            setOurStats(initialOurStats);
            setOppBatting(initialOppBat);
            setOppBowling(initialOppBowl);
        }
      } catch (err) { console.error(err); }
    };
    fetchInfo();
  }, [id]);

  // Helper
  const weBatFirst = (toss.winner === "us" && toss.decision === "bat") || (toss.winner === "them" && toss.decision === "bowl");

  // --- HANDLERS ---
  const updateOurStat = (userId, field, value) => {
    setOurStats(prev => ({
        ...prev,
        [userId]: { ...prev[userId], [field]: ['played','is_out','dismissal_type','dismissal_bowler','dismissal_fielder'].includes(field) ? value : (parseFloat(value) || 0) }
    }));
  };

  const updateOppStat = (type, index, field, value) => {
    const arr = type === 'bat' ? [...oppBatting] : [...oppBowling];
    arr[index][field] = ['player_name','is_out','dismissal_type','dismissal_bowler','dismissal_fielder'].includes(field) ? value : (parseFloat(value) || 0);
    type === 'bat' ? setOppBatting(arr) : setOppBowling(arr);
  };

  const handleSort = () => {
    let _squad = [...squad];
    const draggedItemContent = _squad.splice(dragItem.current, 1)[0];
    _squad.splice(dragOverItem.current, 0, draggedItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    setSquad(_squad);
  };

  // --- SUBMIT ---
  const onSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 1. Construct Result String
    let resultText = "";
    if (outcome.winner === "draw") resultText = "Match Drawn";
    else if (outcome.winner === "tie") resultText = "Match Tied";
    else if (outcome.winner === "abandoned") resultText = "Match Abandoned";
    else {
        const winnerName = outcome.winner === "us" ? "Our Team" : matchDetails.opponent_name;
        resultText = `${winnerName} won by ${outcome.margin} ${outcome.type}`;
    }

    // 2. Prepare Payloads
    const ourDataPayload = squad
        .filter(p => ourStats[p.user_id]?.played)
        .map(p => ({ user_id: p.user_id, full_name: p.full_name, ...ourStats[p.user_id] }));
    
    const oppBatPayload = oppBatting.filter(p => p.player_name !== "").map(p => {
        let text = "";
        if (p.is_out) {
            if (p.dismissal_type === "bowled") text = `b ${p.dismissal_bowler}`;
            else if (p.dismissal_type === "lbw") text = `lbw b ${p.dismissal_bowler}`;
            else if (p.dismissal_type === "caught") text = `c ${p.dismissal_fielder} b ${p.dismissal_bowler}`;
            else if (p.dismissal_type === "run_out") text = `run out (${p.dismissal_fielder})`;
            else if (p.dismissal_type === "stumped") text = `st ${p.dismissal_fielder} b ${p.dismissal_bowler}`;
            else if (p.dismissal_type === "caught_and_bowled") text = `c&b ${p.dismissal_bowler}`;
            else text = p.dismissal_type;
        }
        return { ...p, dismissal_text: text };
    });

    const oppBowlPayload = oppBowling.filter(p => p.player_name !== "");

    try {
        const fullResultString = `Toss: ${toss.winner === 'us' ? 'We' : 'Opponent'} elected to ${toss.decision}. Result: ${resultText}`;
        
        const response = await fetch(`${API_BASE_URL}/api/matches/${id}/scorecard`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "token": localStorage.getItem("token") },
            body: JSON.stringify({ 
                result: fullResultString, 
                outcome: outcome,
                match_summary: summary,
                our_team_stats: ourDataPayload, 
                opponent_stats: [...oppBatPayload, ...oppBowlPayload], 
                full_scorecard: { our_team: ourDataPayload, opponent_batting: oppBatPayload, opponent_bowling: oppBowlPayload }
            })
        });

        if (response.ok) {
            toast.success("Scorecard Saved!");
            navigate("/admin/matches");
        } else {
            toast.error("Error saving scorecard");
        }
    } catch (err) { console.error(err); }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8 text-gray-800">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
            <Link to="/admin/matches" className="text-gray-400 hover:text-white">&larr; Exit</Link>
            <h1 className="text-3xl font-bold text-white">📝 Live Scorecard Entry</h1>
            <button onClick={onSubmit} disabled={isSubmitting} className="bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-500 shadow-lg">
                {isSubmitting ? "Saving..." : "💾 Save Match"}
            </button>
        </div>

        {/* --- TOSS & RESULT SECTION --- */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg mb-6 border border-gray-700 text-white">
            <h3 className="text-sm font-bold text-yellow-400 mb-3 uppercase">Match Conditions</h3>
            <div className="flex flex-col md:flex-row gap-6 items-center">
                
                {/* TOSS */}
                <div className="flex gap-4 bg-gray-700/50 p-3 rounded border border-gray-600">
                    <div>
                        <label className="text-xs text-gray-400 block mb-1">Toss Winner</label>
                        <select className="bg-gray-800 p-2 rounded border border-gray-500 text-sm" value={toss.winner} onChange={e=>setToss({...toss, winner: e.target.value})}><option value="us">We Won</option><option value="them">Opponent Won</option></select>
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 block mb-1">Decision</label>
                        <select className="bg-gray-800 p-2 rounded border border-gray-500 text-sm" value={toss.decision} onChange={e=>setToss({...toss, decision: e.target.value})}><option value="bat">Bat First</option><option value="bowl">Bowl First</option></select>
                    </div>
                </div>

                {/* RESULT BUILDER */}
                <div className="flex-1 w-full bg-gray-700/50 p-3 rounded border border-gray-600 flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="text-xs text-gray-400 block mb-1">Match Outcome</label>
                        <div className="flex gap-2">
                            <select className="bg-gray-800 p-2 rounded border border-gray-500 text-sm w-1/3" value={outcome.winner} onChange={e=>setOutcome({...outcome, winner: e.target.value})}>
                                <option value="us">We Won</option>
                                <option value="them">Opponent Won</option>
                                <option value="draw">Draw</option>
                                <option value="tie">Tie</option>
                                <option value="abandoned">Abandoned</option>
                            </select>
                            
                            {(outcome.winner === 'us' || outcome.winner === 'them') && (
                                <>
                                    <input type="number" placeholder="Margin" className="bg-gray-800 p-2 rounded border border-gray-500 text-sm w-20" value={outcome.margin} onChange={e=>setOutcome({...outcome, margin: e.target.value})} />
                                    <select className="bg-gray-800 p-2 rounded border border-gray-500 text-sm w-1/3" value={outcome.type} onChange={e=>setOutcome({...outcome, type: e.target.value})}>
                                        <option value="runs">Runs</option>
                                        <option value="wickets">Wickets</option>
                                        <option value="innings">Innings</option>
                                    </select>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* SCORE SUMMARY INPUTS */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg mb-6 border border-gray-700 text-white">
            <h3 className="text-sm font-bold text-gray-400 mb-2 uppercase">Innings Totals (Final Score)</h3>
            <div className="grid grid-cols-2 gap-8">
                {/* Innings 1 */}
                <div className="bg-gray-700 p-3 rounded">
                    <p className="text-xs text-blue-300 font-bold mb-2">1st Innings ({weBatFirst ? "Us" : "Opponent"})</p>
                    <div className="flex gap-2">
                        <input type="number" placeholder="Runs" className="w-1/3 p-1 rounded text-black" value={summary.team1_runs} onChange={e=>setSummary({...summary, team1_runs: e.target.value})} />
                        <input type="number" placeholder="Wkts" className="w-1/3 p-1 rounded text-black" value={summary.team1_wickets} onChange={e=>setSummary({...summary, team1_wickets: e.target.value})} />
                        <input type="number" placeholder="Overs" className="w-1/3 p-1 rounded text-black" value={summary.team1_overs} onChange={e=>setSummary({...summary, team1_overs: e.target.value})} />
                    </div>
                </div>
                {/* Innings 2 */}
                <div className="bg-gray-700 p-3 rounded">
                    <p className="text-xs text-green-300 font-bold mb-2">2nd Innings ({!weBatFirst ? "Us" : "Opponent"})</p>
                    <div className="flex gap-2">
                        <input type="number" placeholder="Runs" className="w-1/3 p-1 rounded text-black" value={summary.team2_runs} onChange={e=>setSummary({...summary, team2_runs: e.target.value})} />
                        <input type="number" placeholder="Wkts" className="w-1/3 p-1 rounded text-black" value={summary.team2_wickets} onChange={e=>setSummary({...summary, team2_wickets: e.target.value})} />
                        <input type="number" placeholder="Overs" className="w-1/3 p-1 rounded text-black" value={summary.team2_overs} onChange={e=>setSummary({...summary, team2_overs: e.target.value})} />
                    </div>
                </div>
            </div>
        </div>

        {/* TABS */}
        <div className="flex mb-0">
            <button onClick={() => setActiveInnings(1)} className={`px-8 py-3 font-bold rounded-t-lg text-lg ${activeInnings === 1 ? 'bg-white text-blue-600' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>1st Innings</button>
            <button onClick={() => setActiveInnings(2)} className={`px-8 py-3 font-bold rounded-t-lg text-lg ${activeInnings === 2 ? 'bg-white text-blue-600' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>2nd Innings</button>
        </div>

        {/* CONTENT */}
        <div className="bg-gray-200 p-6 rounded-b-lg shadow-xl min-h-[600px]">
            {activeInnings === 1 ? (
                <>
                    <h2 className="text-xl font-bold mb-4 border-b pb-2 border-gray-400">{weBatFirst ? "1st Innings: Our Batting" : `1st Innings: ${matchDetails.opponent_name} Batting`}</h2>
                    <BattingTable 
                        isUs={weBatFirst} 
                        matchDetails={matchDetails} 
                        squad={squad} 
                        oppBatting={oppBatting} 
                        ourStats={ourStats} 
                        updateOurStat={updateOurStat} 
                        updateOppStat={updateOppStat} 
                        dragItem={dragItem} 
                        dragOverItem={dragOverItem} 
                        handleSort={handleSort}
                    />
                    <BowlingTable 
                        isUs={!weBatFirst} 
                        matchDetails={matchDetails} 
                        squad={squad} 
                        oppBowling={oppBowling} 
                        ourStats={ourStats} 
                        updateOurStat={updateOurStat} 
                        updateOppStat={updateOppStat} 
                    />
                </>
            ) : (
                <>
                    <h2 className="text-xl font-bold mb-4 border-b pb-2 border-gray-400">{weBatFirst ? `2nd Innings: ${matchDetails.opponent_name} Batting` : "2nd Innings: Our Batting"}</h2>
                    <BattingTable 
                        isUs={!weBatFirst} 
                        matchDetails={matchDetails} 
                        squad={squad} 
                        oppBatting={oppBatting} 
                        ourStats={ourStats} 
                        updateOurStat={updateOurStat} 
                        updateOppStat={updateOppStat} 
                        dragItem={dragItem} 
                        dragOverItem={dragOverItem} 
                        handleSort={handleSort}
                    />
                    <BowlingTable 
                        isUs={weBatFirst} 
                        matchDetails={matchDetails} 
                        squad={squad} 
                        oppBowling={oppBowling} 
                        ourStats={ourStats} 
                        updateOurStat={updateOurStat} 
                        updateOppStat={updateOppStat} 
                    />
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default AdminScorecard;