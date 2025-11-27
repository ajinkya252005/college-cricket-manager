const router = require("express").Router();
const pool = require("../db");

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

// GET ALL ACTIVE PLAYERS
router.get("/", async (req, res) => {
  try {
    const players = await pool.query(
      "SELECT user_id, player_id, full_name, role FROM users WHERE status = 'active' ORDER BY full_name ASC"
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

module.exports = router;