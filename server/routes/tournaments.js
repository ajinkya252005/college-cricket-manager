const router = require("express").Router();
const pool = require("../db");

// 1. CREATE A TOURNAMENT
router.post("/", async (req, res) => {
  try {
    const { name, start_date, end_date } = req.body;

    const newTournament = await pool.query(
      "INSERT INTO tournaments (name, start_date, end_date) VALUES($1, $2, $3) RETURNING *",
      [name, start_date, end_date]
    );

    res.json(newTournament.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 2. GET ALL TOURNAMENTS (Auto-Calculated Status)
router.get("/", async (req, res) => {
  try {
    const allTournaments = await pool.query(`
      SELECT tournament_id, name, start_date, end_date,
      CASE
        WHEN CURRENT_DATE < start_date THEN 'upcoming'
        WHEN CURRENT_DATE > end_date THEN 'completed'
        ELSE 'ongoing'
      END as status
      FROM tournaments 
      ORDER BY start_date DESC
    `);
    res.json(allTournaments.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 3. ADD PLAYER TO SQUAD
router.post("/:id/squad", async (req, res) => {
  try {
    const { user_id } = req.body;
    const { id } = req.params; // tournament_id

    // Check if already added
    const check = await pool.query(
        "SELECT * FROM tournament_squads WHERE tournament_id = $1 AND user_id = $2",
        [id, user_id]
    );

    if (check.rows.length > 0) {
        return res.status(400).json("Player already in squad");
    }

    const newMember = await pool.query(
      "INSERT INTO tournament_squads (tournament_id, user_id) VALUES ($1, $2) RETURNING *",
      [id, user_id]
    );

    res.json(newMember.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 4. GET SQUAD MEMBERS FOR A TOURNAMENT
router.get("/:id/squad", async (req, res) => {
  try {
    const { id } = req.params;
    const squad = await pool.query(
      `SELECT u.user_id, u.full_name, u.player_id, u.role 
       FROM tournament_squads ts 
       JOIN users u ON ts.user_id = u.user_id 
       WHERE ts.tournament_id = $1`,
      [id]
    );
    res.json(squad.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 5. REMOVE PLAYER FROM SQUAD (Constraint: No Matches Scheduled)
router.delete("/:id/squad/:userId", async (req, res) => {
  try {
    const { id, userId } = req.params; // id = tournament_id

    // 1. Check if matches exist for this tournament
    // If even ONE match is scheduled, we lock the squad to preserve integrity.
    const matchCheck = await pool.query(
        "SELECT count(*) FROM matches WHERE tournament_id = $1",
        [id]
    );

    if (parseInt(matchCheck.rows[0].count) > 0) {
        return res.status(400).json("Cannot remove players: Matches are already scheduled or played.");
    }

    // 2. Remove the player
    await pool.query(
        "DELETE FROM tournament_squads WHERE tournament_id = $1 AND user_id = $2",
        [id, userId]
    );

    res.json("Player removed from squad");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;