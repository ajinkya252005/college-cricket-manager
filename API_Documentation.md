# 🏏 College Cricket Manager - API Documentation

This document outlines the RESTful API endpoints for the College Cricket Manager backend. The backend is built using the **PERN stack (PostgreSQL, Express.js, Node.js)** and secured with **JSON Web Tokens (JWT)**.

## 🔗 Base URL
All API requests should be prefixed with:
`http://localhost:5000/api` (Local Development)  
`https://<own-render-url>.onrender.com/api` (Production)

## 🔐 Authentication & Authorization
Most endpoints require a valid JWT token. 
* Include the token in the request header:  
  `Authorization: Bearer <your_jwt_token>`
* **Roles:** `player`, `admin`, `team` (Public HQ)

---

## 👤 1. Authentication Routes (`/api/auth`)

| Method | Endpoint | Role | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Public | Register a new player account (Pending Admin Approval). |
| `POST` | `/auth/login` | Public | Authenticate a user and return a JWT token & role. |
| `GET` | `/auth/verify` | Any | Verify JWT token validity on frontend load. |

---

## 🧑‍🤝‍🧑 2. Player & Roster Management (`/api/players`)

| Method | Endpoint | Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/players` | Any | Fetch the active team roster (includes branch, year). |
| `GET` | `/players/requests` | Admin | Fetch pending player registration requests. |
| `PUT` | `/players/approve/:id` | Admin | Accept a pending registration request. |
| `DELETE`| `/players/reject/:id` | Admin | Reject and delete a registration request. |
| `POST` | `/players/manual` | Admin | Manually add a new player to the database. |
| `PUT` | `/players/:id/alumni` | Admin | Move a graduating/leaving player to Alumni status. |
| `PUT` | `/players/:id/active` | Admin | Restore an Alumni player back to the active roster. |
| `GET` | `/players/:id/stats` | Player/Admin| Get detailed career stats (Runs, Wickets, SR, 4s, 6s) + last 5 match graph data. |

---

## 📅 3. Attendance Control (`/api/attendance`)

| Method | Endpoint | Role | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/attendance/session` | Admin | Create a new session (Practice/Custom) and log present players. |
| `GET` | `/attendance/sessions`| Admin | Get a list of all historical attendance sessions. |
| `PUT` | `/attendance/session/:id` | Admin | Edit an existing session's attendance log. |
| `GET` | `/attendance/player/:id` | Player | Get specific player's personal session and match attendance log. |

---

## 💰 4. Financial Vault (`/api/finance`)

| Method | Endpoint | Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/finance/team-funds` | Admin | Get the central treasury balance (Total collected vs spent). |
| `GET` | `/finance/player/:id` | Player | Get personal financial ledger (Total paid, reimbursed, net due, transactions). |
| `POST` | `/finance/expense` | Admin | Distribute a custom expense among all or specific selected players. |
| `POST` | `/finance/bill-session/:id`| Admin | **Automated:** Bills a practice session. Auto-calculates contribution based *only* on players marked 'Present'. |
| `POST` | `/finance/bill-tournament/:id`| Admin| **Automated:** Distributes tournament entry fees among the locked tournament squad. |
| `POST` | `/finance/pay/:id` | Admin | Log a manual payment received from a specific player. |

---

## 🏆 5. Tournaments & Squads (`/api/tournaments`)

| Method | Endpoint | Role | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/tournaments` | Admin | Create a new tournament entry. |
| `GET` | `/tournaments` | Any | List all upcoming and historical tournaments. |
| `POST` | `/tournaments/:id/squad` | Admin | Define and lock the specific player squad for a tournament. |
| `GET` | `/tournaments/:id/squad` | Any | View the locked squad for a specific tournament. |

---

## 🏏 6. Matches & Scorecards (`/api/matches`)

| Method | Endpoint | Role | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/matches/schedule` | Admin | Schedule a new match linked to a specific tournament. (Locks squad updates). |
| `GET` | `/matches` | Any | Fetch complete match history and upcoming scheduled matches. |
| `POST` | `/matches/:id/scorecard` | Admin | Enter post-match details (Winner, margin, detailed player runs/wickets). Auto-updates lifetime career stats. |
| `PUT` | `/matches/:id/scorecard` | Admin | Edit an existing match scorecard (triggers stat recalculation). |
| `DELETE`| `/matches/:id` | Admin | Delete a scheduled or historical match. |

---

## 📊 7. Team HQ Analytics (`/api/team`)

| Method | Endpoint | Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/team/dashboard` | Team | Get aggregate team data: Every player's Runs, Wickets, Overs, Boundaries, and P/A status for the last 5 sessions. |

---

## 🤖 8. Automated Cron Jobs (Background Tasks)

These endpoints/functions do not require HTTP requests as they run automatically via `node-cron` on the server:

* **`Academic Year Promotion`**: Executes annually on **June 1st**.
  * **Logic:** Increments the academic year of all active users by +1.
  * **Alumni Shift:** Users currently in their 4th year are automatically transitioned to the `alumni` status to maintain roster cleanliness.

---

## 📝 Example JSON Payloads

### POST `/api/matches/:id/scorecard`
```json
{
  "opponent": "COEP Team",
  "result": "Won",
  "margin": "4 Wickets",
  "playerStats": [
    {
      "playerId": "uuid-string-here",
      "runsScored": 45,
      "ballsFaced": 22,
      "fours": 4,
      "sixes": 3,
      "oversBowled": 4,
      "wicketsTaken": 2,
      "runsConceded": 28
    }
  ]
}