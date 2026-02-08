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


// GET DETAILED ANALYTICS & ATTENDANCE (For Team Login)
router.get("/analytics", async (req, res) => {
  try {
    // 1. Fetch Active Players & Career Stats
    // We select all the columns you specified for the analytics view
    const playersQuery = `
      SELECT 
        user_id, 
        full_name, 
        total_matches, 
        total_runs, 
        total_wickets, 
        total_balls_faced, 
        total_fours, 
        total_sixes, 
        total_overs_bowled, 
        total_runs_conceded, 
        total_maidens
      FROM users 
      WHERE status = 'active' OR status = 'Active' 
      ORDER BY full_name ASC;
    `;
    
    const { rows: players } = await pool.query(playersQuery);

    // 2. Fetch Attendance Data for each player
    const playersWithAttendance = await Promise.all(
      players.map(async (player) => {
        
        // A. Calculate Percentage for Practice Sessions
        // Join attendance_logs with attendance_events to filter by 'Practice Session'
        const percentageQuery = `
          SELECT 
            COUNT(*) as total_sessions,
            SUM(CASE WHEN al.status = 'present' THEN 1 ELSE 0 END) as present_count
          FROM attendance_logs al
          JOIN attendance_events ae ON al.event_id = ae.event_id
          WHERE al.user_id = $1 AND ae.event_type = 'Practice Session';
        `;
        
        const percentageRes = await pool.query(percentageQuery, [player.user_id]);
        
        const total = parseInt(percentageRes.rows[0].total_sessions) || 0;
        const present = parseInt(percentageRes.rows[0].present_count) || 0;
        
        // Calculate percentage (avoid division by zero)
        const attendancePercentage = total === 0 ? 0 : ((present / total) * 100).toFixed(1);

        // B. Fetch Last 5 Practice Sessions
        const last5Query = `
          SELECT al.status
          FROM attendance_logs al
          JOIN attendance_events ae ON al.event_id = ae.event_id
          WHERE al.user_id = $1 AND ae.event_type = 'Practice Session'
          ORDER BY al.date DESC
          LIMIT 5;
        `;
        
        const last5Res = await pool.query(last5Query, [player.user_id]);
        
        // Create an array of statuses like ['Present', 'Absent', ...]
        const last5Data = last5Res.rows.map(row => row.status);

        // Return the combined player object
        return {
          ...player,
          attendance_percentage: attendancePercentage,
          last_5_attendance: last5Data
        };
      })
    );

    res.json(playersWithAttendance);

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;