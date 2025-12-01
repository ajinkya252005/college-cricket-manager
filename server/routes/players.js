const router = require("express").Router();
const pool = require("../db");
const bcrypt = require("bcryptjs"); // <--- ADD THIS

// 1. GET ALL PENDING REQUESTS
router.get("/pending", async (req, res) => {
  try {
    const pending = await pool.query(
      "SELECT user_id, full_name, player_id, branch, year_of_study FROM users WHERE status = 'pending'"
    );
    res.json(pending.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 2. APPROVE PLAYER
router.put("/approve/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("UPDATE users SET status = 'active' WHERE user_id = $1", [id]);
    res.json("User Approved");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 3. REJECT PLAYER (Delete them)
router.delete("/reject/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM users WHERE user_id = $1", [id]);
    res.json("User Rejected");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
// 7. GET ALL ALUMNI (Ex-Players)
router.get("/alumni", async (req, res) => {
  try {
    const alumni = await pool.query(
      "SELECT user_id, full_name, player_id, branch, year_of_study, leaving_date FROM users WHERE status = 'alumni' ORDER BY leaving_date DESC"
    );
    res.json(alumni.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// GET ALL ACTIVE PLAYERS (With Stats for Roster Cards)
router.get("/", async (req, res) => {
  try {
    const players = await pool.query(
      `SELECT 
        user_id, player_id, full_name, role, branch, year_of_study, 
        total_matches, total_runs, total_wickets 
       FROM users 
       WHERE status = 'active' 
       ORDER BY full_name ASC`
    );
    res.json(players.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// GET SINGLE PLAYER PUBLIC PROFILE (For Roster Click)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const player = await pool.query(
      "SELECT user_id, full_name, role, branch, joining_year, total_matches, total_runs, total_wickets FROM users WHERE user_id = $1",
      [id]
    );
    res.json(player.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// GET DETAILED RICH STATS (Aggregated from Match History)
router.get("/stats/rich/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Fetch Basic Totals (from Users table)
    const userBasic = await pool.query("SELECT * FROM users WHERE user_id = $1", [id]);
    
    // 2. Fetch Aggregated Batting Stats
    const battingAgg = await pool.query(`
        SELECT 
            MAX(runs_scored) as highest_score,
            COUNT(*) FILTER (WHERE runs_scored >= 50 AND runs_scored < 100) as fifties,
            COUNT(*) FILTER (WHERE runs_scored >= 100) as hundreds,
            COUNT(*) FILTER (WHERE runs_scored = 0 AND is_out = true) as ducks,
            COUNT(*) FILTER (WHERE is_out = false) as not_outs,
            COUNT(*) as innings_played
        FROM match_participation 
        WHERE user_id = $1 AND (balls_faced > 0 OR is_out = true)
    `, [id]);

    // 3. Fetch Best Bowling Figures
    const bowlingBest = await pool.query(`
        SELECT wickets_taken, runs_conceded 
        FROM match_participation 
        WHERE user_id = $1 AND overs_bowled > 0
        ORDER BY wickets_taken DESC, runs_conceded ASC 
        LIMIT 1
    `, [id]);

    // 4. Fetch Last 5 Matches (Form Guide) - NOW WITH OPPONENT NAME
    const recentForm = await pool.query(`
        SELECT mp.runs_scored, mp.is_out, mp.wickets_taken, m.opponent_name 
        FROM match_participation mp
        JOIN matches m ON mp.match_id = m.match_id
        WHERE mp.user_id = $1 
        ORDER BY m.match_date DESC 
        LIMIT 5
    `, [id]);

    // Combine Data
    const data = {
        profile: userBasic.rows[0],
        batting: battingAgg.rows[0],
        best_bowling: bowlingBest.rows[0] || { wickets_taken: 0, runs_conceded: 0 },
        recent: recentForm.rows.reverse() // Show oldest to newest
    };

    res.json(data);

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 3. ARCHIVE PLAYER (Move to Alumni - Soft Delete)
router.put("/archive/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // Set status to 'alumni' AND set the leaving date to TODAY
    await pool.query(
        "UPDATE users SET status = 'alumni', leaving_date = CURRENT_DATE WHERE user_id = $1", 
        [id]
    );
    res.json("Player moved to Alumni");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 4. GET PLAYERS ACTIVE ON SPECIFIC DATE (Time-Travel Logic)
router.get("/active-on-date/:date", async (req, res) => {
  try {
    const { date } = req.params; // e.g., '2025-07-21'
    
    const players = await pool.query(
      `SELECT user_id, full_name, player_id, role, joining_date, leaving_date 
       FROM users 
       WHERE 
         -- 1. Must have joined ON or BEFORE the target date
         joining_date <= $1 
         AND 
         -- 2. Must NOT have left before the target date (or haven't left yet)
         (leaving_date IS NULL OR leaving_date >= $1)
         AND
         -- 3. Exclude pending/rejected users
         status IN ('active', 'alumni') 
       ORDER BY full_name ASC`,
      [date]
    );
    res.json(players.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 5. EDIT PLAYER PROFILE
router.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, middle_name, last_name, branch, year_of_study, joining_date, birth_date } = req.body;

    // Construct full name for display compatibility
    const full_name = `${first_name} ${middle_name ? middle_name + ' ' : ''}${last_name}`;

    await pool.query(
      `UPDATE users SET 
        first_name = $1, middle_name = $2, last_name = $3, full_name = $4,
        branch = $5, year_of_study = $6, joining_date = $7, birth_date = $8
       WHERE user_id = $9`,
      [first_name, middle_name, last_name, full_name, branch, year_of_study, joining_date, birth_date, id]
    );

    res.json("Player Updated Successfully");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 6. ADMIN ADD PLAYER (Directly Active)
router.post("/add", async (req, res) => {
  try {
    const { 
        player_id, password, 
        first_name, middle_name, last_name, 
        branch, year_of_study, joining_date, birth_date 
    } = req.body;

    // Check if exists
    const userCheck = await pool.query("SELECT * FROM users WHERE player_id = $1", [player_id]);
    if (userCheck.rows.length > 0) return res.status(400).json("Player ID already exists");

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const bcryptPassword = await bcrypt.hash(password, salt);
    
    const full_name = `${first_name} ${middle_name ? middle_name + ' ' : ''}${last_name}`;

    await pool.query(
      `INSERT INTO users (
          player_id, password_hash, full_name, 
          first_name, middle_name, last_name,
          branch, year_of_study, joining_date, birth_date,
          status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'active')`,
      [
          player_id, bcryptPassword, full_name,
          first_name, middle_name, last_name,
          branch, year_of_study, joining_date, birth_date
      ]
    );

    res.json("Player Added Successfully");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;