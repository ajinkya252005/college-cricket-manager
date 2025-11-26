const router = require("express").Router();
const pool = require("../db");

// 1. CREATE A MATCH
router.post("/", async (req, res) => {
  try {
    const { tournament_id, opponent_name, match_date, venue } = req.body;

    const newMatch = await pool.query(
      "INSERT INTO matches (tournament_id, opponent_name, match_date) VALUES($1, $2, $3) RETURNING *",
      [tournament_id, opponent_name, match_date]
    );

    res.json(newMatch.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 2. GET ALL MATCHES (With Tournament Name)
router.get("/", async (req, res) => {
  try {
    // We join with tournaments table to show "Inter-College Cup" instead of "ID: 5"
    const matches = await pool.query(
      `SELECT m.*, t.name as tournament_name 
       FROM matches m 
       JOIN tournaments t ON m.tournament_id = t.tournament_id 
       ORDER BY m.match_date DESC`
    );
    res.json(matches.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 3. GET SINGLE MATCH DETAILS
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const match = await pool.query(
      `SELECT m.*, t.name as tournament_name 
       FROM matches m 
       JOIN tournaments t ON m.tournament_id = t.tournament_id 
       WHERE m.match_id = $1`,
      [id]
    );
    res.json(match.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 4. SUBMIT SCORECARD (CORRECTIVE / IDEMPOTENT LOGIC)
router.post("/:id/scorecard", async (req, res) => {
  const client = await pool.connect(); 
  
  try {
    const { id } = req.params; // Match ID
    const { result, player_stats } = req.body;

    // START TRANSACTION
    await client.query("BEGIN");

    // --- STEP 1: REVERT PREVIOUS STATS (If any exist) ---
    // First, find who played in this match previously
    const existingStats = await client.query(
      "SELECT user_id, runs_scored, wickets_taken FROM match_participation WHERE match_id = $1",
      [id]
    );

    // If there was previous data, subtract it from the users' career totals
    if (existingStats.rows.length > 0) {
      for (const oldStat of existingStats.rows) {
        await client.query(
          `UPDATE users SET 
             total_runs = total_runs - $1, 
             total_wickets = total_wickets - $2, 
             total_matches = total_matches - 1 
           WHERE user_id = $3`,
          [oldStat.runs_scored, oldStat.wickets_taken, oldStat.user_id]
        );
      }
      
      // Now delete the old participation records for this match
      await client.query("DELETE FROM match_participation WHERE match_id = $1", [id]);
    }

    // --- STEP 2: APPLY NEW STATS ---
    
    // Update Match Result
    await client.query(
      "UPDATE matches SET result = $1, scorecard_data = $2 WHERE match_id = $3",
      [result, JSON.stringify(player_stats), id]
    );

    // Loop through the NEW list and add stats
    for (const player of player_stats) {
      const { user_id, runs, wickets } = player;

      // A. Log participation
      await client.query(
        `INSERT INTO match_participation (match_id, user_id, runs_scored, wickets_taken) 
         VALUES ($1, $2, $3, $4)`,
        [id, user_id, runs, wickets]
      );

      // B. Update Career Stats (Add the new values)
      await client.query(
        `UPDATE users SET 
            total_runs = total_runs + $1, 
            total_wickets = total_wickets + $2, 
            total_matches = total_matches + 1 
         WHERE user_id = $3`,
        [runs, wickets, user_id]
      );
    }

    // COMMIT
    await client.query("COMMIT");
    res.json({ message: "Scorecard updated and Stats corrected!" });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err.message);
    res.status(500).send("Server Error: Transaction Failed");
  } finally {
    client.release();
  }
});

// 5. GET PLAYER MATCH HISTORY
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    const history = await pool.query(
      `SELECT m.match_date, m.opponent_name, m.result, t.name as tournament_name,
              mp.runs_scored, mp.wickets_taken
       FROM match_participation mp
       JOIN matches m ON mp.match_id = m.match_id
       JOIN tournaments t ON m.tournament_id = t.tournament_id
       WHERE mp.user_id = $1
       ORDER BY m.match_date DESC`,
      [userId]
    );

    res.json(history.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;