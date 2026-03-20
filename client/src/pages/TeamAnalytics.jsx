import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";

const TeamAnalytics = ({ setAuth }) => {
  const [players, setPlayers] = useState([]);
  const navigate = useNavigate();

  const getAnalytics = async () => {
    try {
      const response = await fetch("${API_BASE_URL}/api/team/analytics", {
        method: "GET",
        headers: { token: localStorage.getItem("token") },
      });
      
      const parseRes = await response.json();
      
      if(Array.isArray(parseRes)){
          setPlayers(parseRes);
      } else {
          console.error("Data received is not an array:", parseRes);
          toast.error("Failed to load data");
      }

    } catch (err) {
      console.error(err.message);
      toast.error("Server Error");
    }
  };

  const logout = (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    setAuth(false);
    toast.success("Logged out successfully");
    navigate("/login");
  };

  useEffect(() => {
    getAnalytics();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-4 rounded shadow-md">
        <h1 className="text-2xl md:text-3xl font-bold text-blue-900 mb-4 md:mb-0">
          Team Analytics & Attendance
        </h1>
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition duration-300"
        >
          Logout
        </button>
      </div>

      {/* Analytics Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
        <table className="w-full text-left border-collapse">
          <thead className="bg-blue-900 text-white text-sm uppercase tracking-wider">
            <tr>
              <th className="p-4 border-b border-blue-800">Player Name</th>
              <th className="p-4 border-b border-blue-800 text-center" title="Matches Played">Mat</th>
              <th className="p-4 border-b border-blue-800 text-center" title="Total Runs">Runs</th>
              <th className="p-4 border-b border-blue-800 text-center" title="Total Wickets">Wkts</th>
              <th className="p-4 border-b border-blue-800 text-center" title="Balls Faced">Balls</th>
              <th className="p-4 border-b border-blue-800 text-center" title="Fours">4s</th>
              <th className="p-4 border-b border-blue-800 text-center" title="Sixes">6s</th>
              <th className="p-4 border-b border-blue-800 text-center" title="Overs Bowled">Overs</th>
              <th className="p-4 border-b border-blue-800 text-center" title="Runs Conceded">Runs Conc.</th>
              <th className="p-4 border-b border-blue-800 text-center" title="Maidens">Mdn</th>
              <th className="p-4 border-b border-blue-800 text-center">Practice Attendance %</th>
              <th className="p-4 border-b border-blue-800">Last 5 Sessions</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700 divide-y divide-gray-200">
            {players.length > 0 ? (
              players.map((player) => (
                <tr key={player.user_id} className="hover:bg-blue-50 transition duration-150">
                  <td className="p-4 font-bold text-gray-900">{player.full_name}</td>
                  <td className="p-4 text-center">{player.total_matches}</td>
                  <td className="p-4 text-center font-semibold text-blue-600">{player.total_runs}</td>
                  <td className="p-4 text-center font-semibold text-red-600">{player.total_wickets}</td>
                  <td className="p-4 text-center text-gray-500">{player.total_balls_faced}</td>
                  <td className="p-4 text-center text-gray-500">{player.total_fours}</td>
                  <td className="p-4 text-center text-gray-500">{player.total_sixes}</td>
                  <td className="p-4 text-center text-gray-500">{player.total_overs_bowled}</td>
                  <td className="p-4 text-center text-gray-500">{player.total_runs_conceded}</td>
                  <td className="p-4 text-center text-gray-500">{player.total_maidens}</td>
                  
                  {/* Attendance Percentage Badge */}
                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        parseFloat(player.attendance_percentage) >= 75
                          ? "bg-green-100 text-green-800 border border-green-200"
                          : parseFloat(player.attendance_percentage) >= 50
                          ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                          : "bg-red-100 text-red-800 border border-red-200"
                      }`}
                    >
                      {player.attendance_percentage}%
                    </span>
                  </td>

                  {/* Last 5 Sessions Visualizer */}
                  <td className="p-4">
                    <div className="flex gap-1 items-center">
                      {player.last_5_attendance && player.last_5_attendance.length > 0 ? (
                        player.last_5_attendance.map((status, index) => (
                          <div
                            key={index}
                            title={status}
                            className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold border shadow-sm ${
                              status === "Present"
                                ? "bg-green-500 text-white border-green-600"
                                : "bg-red-500 text-white border-red-600"
                            }`}
                          >
                            {status === "Present" ? "P" : "A"}
                          </div>
                        ))
                      ) : (
                        <span className="text-gray-400 text-xs italic">No Data</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="12" className="p-8 text-center text-gray-500 text-lg">
                  No active player data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeamAnalytics;