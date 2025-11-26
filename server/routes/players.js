const router = require("express").Router();
const pool = require("../db");

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

module.exports = router;