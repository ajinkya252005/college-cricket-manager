const router = require("express").Router();
const pool = require("../db");

// 1. MARK BULK ATTENDANCE (Admin Only)
router.post("/mark", async (req, res) => {
  const client = await pool.connect();
  try {
    const { date, event_type, user_ids } = req.body; 
    // user_ids is an array: [1, 2, 5, ...] (IDs of people present)

    await client.query("BEGIN");

    // Loop through all selected user IDs and insert them
    for (const userId of user_ids) {
      await client.query(
        "INSERT INTO attendance_logs (user_id, date, event_type, status) VALUES ($1, $2, $3, 'present')",
        [userId, date, event_type]
      );
    }

    await client.query("COMMIT");
    res.json({ message: "Attendance Marked Successfully!" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err.message);
    res.status(500).send("Server Error");
  } finally {
    client.release();
  }
});

// 2. GET MY ATTENDANCE (Player View)
router.get("/my/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const logs = await pool.query(
      "SELECT * FROM attendance_logs WHERE user_id = $1 ORDER BY date DESC",
      [userId]
    );
    res.json(logs.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;