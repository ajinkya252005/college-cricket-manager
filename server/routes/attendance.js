const router = require("express").Router();
const pool = require("../db");

// 1. GET ALL EVENTS (With Smart Date Logic)
router.get("/events", async (req, res) => {
  try {
    const events = await pool.query(
      `SELECT 
        ae.event_id,
        -- Priority: Use Match Date if linked, otherwise use the Logged Date
        COALESCE(m.match_date, ae.date) as date,
        ae.start_time,
        ae.end_time,
        ae.event_type,
        ae.description,
        ae.related_match_id
       FROM attendance_events ae
       LEFT JOIN matches m ON ae.related_match_id = m.match_id
       ORDER BY date DESC, ae.event_id DESC`
    );
    res.json(events.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 2. GET SINGLE EVENT DETAILS (For Editing)
// Returns Event Details + List of User IDs who were present
router.get("/event/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get Event Info
    const event = await pool.query("SELECT * FROM attendance_events WHERE event_id = $1", [id]);
    
    // Get Present User IDs
    const logs = await pool.query("SELECT user_id FROM attendance_logs WHERE event_id = $1", [id]);
    
    res.json({ 
        event: event.rows[0], 
        present_ids: logs.rows.map(l => l.user_id) 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 3. CREATE NEW ATTENDANCE SESSION (Updated for Absenteeism)
router.post("/create", async (req, res) => {
  const client = await pool.connect();
  try {
    const { date, start_time, end_time, event_type, description, user_ids } = req.body; 
    // user_ids contains ONLY the IDs of people who are PRESENT

    await client.query("BEGIN");

    // A. Create Event
    const newEvent = await client.query(
      "INSERT INTO attendance_events (date, start_time, end_time, event_type, description) VALUES ($1, $2, $3, $4, $5) RETURNING event_id",
      [date, start_time, end_time, event_type, description]
    );
    const eventId = newEvent.rows[0].event_id;

    // B. Fetch ALL Active Players to see who is missing
    const allPlayers = await client.query("SELECT user_id FROM users WHERE status = 'active'");

    // C. Insert Logs for EVERYONE
    for (const player of allPlayers.rows) {
      // Check if this player's ID is in the "Present" list sent by frontend
      // We convert to String to ensure types match (JS vs DB)
      const isPresent = user_ids.map(String).includes(String(player.user_id));
      const status = isPresent ? 'present' : 'absent';

      await client.query(
        "INSERT INTO attendance_logs (user_id, event_id, date, event_type, status) VALUES ($1, $2, $3, $4, $5)",
        [player.user_id, eventId, date, event_type, status]
      );
    }

    await client.query("COMMIT");
    res.json({ message: "Attendance Session Created!" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err.message);
    res.status(500).send("Server Error");
  } finally {
    client.release();
  }
});

// 4. UPDATE ATTENDANCE SESSION (Updated for Absenteeism)
router.put("/update/:id", async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params; 
    const { start_time, end_time, description, user_ids } = req.body; 

    await client.query("BEGIN");

    // A. Update Event Details
    await client.query(
      "UPDATE attendance_events SET start_time = $1, end_time = $2, description = $3 WHERE event_id = $4",
      [start_time, end_time, description, id]
    );

    // B. Delete OLD Logs
    await client.query("DELETE FROM attendance_logs WHERE event_id = $1", [id]);

    // C. Re-fetch basic info
    const eventInfo = await client.query("SELECT date, event_type FROM attendance_events WHERE event_id = $1", [id]);
    const { date, event_type } = eventInfo.rows[0];

    // D. Fetch ALL Active Players again
    const allPlayers = await client.query("SELECT user_id FROM users WHERE status = 'active'");

    // E. Re-Insert Logs for EVERYONE
    for (const player of allPlayers.rows) {
      const isPresent = user_ids.map(String).includes(String(player.user_id));
      const status = isPresent ? 'present' : 'absent';

      await client.query(
        "INSERT INTO attendance_logs (user_id, event_id, date, event_type, status) VALUES ($1, $2, $3, $4, $5)",
        [player.user_id, id, date, event_type, status]
      );
    }

    await client.query("COMMIT");
    res.json({ message: "Attendance Updated!" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err.message);
    res.status(500).send("Server Error");
  } finally {
    client.release();
  }
});

// 5. GET MY ATTENDANCE (With Match Context)
router.get("/my/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    // We LEFT JOIN with matches and tournaments to get details IF it's a match event
    const logs = await pool.query(
      `SELECT 
        l.status, 
        e.event_type, 
        e.description, 
        e.start_time, 
        e.end_time,
        -- Priority: Use Match Date if linked, otherwise Event Date
        COALESCE(m.match_date, e.date) as final_date,
        m.opponent_name,
        t.name as tournament_name
       FROM attendance_logs l
       JOIN attendance_events e ON l.event_id = e.event_id
       LEFT JOIN matches m ON e.related_match_id = m.match_id
       LEFT JOIN tournaments t ON m.tournament_id = t.tournament_id
       WHERE l.user_id = $1 
       ORDER BY final_date DESC`,
      [userId]
    );
    
    res.json(logs.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;