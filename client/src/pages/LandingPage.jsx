import React from "react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white overflow-x-hidden font-sans">
      
      {/* BACKGROUND FX */}
      <div className="absolute top-0 left-0 w-full h-screen bg-gradient-to-b from-blue-900/20 via-[#0f172a] to-[#0f172a] -z-10"></div>
      <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-green-500/5 rounded-full blur-3xl -z-10"></div>

      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
            <span className="text-3xl">🏏</span>
            <h1 className="text-2xl font-black tracking-tighter text-white">CRIC<span className="text-blue-500">MANAGER</span></h1>
        </div>
        <div className="flex gap-4">
            <Link to="/login" className="px-6 py-2 rounded-full border border-gray-600 text-sm font-bold hover:border-white transition">Login</Link>
            <Link to="/register" className="px-6 py-2 rounded-full bg-blue-600 text-white text-sm font-bold hover:bg-blue-500 shadow-lg hover:shadow-blue-500/30 transition">Join Squad</Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-32 text-center relative">
        <span className="inline-block py-1 px-3 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold tracking-widest uppercase mb-6">The Ultimate Team OS</span>
        
        <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-6 leading-tight">
            MANAGE YOUR TEAM <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">LIKE A PRO.</span>
        </h1>
        
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Track stats, manage finances, schedule matches, and automate your scorecard. 
            The all-in-one dashboard for the modern college cricket captain.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/register" className="px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:bg-gray-200 transition transform hover:-translate-y-1 shadow-xl">
                Start Your Season &rarr;
            </Link>
            <Link to="/login" className="px-8 py-4 bg-gray-800 text-white rounded-full font-bold text-lg border border-gray-700 hover:bg-gray-700 transition">
                Access Dashboard
            </Link>
        </div>
      </div>

      {/* FEATURE GRID */}
      <div className="max-w-7xl mx-auto px-6 py-20 border-t border-gray-800">
        <div className="grid md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl bg-gray-900 border border-gray-800 hover:border-blue-500/50 transition group">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:bg-blue-500/20 transition">📊</div>
                <h3 className="text-xl font-bold text-white mb-2">Pro Analytics</h3>
                <p className="text-gray-400 leading-relaxed">Auto-generated strike rates, economy, and form guides. Visualize your career like never before.</p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl bg-gray-900 border border-gray-800 hover:border-green-500/50 transition group">
                <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:bg-green-500/20 transition">📝</div>
                <h3 className="text-xl font-bold text-white mb-2">Live Scorecard</h3>
                <p className="text-gray-400 leading-relaxed">Ball-by-ball entry with automated career updates. No more manual Excel sheets.</p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl bg-gray-900 border border-gray-800 hover:border-purple-500/50 transition group">
                <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:bg-purple-500/20 transition">💰</div>
                <h3 className="text-xl font-bold text-white mb-2">Finance & Dues</h3>
                <p className="text-gray-400 leading-relaxed">Track expenses, split bills, and manage reimbursement status seamlessly.</p>
            </div>

        </div>
      </div>

      {/* FOOTER */}
      <footer className="text-center py-10 text-gray-600 text-sm border-t border-gray-800">
        <p>&copy; 2025 College Cricket Manager. Built for Champions.</p>
      </footer>

    </div>
  );
};

export default LandingPage;