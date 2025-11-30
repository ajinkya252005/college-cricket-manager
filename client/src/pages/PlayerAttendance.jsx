import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const PlayerAttendance = () => {
  const [matchLogs, setMatchLogs] = useState([]);
  const [practiceLogs, setPracticeLogs] = useState([]);
  // Stats state now holds specific totals instead of just generic 'total'
  const [stats, setStats] = useState({ 
      matchRate: 0, 
      matchTotal: 0, 
      practiceRate: 0, 
      practiceTotal: 0 
  });

  useEffect(() => {
    const getData = async () => {
      try {
        const verifyRes = await fetch("http://localhost:5000/api/auth/verify", {
            method: "GET",
            headers: { token: localStorage.getItem("token") }
        });
        const user = await verifyRes.json();

        if (user.user_id) {
            const res = await fetch(`http://localhost:5000/api/attendance/my/${user.user_id}`);
            const data = await res.json(); 

            // 1. Split Data
            const matches = data.filter(l => l.event_type === 'Match Day');
            const practices = data.filter(l => l.event_type !== 'Match Day');

            setMatchLogs(matches);
            setPracticeLogs(practices);

            // 2. Calculate Stats
            const matchPresent = matches.filter(l => l.status === 'present').length;
            const practicePresent = practices.filter(l => l.status === 'present').length;

            setStats({
                matchTotal: matches.length,
                practiceTotal: practices.length,
                
                matchRate: matches.length === 0 ? 0 : Math.round((matchPresent / matches.length) * 100),
                practiceRate: practices.length === 0 ? 0 : Math.round((practicePresent / practices.length) * 100)
            });
        }

      } catch (err) {
        console.error(err.message);
      }
    };

    getData();
  }, []);

  // Helper to render status badge
  const StatusBadge = ({ status }) => (
    <span className={`px-2 py-1 rounded text-xs uppercase font-bold border ${
        status === 'present' 
        ? 'bg-green-100 text-green-800 border-green-200' 
        : 'bg-red-100 text-red-800 border-red-200'
    }`}>
        {status}
    </span>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Link to="/dashboard" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Back to Dashboard</Link>
      
      <h1 className="text-3xl font-bold text-gray-800 mb-6">📅 Attendance Record</h1>

      {/* STATS OVERVIEW CARD - 2 COLUMNS NOW */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 grid grid-cols-1 md:grid-cols-2 gap-6 border-t-4 border-teal-500">
        
        {/* 1. MATCH STATS */}
        <div className="text-center border-r border-gray-200">
            <h3 className="text-gray-500 font-bold text-sm uppercase mb-2">Match Availability</h3>
            <p className={`text-5xl font-bold mb-2 ${stats.matchRate > 80 ? 'text-green-600' : 'text-yellow-600'}`}>
                {stats.matchRate}%
            </p>
            <p className="text-sm font-bold text-gray-600">Total Matches: {stats.matchTotal}</p>
        </div>

        {/* 2. PRACTICE STATS */}
        <div className="text-center">
            <h3 className="text-gray-500 font-bold text-sm uppercase mb-2">Practice Regularity</h3>
            <p className={`text-5xl font-bold mb-2 ${stats.practiceRate > 75 ? 'text-blue-600' : 'text-orange-600'}`}>
                {stats.practiceRate}%
            </p>
            <p className="text-sm font-bold text-gray-600">Total Sessions: {stats.practiceTotal}</p>
        </div>

      </div>

      <div className="grid md:grid-cols-2 gap-8">
          
          {/* LEFT: MATCH ATTENDANCE */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-gray-800 text-white p-3 font-bold flex justify-between items-center">
                <span>🏆 Match Days</span>
                <span className="text-xs bg-gray-600 px-2 py-1 rounded">{matchLogs.length} Records</span>
            </div>
            <table className="w-full text-left">
              <tbody className="divide-y divide-gray-100">
                {matchLogs.map((log, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="p-4">
                        <div className="font-bold text-gray-700">{new Date(log.final_date).toLocaleDateString()}</div>
                        <div className="text-xs text-blue-600 mt-1">
                            {log.opponent_name ? `vs ${log.opponent_name}` : "Match Day"}
                        </div>
                    </td>
                    <td className="p-4 text-right">
                        <StatusBadge status={log.status} />
                    </td>
                  </tr>
                ))}
                {matchLogs.length === 0 && <tr><td colSpan="2" className="p-4 text-center text-gray-500">No match records.</td></tr>}
              </tbody>
            </table>
          </div>

          {/* RIGHT: PRACTICE ATTENDANCE */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-gray-800 text-white p-3 font-bold flex justify-between items-center">
                <span>🏋️ Practice & Training</span>
                <span className="text-xs bg-gray-600 px-2 py-1 rounded">{practiceLogs.length} Records</span>
            </div>
            <table className="w-full text-left">
              <tbody className="divide-y divide-gray-100">
                {practiceLogs.map((log, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="p-4">
                        <div className="font-bold text-gray-700">{new Date(log.final_date).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500 mt-1">
                            {log.event_type} {log.start_time && `(${log.start_time.slice(0,5)})`}
                        </div>
                        {log.description && <div className="text-xs text-gray-400 italic">{log.description}</div>}
                    </td>
                    <td className="p-4 text-right">
                        <StatusBadge status={log.status} />
                    </td>
                  </tr>
                ))}
                {practiceLogs.length === 0 && <tr><td colSpan="2" className="p-4 text-center text-gray-500">No practice records.</td></tr>}
              </tbody>
            </table>
          </div>

      </div>
    </div>
  );
};

export default PlayerAttendance;