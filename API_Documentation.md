# 🏏 API Documentation: College Cricket Manager

**Base URL:** `https://cricket-api-ll8u.onrender.com/api`  
**Authentication:** All protected routes require a `Authorization: Bearer <token>` header.

---

## 1. 🔐 Authentication Module

### **Register New User**
* **Endpoint:** `POST /auth/register`
* **Access:** Public
* **Description:** Creates a new user with `status: 'pending'`.
* **Request Body:**
    ```json
    {
      "player_id": "rn22",
      "password": "securePassword123",
      "full_name": "Rahul Sharma",
      "branch": "CSE",
      "year": 3,
      "joining_year": 2023
    }
    ```
* **Response:**
    ```json
    {
      "message": "Registration successful. Please wait for Admin approval."
    }
    ```

### **Login**
* **Endpoint:** `POST /auth/login`
* **Access:** Public
* **Description:** Authenticates user and returns a JWT.
* **Request Body:**
    ```json
    {
      "player_id": "rn22",
      "password": "securePassword123"
    }
    ```
* **Response:**
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsIn...",
      "user": {
        "user_id": 101,
        "role": "player",
        "name": "Rahul Sharma"
      }
    }
    ```

---

## 2. 👤 Users & Players Module

### **Get All Players**
* **Endpoint:** `GET /players`
* **Access:** Protected (All roles)
* **Description:** Returns a list of all *active* players.
* **Response:**
    ```json
    [
      {
        "user_id": 101,
        "name": "Rahul Sharma",
        "branch": "CSE",
        "total_matches": 15,
        "total_runs": 450,
        "total_wickets": 12
      },
      ...
    ]
    ```

### **Get Player Profile**
* **Endpoint:** `GET /players/:id`
* **Access:** Protected
* **Description:** Returns detailed stats and profile info.
* **Response:**
    ```json
    {
      "profile": {
        "name": "Rahul Sharma",
        "branch": "CSE",
        "joining_year": 2023
      },
      "stats": {
        "career_runs": 450,
        "highest_score": 85,
        "wickets": 12
      }
    }
    ```

---

## 3. 🏆 Tournaments & Squads

### **Create Tournament**
* **Endpoint:** `POST /tournaments`
* **Access:** Admin Only
* **Request Body:**
    ```json
    {
      "name": "Inter-College Cup 2025",
      "start_date": "2025-01-15",
      "end_date": "2025-01-20"
    }
    ```

### **Add Players to Squad**
* **Endpoint:** `POST /tournaments/:tournamentId/squad`
* **Access:** Admin Only
* **Description:** Adds a list of existing players to a specific tournament squad.
* **Request Body:**
    ```json
    {
      "user_ids": [101, 102, 105, 108] 
    }
    ```

---

## 4. 🏏 Matches & Scorecards (Core Logic)

### **Create Match**
* **Endpoint:** `POST /matches`
* **Access:** Admin Only
* **Request Body:**
    ```json
    {
      "tournament_id": 5,
      "opponent_name": "MIT Pune",
      "match_date": "2025-01-16",
      "venue": "Home Ground"
    }
    ```

### **Set Match Playing XI**
* **Endpoint:** `PUT /matches/:matchId/roster`
* **Access:** Admin Only
* **Description:** Defines who is actually playing in this specific match.
* **Request Body:**
    ```json
    {
      "player_ids": [101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111]
    }
    ```

### **Submit Full Scorecard (Triggers Stats Update)**
* **Endpoint:** `POST /matches/:matchId/scorecard`
* **Access:** Admin Only
* **Description:** Saves the JSON scorecard AND automatically updates career stats for all players involved.
* **Request Body (Complex JSON):**
    ```json
    {
      "result": "Won by 20 runs",
      "innings": [
        {
          "team": "Our College",
          "total_runs": 180,
          "wickets": 4,
          "overs": 20,
          "batting_stats": [
            {
              "user_id": 101,
              "runs": 55,
              "balls": 30,
              "fours": 4,
              "sixes": 2,
              "out_status": "caught"
            },
            {
              "user_id": 102,
              "runs": 0,
              "balls": 1,
              "out_status": "bowled"
            }
          ]
        },
        {
          "team": "Opponent",
          "total_runs": 160,
          "wickets": 10,
          "bowling_stats": [
             {
               "user_id": 101,
               "overs": 4,
               "maiden": 0,
               "runs_conceded": 25,
               "wickets": 2
             }
          ]
        }
      ]
    }
    ```

---

## 5. 💰 Finance Module

### **Add Transaction**
* **Endpoint:** `POST /finance/record`
* **Access:** Admin Only
* **Request Body:**
    ```json
    {
      "user_id": 101,
      "amount": 500,
      "type": "payment_in", 
      "description": "Jersey Fee 2025",
      "date": "2025-01-10"
    }
    ```

### **Get My Finances**
* **Endpoint:** `GET /finance/me`
* **Access:** Player Only
* **Response:**
    ```json
    [
      {
        "date": "2025-01-10",
        "description": "Jersey Fee 2025",
        "amount": 500,
        "type": "payment_in",
        "is_reimbursed": false
      }
    ]
    ```

---

## 6. 📅 Attendance Module

### **Log Bulk Attendance**
* **Endpoint:** `POST /attendance/bulk`
* **Access:** Admin Only
* **Description:** Marks multiple users as present for an event.
* **Request Body:**
    ```json
    {
      "date": "2025-01-12",
      "event_type": "practice",
      "user_ids": [101, 102, 105, 108]
    }
    ```