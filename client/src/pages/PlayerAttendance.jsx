import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const PlayerAttendance = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ total: 0, present: 0, percentage: 0 });

  useEffect(() => {
    const getData = async () => {
      try {
        // 1. Get User ID
        const verifyRes = await fetch("http://localhost:5000/api/auth/verify", {
            method: "GET",
            headers: { token: localStorage.getItem("token") }
        });
        const user = await verifyRes.json();

        // 2. Fetch My Attendance
        if (user.user_id) {
            const res = await fetch(`http://localhost:5000/api/attendance/my/${user.user_id}`);
            const data = await res.json();
            setLogs(data);

            // 3. Calculate Stats
            const total = data.length;
            const present = data.length; // Currently we only log "present" sessions
            // (If you add "absent" logic later, you would filter here)
            
            setStats({
                total,
                present,
                percentage: total === 0 ? 0 : Math.round((present / total) * 100)
            });
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
      
      <h1 className="text-3xl font-bold text-gray-800 mb-6">📅 My Attendance</h1>

      {/* Stats Card */}
      <div className="bg-white p-6 rounded shadow border-l-4 border-teal-500 mb-8 max-w-xl">
        <div className="flex justify-between items-center">
            <div>
                <h3 className="text-gray-500 font-bold">Attendance Rate</h3>
                <p className="text-4xl font-bold text-teal-600">{stats.percentage}%</p>
            </div>
            <div className="text-right">
                <p className="text-gray-600">Total Sessions: <span className="font-bold">{stats.total}</span></p>
                <p className="text-gray-600">Present: <span className="font-bold text-green-600">{stats.present}</span></p>
            </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="p-4">Date</th>
              <th className="p-4">Event</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.log_id} className="border-b hover:bg-gray-50">
                <td className="p-4">{new Date(log.date).toLocaleDateString()}</td>
                <td className="p-4 font-semibold">{log.event_type}</td>
                <td className="p-4">
                    <span className="px-2 py-1 rounded text-xs uppercase bg-green-100 text-green-800 font-bold">
                        {log.status}
                    </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && <p className="p-6 text-center text-gray-500">No attendance records found.</p>}
      </div>
    </div>
  );
};

export default PlayerAttendance;