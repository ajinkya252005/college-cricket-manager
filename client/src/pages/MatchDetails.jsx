import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { API_BASE_URL } from "../config";

const MatchDetails = () => {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeInnings, setActiveInnings] = useState(1);

  // --- CRICKET MATH HELPERS ---
  const calculateSR = (runs, balls) => {
    if (!balls || balls == 0) return "0.00";
    return ((runs / balls) * 100).toFixed(2);
  };

  const calculateEcon = (runs, overs) => {
    if (!overs || overs == 0) return "0.00";
    // Convert 4.2 overs to 26 balls
    const totalBalls = Math.floor(overs) * 6 + Math.round((overs % 1) * 10);
    return ((runs / totalBalls) * 6).toFixed(2);
  };

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/api/matches/${id}`, {
          headers: { token }
        });
        const data = await res.json();
        setMatch(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchMatch();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Scorecard...</div>;
  if (!match) return <div className="p-8 text-center text-red-500">Match not found.</div>;

  // --- DATA PREPARATION ---
  // Parse the scorecard data we got from the backend
  const sc = match.scorecard_data;
  const ourTeam = sc.our_team || [];
  const oppBatting = sc.opponent_batting || [];
  const oppBowling = sc.opponent_bowling || [];

  // Parse Toss Logic
  let tossWinner = "us";
  let tossDecision = "bat";
  if (match.result && match.result.includes("Toss:")) {
    const tossPart = match.result.split(".")[0]; // "Toss: Opponent elected to bowl"
    if (tossPart.includes("Opponent")) tossWinner = "them";
    if (tossPart.includes("bowl")) tossDecision = "bowl";
  }

  // Determine Order
  const weBatFirst = (tossWinner === "us" && tossDecision === "bat") || (tossWinner === "them" && tossDecision === "bowl");

  // --- RENDERERS ---
  const BattingTable = ({ teamName, players }) => (
    <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
      <div className="bg-gray-800 text-white p-3 font-bold">🏏 Batting: {teamName}</div>
      <div className="grid grid-cols-12 gap-1 bg-gray-100 p-2 text-xs font-bold text-gray-600 uppercase border-b">
        <div className="col-span-3">Batter</div>
        <div className="col-span-1 text-center">R</div>
        <div className="col-span-1 text-center">B</div>
        <div className="col-span-1 text-center">4s</div>
        <div className="col-span-1 text-center">6s</div>
        <div className="col-span-1 text-center text-blue-600">SR</div>
        <div className="col-span-4 text-right pr-2">Dismissal</div>
      </div>
      <div className="p-2">
        {players.map((p, i) => (
          <div key={i} className="grid grid-cols-12 gap-1 items-center p-2 border-b last:border-0 hover:bg-gray-50 text-sm">
            <div className="col-span-3 font-semibold truncate">{p.full_name || p.player_name}</div>
            <div className="col-span-1 text-center font-bold text-gray-800">{p.runs}</div>
            <div className="col-span-1 text-center text-gray-500">{p.balls}</div>
            <div className="col-span-1 text-center text-gray-500">{p.fours}</div>
            <div className="col-span-1 text-center text-gray-500">{p.sixes}</div>
            <div className="col-span-1 text-center font-bold text-blue-600">{calculateSR(p.runs, p.balls)}</div>
            <div className="col-span-4 text-right text-xs text-gray-500 italic pr-2">
              {p.is_out ? (p.dismissal_text || p.dismissal_type || "Out") : <span className="text-green-600 not-italic font-bold">Not Out</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const BowlingTable = ({ teamName, players }) => (
    <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
      <div className="bg-gray-800 text-white p-3 font-bold">🎯 Bowling: {teamName}</div>
      <div className="grid grid-cols-12 gap-1 bg-gray-100 p-2 text-xs font-bold text-gray-600 uppercase border-b">
        <div className="col-span-4">Bowler</div>
        <div className="col-span-2 text-center">Overs</div>
        <div className="col-span-1 text-center">M</div>
        <div className="col-span-1 text-center">R</div>
        <div className="col-span-1 text-center">W</div>
        <div className="col-span-3 text-center text-purple-600">Econ</div>
      </div>
      <div className="p-2">
        {players.map((p, i) => (
          <div key={i} className="grid grid-cols-12 gap-1 items-center p-2 border-b last:border-0 hover:bg-gray-50 text-sm">
            <div className="col-span-4 font-semibold truncate">{p.full_name || p.player_name}</div>
            <div className="col-span-2 text-center">{p.overs || p.overs_bowled}</div>
            <div className="col-span-1 text-center">{p.maidens}</div>
            <div className="col-span-1 text-center">{p.runs_given || p.runs_conceded}</div>
            <div className="col-span-1 text-center font-bold text-blue-600">{p.wickets || p.wickets_taken}</div>
            <div className="col-span-3 text-center font-bold text-purple-600">{calculateEcon(p.runs_given || p.runs_conceded, p.overs || p.overs_bowled)}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/my-stats" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Back to History</Link>
        
        {/* MATCH HEADER */}
        {/* MATCH HEADER SCOREBOARD */}
        <div className="bg-gradient-to-r from-blue-900 to-gray-800 p-6 rounded-lg shadow-xl mb-6 text-white">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h1 className="text-3xl font-bold">vs {match.opponent_name}</h1>
                    <p className="text-blue-300 text-sm">{new Date(match.match_date).toDateString()} • {match.tournament_name}</p>
                </div>
                <div className="text-right">
                    <span className="bg-white text-blue-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        {match.result && match.result.split(".")[1] ? match.result.split(".")[1] : "Result"}
                    </span>
                </div>
            </div>

            {/* BIG SCORES */}
            <div className="flex justify-between items-center border-t border-blue-700 pt-4">
                
                {/* Team 1 */}
                <div className="text-center">
                    <p className="text-gray-400 text-xs uppercase mb-1">1st Innings</p>
                    <div className="text-4xl font-bold">
                        {match.team1_score}/{match.team1_wickets}
                    </div>
                    <p className="text-blue-300 text-sm">{match.team1_overs} Overs</p>
                </div>

                <div className="text-2xl text-gray-500 font-thin">vs</div>

                {/* Team 2 */}
                <div className="text-center">
                    <p className="text-gray-400 text-xs uppercase mb-1">2nd Innings</p>
                    <div className="text-4xl font-bold">
                        {match.team2_score}/{match.team2_wickets}
                    </div>
                    <p className="text-blue-300 text-sm">{match.team2_overs} Overs</p>
                </div>

            </div>
            
            <p className="text-center text-xs text-gray-400 mt-4 italic">
                {match.result && match.result.split(".")[0]} {/* Toss Info */}
            </p>
        </div>

        {/* TABS */}
        <div className="flex mb-0">
            <button onClick={() => setActiveInnings(1)} className={`px-6 py-2 font-bold rounded-t-lg ${activeInnings === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>1st Innings</button>
            <button onClick={() => setActiveInnings(2)} className={`px-6 py-2 font-bold rounded-t-lg ${activeInnings === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>2nd Innings</button>
        </div>

        {/* SCORECARD CONTENT */}
        <div className="bg-white p-4 rounded-b-lg shadow min-h-[400px]">
            {activeInnings === 1 ? (
                <>
                    {weBatFirst ? (
                        <>
                            <BattingTable teamName="Our Team" players={ourTeam.filter(p => p.played || p.balls > 0 || p.is_out)} />
                            <BowlingTable teamName={match.opponent_name} players={oppBowling} />
                        </>
                    ) : (
                        <>
                            <BattingTable teamName={match.opponent_name} players={oppBatting} />
                            <BowlingTable teamName="Our Team" players={ourTeam.filter(p => p.overs > 0)} />
                        </>
                    )}
                </>
            ) : (
                <>
                    {weBatFirst ? (
                        <>
                            <BattingTable teamName={match.opponent_name} players={oppBatting} />
                            <BowlingTable teamName="Our Team" players={ourTeam.filter(p => p.overs > 0)} />
                        </>
                    ) : (
                        <>
                            <BattingTable teamName="Our Team" players={ourTeam.filter(p => p.played || p.balls > 0 || p.is_out)} />
                            <BowlingTable teamName={match.opponent_name} players={oppBowling} />
                        </>
                    )}
                </>
            )}
        </div>

      </div>
    </div>
  );
};

export default MatchDetails;