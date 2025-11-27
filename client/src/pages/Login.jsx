import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Login = ({ setAuth, setUserRole }) => {
  const [inputs, setInputs] = useState({
    player_id: "",
    password: "",
  });
  
  // New State: "player" or "admin"
  const [loginType, setLoginType] = useState("player"); 

  const { player_id, password } = inputs;
  const navigate = useNavigate();

  const onChange = (e) =>
    setInputs({ ...inputs, [e.target.name]: e.target.value });

  const onSubmitForm = async (e) => {
    e.preventDefault();
    try {
      const body = { player_id, password };
      
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const parseRes = await response.json();

      if (response.ok) {
          localStorage.setItem("token", parseRes.token);

          // --- LOGIC START ---
          if (loginType === "admin") {
              if (parseRes.user.role !== "admin") {
                  toast.error("Access Denied: You are not an Admin!");
                  return; 
              }
              // Tell App.jsx "I am an Admin"
              setUserRole("admin"); 
              setAuth(true);
              toast.success("Welcome Admin!");
              // Navigation is handled by App.jsx redirect now
          } 
          else {
              // Player Login
              // Even if I am an admin, if I login here, I want to be treated as a "player" for navigation
              // So we TRICK App.jsx by temporarily setting role to "player" (or just generic)
              setUserRole("player"); 
              setAuth(true);
              toast.success("Login Successful!");
          }
          // --- LOGIC END ---

      } else {
          setAuth(false);
          toast.error(parseRes);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-800">
          🏏 Team Login
        </h1>

        {/* --- TABS --- */}
        <div className="flex mb-6 border-b">
            <button 
                className={`w-1/2 pb-2 text-center font-bold ${loginType === "player" ? "border-b-4 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                onClick={() => setLoginType("player")}
            >
                Player Login
            </button>
            <button 
                className={`w-1/2 pb-2 text-center font-bold ${loginType === "admin" ? "border-b-4 border-gray-800 text-gray-800" : "text-gray-500 hover:text-gray-700"}`}
                onClick={() => setLoginType("admin")}
            >
                Admin Login
            </button>
        </div>

        <form onSubmit={onSubmitForm}>
          <input
            type="text"
            name="player_id"
            placeholder={loginType === "admin" ? "Admin ID" : "Player ID (e.g., rn22)"}
            className="mb-4 w-full rounded border border-gray-300 p-3 focus:border-blue-500 focus:outline-none"
            value={player_id}
            onChange={(e) => onChange(e)}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="mb-6 w-full rounded border border-gray-300 p-3 focus:border-blue-500 focus:outline-none"
            value={password}
            onChange={(e) => onChange(e)}
            required
          />
          <button 
            className={`w-full rounded p-3 font-bold text-white transition duration-200 ${loginType === "admin" ? "bg-gray-800 hover:bg-gray-900" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {loginType === "admin" ? "Login to Admin Panel" : "Login to Dashboard"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          New Player?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Register Here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;