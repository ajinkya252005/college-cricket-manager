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

// 3. GET SINGLE MATCH DETAILS (With Full Stats Reconstruction)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // A. Get Basic Match Info
    const match = await pool.query(
      `SELECT m.*, t.name as tournament_name 
       FROM matches m 
       JOIN tournaments t ON m.tournament_id = t.tournament_id 
       WHERE m.match_id = $1`,
      [id]
    );

    if (match.rows.length === 0) return res.status(404).json("Match not found");

    const matchData = match.rows[0];

    // B. Fetch Our Team's Stats (Relational Data)
    const ourStats = await pool.query(
      `SELECT 
        mp.*, u.full_name 
       FROM match_participation mp
       JOIN users u ON mp.user_id = u.user_id
       WHERE mp.match_id = $1`,
      [id]
    );

    // C. Fetch Opponent Stats (Relational Data)
    const oppStats = await pool.query(
      `SELECT * FROM opponent_participation WHERE match_id = $1`,
      [id]
    );

    // D. Construct the "scorecard_data" object dynamically
    // This tricks the frontend into thinking it's reading a saved JSON snapshot
    const reconstructedScorecard = {
      our_team: ourStats.rows.map(row => ({
        user_id: row.user_id,
        // Map Database Columns to Frontend State Names
        full_name: row.full_name,
        runs: row.runs_scored,
        balls: row.balls_faced,
        fours: row.fours,
        sixes: row.sixes,
        is_out: row.is_out,
        dismissal_type: row.dismissal_type,
        dismissal_text: row.dismissal_type === 'bowled' ? row.dismissal_bowler : row.dismissal_fielder, // Simplify for display
        overs: row.overs_bowled,
        runs_given: row.runs_conceded,
        wickets: row.wickets_taken,
        maidens: row.maidens
      })),
      
      // Separate Opponent Batting & Bowling based on who batted/bowled
      opponent_batting: oppStats.rows.filter(p => p.balls_faced > 0 || p.is_out).map(row => ({
        player_name: row.player_name,
        runs: row.runs_scored,
        balls: row.balls_faced,
        fours: row.fours,
        sixes: row.sixes,
        is_out: row.is_out,
        dismissal_text: row.dismissal_text
      })),

      opponent_bowling: oppStats.rows.filter(p => p.overs_bowled > 0).map(row => ({
        player_name: row.player_name,
        overs: row.overs_bowled,
        runs_given: row.runs_conceded,
        wickets: row.wickets_taken,
        maidens: row.maidens
      }))
    };

    // Attach this reconstructed object to the response
    matchData.scorecard_data = reconstructedScorecard;

    res.json(matchData);

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 4. SUBMIT SCORECARD (CORRECTIVE / IDEMPOTENT LOGIC)
// 4. SUBMIT SCORECARD (DETAILED STATS UPDATE)
// 4. SUBMIT SCORECARD (FULL RELATIONAL STORAGE)
router.post("/:id/scorecard", async (req, res) => {
  const client = await pool.connect(); 
  try {
    const { id } = req.params; // Match ID
    const { result, our_team_stats, opponent_stats, full_scorecard } = req.body;

    await client.query("BEGIN");

    // --- STEP 1: REVERT OUR TEAM'S CAREER STATS ---
    const existingStats = await client.query("SELECT * FROM match_participation WHERE match_id = $1", [id]);
    if (existingStats.rows.length > 0) {
      for (const old of existingStats.rows) {
        await client.query(
          `UPDATE users SET 
             total_runs = total_runs - $1, total_wickets = total_wickets - $2, total_matches = total_matches - 1,
             total_balls_faced = total_balls_faced - $3, total_fours = total_fours - $4, total_sixes = total_sixes - $5,
             total_overs_bowled = total_overs_bowled - $6, total_runs_conceded = total_runs_conceded - $7, total_maidens = total_maidens - $8
           WHERE user_id = $9`,
          [
            old.runs_scored, old.wickets_taken,
            old.balls_faced, old.fours, old.sixes,
            old.overs_bowled, old.runs_conceded, old.maidens,
            old.user_id
          ]
        );
      }
    }

    // --- STEP 2: CLEAR OLD DATA (Both Teams) ---
    await client.query("DELETE FROM match_participation WHERE match_id = $1", [id]);
    await client.query("DELETE FROM opponent_participation WHERE match_id = $1", [id]);

    // --- STEP 3: UPDATE MATCH RESULT ---
    // We don't need scorecard_data JSON anymore for opponents, but we can keep it for caching if needed.
    // For now, let's rely on the tables.
    
    await client.query("UPDATE matches SET result = $1, scorecard_data = $2 WHERE match_id = $3", [result, JSON.stringify(full_scorecard), id]);

    // --- STEP 4: INSERT OUR TEAM & UPDATE CAREER STATS ---
    for (const p of our_team_stats) {
      await client.query(
        `INSERT INTO match_participation 
        (match_id, user_id, runs_scored, wickets_taken, balls_faced, fours, sixes, overs_bowled, runs_conceded, maidens, is_out, dismissal_type, dismissal_bowler, dismissal_fielder) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [id, p.user_id, p.runs, p.wickets, p.balls, p.fours, p.sixes, p.overs, p.runs_given, p.maidens, p.is_out, p.dismissal_type, p.dismissal_bowler, p.dismissal_fielder]
      );

      await client.query(
        `UPDATE users SET 
            total_runs = total_runs + $1, total_wickets = total_wickets + $2, total_matches = total_matches + 1,
            total_balls_faced = total_balls_faced + $3, total_fours = total_fours + $4, total_sixes = total_sixes + $5,
            total_overs_bowled = total_overs_bowled + $6, total_runs_conceded = total_runs_conceded + $7, total_maidens = total_maidens + $8
         WHERE user_id = $9`,
        [p.runs, p.wickets, p.balls, p.fours, p.sixes, p.overs, p.runs_given, p.maidens, p.user_id]
      );
    }

    // --- STEP 5: INSERT OPPONENT TEAM (Manual Entries) ---
    for (const p of opponent_stats) {
       await client.query(
        `INSERT INTO opponent_participation 
        (match_id, player_name, runs_scored, balls_faced, fours, sixes, is_out, dismissal_text, overs_bowled, runs_conceded, wickets_taken, maidens) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [id, p.player_name, p.runs, p.balls, p.fours, p.sixes, p.is_out, p.dismissal_text, p.overs, p.runs_given, p.wickets, p.maidens]
      ); 
    }

    await client.query("COMMIT");
    res.json({ message: "Full Scorecard Saved Successfully!" });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err.message);
    res.status(500).send("Server Error");
  } finally {
    client.release();
  }
});

// 5. GET PLAYER MATCH HISTORY
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    const history = await pool.query(
      `SELECT m.match_id,m.match_date, m.opponent_name, m.result, t.name as tournament_name,
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