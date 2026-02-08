import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Login = ({ setAuth, setUserRole }) => {
  const [inputs, setInputs] = useState({
    player_id: "",
    password: "",
  });
  
  const [loginType, setLoginType] = useState("player"); 
  const [loading, setLoading] = useState(false);

  const { player_id, password } = inputs;
  const navigate = useNavigate();

  const onChange = (e) =>
    setInputs({ ...inputs, [e.target.name]: e.target.value });

  const onSubmitForm = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let url = "";
      let body = {};

      // 1. Configure Endpoint & Body
      if (loginType === "team") {
        url = "https://cricket-api-ll8u.onrender.com/api/auth/team-login"; 
        // Now sending user_id (from player_id state) and password
        body = { user_id: player_id, password }; 
      } else {
        url = "https://cricket-api-ll8u.onrender.com/api/auth/login"; 
        body = { player_id, password };
      }

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const parseRes = await response.json();

      if (response.ok) {
        localStorage.setItem("token", parseRes.token);
        setAuth(true);

        // 2. Handle Redirects & Roles
        if (loginType === "team") {
           setUserRole("team"); 
           toast.success("Team Access Granted!");
           navigate("/team/analytics");
        } 
        else if (loginType === "admin") {
           if (parseRes.user && parseRes.user.role !== "admin") {
             toast.error("Access Denied: You are not an Admin!");
             setLoading(false); 
             return; 
           }
           setUserRole("admin");
           toast.success("Welcome Admin!");
           // navigate("/admin/dashboard");
        } 
        else {
           setUserRole("player");
           toast.success("Login Successful!");
           navigate("/dashboard");
        }

      } else {
        setAuth(false);
        toast.error(parseRes);
      }
    } catch (err) {
      console.error(err.message);
      toast.error("Server Error");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center relative overflow-hidden p-4">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md bg-gray-800/50 backdrop-blur-lg border border-gray-700 p-8 rounded-3xl shadow-2xl relative z-10">
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">
            {loginType === "team" ? "Team Access" : "Welcome Back"}
          </h1>
          <p className="text-gray-400 text-sm">
            {loginType === "team" ? "View global stats & analytics" : "Access your cricket dashboard"}
          </p>
        </div>

        {/* TABS */}
        <div className="flex bg-gray-900/50 p-1 rounded-xl mb-8 border border-gray-700">
          <button 
            type="button"
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${loginType === "player" ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
            onClick={() => setLoginType("player")}
          >
            Player
          </button>
          <button 
            type="button"
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${loginType === "admin" ? "bg-purple-600 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
            onClick={() => setLoginType("admin")}
          >
            Admin
          </button>
          <button 
            type="button"
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${loginType === "team" ? "bg-green-600 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
            onClick={() => setLoginType("team")}
          >
            Team
          </button>
        </div>

        <form onSubmit={onSubmitForm} className="space-y-5">
          
          {/* User ID Input - Visible for ALL types now */}
          <div className="animate-fade-in-down">
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">
              {loginType === "admin" ? "Admin ID" : "User ID"}
            </label>
            <input
              type="text"
              name="player_id"
              className="w-full bg-gray-900/80 border border-gray-700 text-white rounded-xl p-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition outline-none placeholder-gray-600"
              placeholder="e.g. 12345678"
              value={player_id}
              onChange={onChange}
              required
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              className="w-full bg-gray-900/80 border border-gray-700 text-white rounded-xl p-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition outline-none placeholder-gray-600"
              placeholder="••••••••"
              value={password}
              onChange={onChange}
              required
            />
          </div>

          <button 
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all transform hover:scale-[1.02] ${
              loginType === 'admin' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-purple-500/30' : 
              loginType === 'team' ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-green-500/30' :
              'bg-gradient-to-r from-blue-600 to-cyan-600 hover:shadow-blue-500/30'
            }`}
          >
            {loading ? "Authenticating..." : loginType === "team" ? "View Analytics" : "Access Dashboard"}
          </button>
        </form>

        {loginType !== "team" && (
          <p className="mt-6 text-center text-sm text-gray-500">
            New to the team?{" "}
            <Link to="/register" className="text-blue-400 font-bold hover:underline">
              Apply for Registration
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;