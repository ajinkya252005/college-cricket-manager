const router = require("express").Router();
const pool = require("../db");

// 1. GET TEAM HEADLINE STATS (Wins, Losses, Win %)
router.get("/stats", async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_matches,
        COUNT(*) FILTER (WHERE winner = 'us') as wins,
        COUNT(*) FILTER (WHERE winner = 'them') as losses,
        COUNT(*) FILTER (WHERE winner IN ('draw', 'tie', 'abandoned')) as draws
      FROM matches
    `);
    
    const s = stats.rows[0];
    const win_rate = s.total_matches > 0 ? Math.round((s.wins / s.total_matches) * 100) : 0;

    res.json({ ...s, win_rate });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 2. GET LEADERBOARDS (Top 5 Batsmen & Bowlers)
router.get("/leaderboard", async (req, res) => {
  try {
    // Top Run Scorers
    const batters = await pool.query(`
        SELECT user_id, full_name, total_runs, total_matches 
        FROM users WHERE status = 'active' 
        ORDER BY total_runs DESC LIMIT 5
    `);

    // Top Wicket Takers
    const bowlers = await pool.query(`
        SELECT user_id, full_name, total_wickets, total_matches 
        FROM users WHERE status = 'active' 
        ORDER BY total_wickets DESC LIMIT 5
    `);

    res.json({ batting: batters.rows, bowling: bowlers.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 3. GET TOURNAMENT PERFORMANCE
router.get("/tournaments", async (req, res) => {
  try {
    const data = await pool.query(`
        SELECT 
            t.name, 
            COUNT(m.match_id) as matches,
            COUNT(m.match_id) FILTER (WHERE m.winner = 'us') as wins,
            COUNT(m.match_id) FILTER (WHERE m.winner = 'them') as losses
        FROM tournaments t
        LEFT JOIN matches m ON t.tournament_id = m.tournament_id
        GROUP BY t.tournament_id
        ORDER BY t.start_date DESC
    `);
    res.json(data.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;