const router = require("express").Router();
const pool = require("../db");

// 1. ADD A NEW TRANSACTION (Admin Only)
router.post("/add", async (req, res) => {
  try {
    const { user_id, amount, type, description } = req.body;
    // type should be 'payment_in' or 'expense'
    
    // If it's a team expense, user_id can be NULL
    const newRecord = await pool.query(
      "INSERT INTO finance_records (user_id, amount, type, description) VALUES ($1, $2, $3, $4) RETURNING *",
      [user_id || null, amount, type, description]
    );

    res.json(newRecord.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 2. GET ALL TRANSACTIONS (Admin View)
// We join with users table to see WHO paid
router.get("/all", async (req, res) => {
  try {
    const allRecords = await pool.query(
      `SELECT f.*, u.full_name, u.player_id 
       FROM finance_records f 
       LEFT JOIN users u ON f.user_id = u.user_id 
       ORDER BY f.payment_date DESC`
    );
    res.json(allRecords.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 3. GET MY TRANSACTIONS (Player View)
router.get("/my/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const myRecords = await pool.query(
      "SELECT * FROM finance_records WHERE user_id = $1 ORDER BY payment_date DESC",
      [userId]
    );
    res.json(myRecords.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 4. UPDATE REIMBURSEMENT AMOUNT (Admin Only)
router.put("/reimburse/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body; // Admin sends the specific amount (e.g., 200)

    const update = await pool.query(
      "UPDATE finance_records SET reimbursed_amount = $1 WHERE record_id = $2 RETURNING *",
      [amount, id]
    );

    res.json(update.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;