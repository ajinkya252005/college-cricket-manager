# 🏏 College Cricket Manager (The Team OS)


![License](https://img.shields.io/badge/License-MIT-green.svg) ![Stack](https://img.shields.io/badge/Stack-PERN-blue.svg) ![Status](https://img.shields.io/badge/Status-Production_Ready-orange.svg)

<div align="center">
  <p align="center">
    <br />
    <a href="https://college-cricket-manager.vercel.app/"><strong>View Live Demo »</strong></a>
  </p>
</div>

A high-performance, full-stack **PERN** application (PostgreSQL, Express, React, Node.js) designed to be the ultimate operating system for managing a college cricket team. It digitizes the entire ecosystem—from **Ball-by-Ball Scorecards** to **Financial Ledgers** and **Player Analytics**.

---
## 📖 The Story: Why I Built This

Initially, I managed all the documentation, attendance, and complex financial calculations for our college cricket team using Excel spreadsheets. It quickly became a logistical nightmare—tracking specific financial cases, mapping attendance to contributions, and manually updating player stats required endless formula tweaks and cell selections. 

I built this platform to turn a messy, manual task into a seamless digital experience. By automating the math, tracking, and statistical aggregation, this platform allows the team to focus on the game, not the paperwork.

---
## 🚀 Features at a Glance

### 👑 Admin Command Center (God Mode)
* **📊 Live Telemetry Dashboard:** Real-time visualization of team funds, active squad strength, pending approvals, and upcoming fixtures.
* **📝 Pro Scorecard Engine:**
    * **Innings-Based Interface:** Separate tabs for 1st and 2nd innings with auto-switching logic.
    * **Drag-and-Drop Batting Order:** Adjust the lineup in real-time.
    * **Smart Dismissals:** Dynamic inputs for Catch/Bowl/Run-out details.
    * **Auto-Calculated Stats:** Updates career records (Runs, Wickets, Strike Rate) instantly upon saving.
* **💰 Finance Vault (Banker Model):**
    * **Split Billing:** Automatically divides practice/match costs among present players.
    * **Debt Tracking:** Tracks who paid the vendor (Banker) and who owes money to whom.
    * **Partial Reimbursements:** Manage partial payments and track pending dues.
    * **Team Treasury:** Manual fund adjustments for petty cash management.
* **📅 Attendance Manager (Time Travel):**
    * **Session-Based Logging:** Create Practice, Match, or Fitness sessions.
    * **Auto-Log:** Playing XI are automatically marked "Present" when a scorecard is saved.
    * **Time Travel:** View and edit attendance records for past dates using historical roster data.
* **👥 Squad Lifecycle:**
    * **Gatekeeper Auth:** New registrations are "Pending" until approved.
    * **Alumni System:** Archive seniors to a "Hall of Fame" while preserving their historical stats.

### 🧢 Player Locker Room (User View)
* **📈 Career Analytics:**
    * **Pro Stats:** Batting Average, Strike Rate, Economy, and Best Figures.
    * **Form Guide:** Interactive visualizations (Line & Bar Charts) showing performance in the last 5 matches.
* **🗓 Match History:** Digital log of every match played with personal performance highlights (Green for Wins, Red for Losses).
* **💸 My Wallet:** A banking-style breakdown of Total Invested, Reimbursements Received, and Net Expense.
* **🔒 Privacy:** View teammate stats without seeing sensitive contact/financial info.

---
## 📸 Screenshots
<div align="center">
  <h3>Admin Dashboard</h3>
  <img src="./screenshots/adminDashboard.png" width="700" alt="Admin Dashboard">
  <br><br>
  <h3>Player Stats</h3>
  <img src="./screenshots/playerDetailStats.png" width="700" alt="Player Stats">
  <br><br>
  <h3>Full Scorecard</h3>
  <img src="./screenshots/playerFullScoreboard.png" width="700" alt="Detail Scorecard">
  <br><br>
  <h3>Admin Finance</h3>
  <img src="./screenshots/adminFinanceVault.png" width="700" alt="Admin Finance">
  <br><br>
  <h3>Player Finance</h3>
  <img src="./screenshots/playerFinances.png" width="700" alt="Player Finances">
  <br><br>
  <h3>Team HQ</h3>
  <img src="./screenshots/playerTeamHQ.png" width="700" alt="Team Headquarters">
</div>

---

## 🛠️ Tech Stack

| Area | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | **React (Vite)** | Ultra-fast SPA with modern hooks and context API. |
| **Styling** | **Tailwind CSS** | Premium "Dark Mode" aesthetic with Glassmorphism effects. |
| **Backend** | **Node.js + Express** | RESTful API with secure routing, middleware, and error handling. |
| **Database** | **PostgreSQL** | Relational data model with complex Joins, Triggers, and ACID transactions. |
| **Auth** | **JWT + Bcrypt** | Secure session management, password hashing, and role-based access control. |
| **Charts** | **Recharts** | Interactive data visualization for player analytics. |

---

## 🗄️ Database Architecture

The PostgreSQL database (`college_cricket_db`) is highly normalized to handle complex relational data:

| Table | Description |
| :--- | :--- |
| `users` | Core table for authentication and player profiles (branch, year, lifetime stats). |
| `attendance_events` | Tracks all practice sessions, meetings, and match days. |
| `attendance_logs` | Maps individual players to specific events (Present/Absent). |
| `finance_records` | Detailed ledger of player payments, dues, and reimbursements. |
| `matches` | Records of all games played, including opponents, dates, and outcomes. |
| `match_participation`| Granular, match-by-match stats for individual players (Runs, Wickets, etc.). |
| `opponent_participation`| Tracks opponent details for comprehensive match scorecards. |
| `team_funds` | Central treasury tracker for total team balance. |
| `tournaments` | High-level grouping for multiple matches and specific fee structures. |
| `tournament_squads` | Manages the locked roster of players selected for specific tournaments. |

---
