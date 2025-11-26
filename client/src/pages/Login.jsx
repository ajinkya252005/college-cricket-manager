import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Login = ({ setAuth }) => {
  const [inputs, setInputs] = useState({
    player_id: "",
    password: "",
  });

  const { player_id, password } = inputs;
  const navigate = useNavigate();

  const onChange = (e) =>
    setInputs({ ...inputs, [e.target.name]: e.target.value });

  const onSubmitForm = async (e) => {
    e.preventDefault();
    try {
      const body = { player_id, password };
      
      // Call the Backend API
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const parseRes = await response.json();

      if (response.ok) {
        // Success: Save token and redirect
        localStorage.setItem("token", parseRes.token);
        setAuth(true);
        toast.success("Login Successfully!");
        navigate("/dashboard");
      } else {
        // Error: Show message
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
        <h1 className="mb-6 text-center text-3xl font-bold text-blue-600">
          🏏 Team Login
        </h1>
        <form onSubmit={onSubmitForm}>
          <input
            type="text"
            name="player_id"
            placeholder="Player ID (e.g., rn22)"
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
          <button className="w-full rounded bg-blue-600 p-3 font-bold text-white hover:bg-blue-700 transition duration-200">
            Login
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