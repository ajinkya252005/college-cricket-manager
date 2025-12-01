import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const Register = () => {
  const [inputs, setInputs] = useState({
    player_id: "", password: "", confirm_password: "",
    first_name: "", middle_name: "", last_name: "",
    branch: "", year_of_study: "", joining_month: "", joining_year: "", birth_date: ""
  });
  const [loading, setLoading] = useState(false);

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const branches = ["Printing", "AI&DS", "CS", "IT", "Electrical", "Mechanical", "E&TC"];

  const onChange = (e) => setInputs({ ...inputs, [e.target.name]: e.target.value });

  const onSubmitForm = async (e) => {
    e.preventDefault();
    if (inputs.password !== inputs.confirm_password) return toast.error("Passwords do not match!");
    if (!inputs.branch || !inputs.year_of_study || !inputs.joining_month) return toast.warning("Please select all options.");

    setLoading(true);
    try {
      const body = { ...inputs, year_of_study: parseInt(inputs.year_of_study), joining_year: parseInt(inputs.joining_year) };
      const response = await fetch("https://cricket-api-ll8u.onrender.com/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const parseRes = await response.json();

      if (response.ok) {
        toast.success("Registration Submitted! Wait for approval.");
        window.location.href = "/login";
      } else {
        toast.error(parseRes);
      }
    } catch (err) { console.error(err.message); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center relative overflow-hidden p-4 py-10">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-green-600/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>

      <div className="w-full max-w-2xl bg-gray-800/50 backdrop-blur-lg border border-gray-700 p-8 rounded-3xl shadow-2xl relative z-10">
        
        <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">Join the Squad</h1>
            <p className="text-gray-400 text-sm">Create your player profile</p>
        </div>
        
        <form onSubmit={onSubmitForm} className="space-y-5">
          
          {/* SECTION 1: IDENTITY */}
          <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700/50">
              <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Identity</h3>
              <div className="grid md:grid-cols-3 gap-3 mb-3">
                <input type="text" name="first_name" placeholder="First Name" className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-white text-sm focus:border-blue-500 outline-none" value={inputs.first_name} onChange={onChange} required />
                <input type="text" name="middle_name" placeholder="Middle Name" className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-white text-sm focus:border-blue-500 outline-none" value={inputs.middle_name} onChange={onChange} />
                <input type="text" name="last_name" placeholder="Last Name" className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-white text-sm focus:border-blue-500 outline-none" value={inputs.last_name} onChange={onChange} required />
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <input type="text" name="player_id" placeholder="Player ID" className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-white text-sm focus:border-blue-500 outline-none" value={inputs.player_id} onChange={onChange} required />
                <input type="date" name="birth_date" className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-white text-sm focus:border-blue-500 outline-none" value={inputs.birth_date} onChange={onChange} required />
              </div>
          </div>

          {/* SECTION 2: ACADEMIC & TEAM */}
          <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700/50">
              <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Academic & Team Details</h3>
              <div className="grid md:grid-cols-2 gap-3 mb-3">
                <select name="branch" className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-white text-sm focus:border-blue-500 outline-none" value={inputs.branch} onChange={onChange} required>
                    <option value="">Select Branch</option>
                    {branches.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <select name="year_of_study" className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-white text-sm focus:border-blue-500 outline-none" value={inputs.year_of_study} onChange={onChange} required>
                    <option value="">Current Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                </select>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                 <select name="joining_month" className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-white text-sm focus:border-blue-500 outline-none" value={inputs.joining_month} onChange={onChange} required>
                    <option value="">Joining Month</option>
                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <input type="number" name="joining_year" placeholder="Join Year (e.g. 2023)" className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-white text-sm focus:border-blue-500 outline-none" value={inputs.joining_year} onChange={onChange} required />
              </div>
          </div>

          {/* SECTION 3: SECURITY */}
          <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700/50">
              <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Security</h3>
              <div className="grid md:grid-cols-2 gap-3">
                <input type="password" name="password" placeholder="Password" className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-white text-sm focus:border-blue-500 outline-none" value={inputs.password} onChange={onChange} required />
                <input type="password" name="confirm_password" placeholder="Confirm Password" className={`bg-gray-800 border border-gray-600 rounded-lg p-3 text-white text-sm focus:border-blue-500 outline-none ${inputs.confirm_password && inputs.password !== inputs.confirm_password ? 'border-red-500' : ''}`} value={inputs.confirm_password} onChange={onChange} required />
              </div>
          </div>

          <button disabled={loading} className="w-full rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 p-4 font-bold text-white shadow-lg hover:shadow-green-500/30 transition-all transform hover:scale-[1.02]">
            {loading ? "Processing..." : "Submit Registration"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 font-bold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;