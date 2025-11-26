import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const Register = ({ setAuth }) => {
  const [inputs, setInputs] = useState({
    player_id: "",
    password: "",
    full_name: "",
    branch: "",
    year_of_study: "",
    joining_year: ""
  });

  const { player_id, password, full_name, branch, year_of_study, joining_year } = inputs;

  const onChange = (e) =>
    setInputs({ ...inputs, [e.target.name]: e.target.value });

  const onSubmitForm = async (e) => {
    e.preventDefault();
    try {
      const body = { 
        player_id, 
        password, 
        full_name, 
        branch, 
        year_of_study: parseInt(year_of_study), 
        joining_year: parseInt(joining_year) 
      };

      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const parseRes = await response.json();

      if (response.ok) {
        // Registration Successful
        toast.success("Registered Successfully! Please Login.");
        // We don't log them in automatically because status is 'pending'
        // But for now, we redirect them to login page
        window.location.href = "/login";
      } else {
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
          🏏 New Player
        </h1>
        <form onSubmit={onSubmitForm}>
          <input
            type="text"
            name="player_id"
            placeholder="Player ID (e.g., rn22)"
            className="mb-3 w-full rounded border border-gray-300 p-3"
            value={player_id}
            onChange={onChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="mb-3 w-full rounded border border-gray-300 p-3"
            value={password}
            onChange={onChange}
            required
          />
          <input
            type="text"
            name="full_name"
            placeholder="Full Name"
            className="mb-3 w-full rounded border border-gray-300 p-3"
            value={full_name}
            onChange={onChange}
            required
          />
          <input
            type="text"
            name="branch"
            placeholder="Branch (e.g., CSE)"
            className="mb-3 w-full rounded border border-gray-300 p-3"
            value={branch}
            onChange={onChange}
            required
          />
          <div className="flex gap-2 mb-4">
             <input
              type="number"
              name="year_of_study"
              placeholder="Year (1-4)"
              className="w-1/2 rounded border border-gray-300 p-3"
              value={year_of_study}
              onChange={onChange}
              required
            />
            <input
              type="number"
              name="joining_year"
              placeholder="Join Year (2023)"
              className="w-1/2 rounded border border-gray-300 p-3"
              value={joining_year}
              onChange={onChange}
              required
            />
          </div>

          <button className="w-full rounded bg-green-600 p-3 font-bold text-white hover:bg-green-700">
            Submit Registration
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;