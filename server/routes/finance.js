const router = require("express").Router();
const pool = require("../db");
const authorize = require("../middleware/authorization");

// --- GETTERS ---

// 1. GET PENDING PRACTICE SESSIONS
router.get("/pending-practice", async (req, res) => {
  try {
    const sessions = await pool.query(`
      SELECT ae.*, 
      (SELECT COUNT(*) FROM attendance_logs al WHERE al.event_id = ae.event_id AND al.status = 'present') as present_count
      FROM attendance_events ae 
      WHERE ae.event_type != 'Match Day' 
      AND NOT EXISTS (SELECT 1 FROM finance_records fr WHERE fr.related_event_id = ae.event_id)
      ORDER BY ae.date DESC
    `);
    res.json(sessions.rows);
  } catch (err) { console.error(err); res.status(500).send("Server Error"); }
});

// 2. GET PENDING TOURNAMENTS
router.get("/pending-tournaments", async (req, res) => {
  try {
    const tournaments = await pool.query(`
      SELECT * FROM tournaments t
      WHERE NOT EXISTS (SELECT 1 FROM finance_records fr WHERE fr.related_tournament_id = t.tournament_id)
      ORDER BY start_date DESC
    `);
    res.json(tournaments.rows);
  } catch (err) { console.error(err); res.status(500).send("Server Error"); }
});

// 3. GET LEDGER DATA (Grouped by Category + Fixed Tournament Names)
router.get("/ledger", async (req, res) => {
  try {
    const practice = await pool.query(`
        SELECT DISTINCT ON (related_event_id) 
            related_event_id, description, amount, billing_date as payment_date, 
            (SELECT json_agg(json_build_object('name', u.full_name, 'amount', fr.amount, 'reimbursed', fr.reimbursed_amount, 'id', fr.record_id)) 
             FROM finance_records fr JOIN users u ON fr.user_id = u.user_id WHERE fr.related_event_id = f.related_event_id) as players
        FROM finance_records f WHERE related_event_id IS NOT NULL ORDER BY related_event_id, billing_date DESC
    `);

    // 👇 FIXED QUERY: Added JOIN to fetch Tournament Name 👇
    const tournament = await pool.query(`
        SELECT DISTINCT ON (f.related_tournament_id) 
            f.related_tournament_id, 
            t.name as tournament_name, -- <--- Fetch Name
            f.description, 
            f.amount, 
            f.billing_date as payment_date,
            (SELECT json_agg(json_build_object('name', u.full_name, 'amount', fr.amount, 'reimbursed', fr.reimbursed_amount, 'id', fr.record_id)) 
             FROM finance_records fr JOIN users u ON fr.user_id = u.user_id WHERE fr.related_tournament_id = f.related_tournament_id) as players
        FROM finance_records f 
        JOIN tournaments t ON f.related_tournament_id = t.tournament_id -- <--- Added Join
        WHERE f.related_tournament_id IS NOT NULL 
        ORDER BY f.related_tournament_id, f.billing_date DESC
    `);

    const other = await pool.query(`
        SELECT description, amount, billing_date as payment_date, 
        json_agg(json_build_object('name', u.full_name, 'amount', f.amount, 'reimbursed', f.reimbursed_amount, 'id', f.record_id)) as players
        FROM finance_records f JOIN users u ON f.user_id = u.user_id 
        WHERE related_event_id IS NULL AND related_tournament_id IS NULL AND type != 'fund_adjustment'
        GROUP BY description, amount, billing_date ORDER BY billing_date DESC
    `);

    res.json({ practice: practice.rows, tournament: tournament.rows, other: other.rows });
  } catch (err) { console.error(err); res.status(500).send("Server Error"); }
});

// --- BILLING ACTIONS (Updated to accept 'date') ---

// 4. BILL PRACTICE SESSION
router.post("/bill/practice", authorize, async (req, res) => {
  const client = await pool.connect();
  try {
    const { event_id, per_head_amount, description, date } = req.body; // <--- NEW DATE INPUT
    await client.query("BEGIN");

    const attendees = await client.query("SELECT user_id FROM attendance_logs WHERE event_id = $1 AND status = 'present'", [event_id]);
    
    for (const p of attendees.rows) {
        await client.query(
            "INSERT INTO finance_records (user_id, amount, type, description, status, related_event_id, billing_date) VALUES ($1, $2, 'payment_in', $3, 'pending', $4, $5)",
            [p.user_id, per_head_amount, description, event_id, date]
        );
    }
    await client.query("COMMIT");
    res.json("Billed Successfully");
  } catch (err) { await client.query("ROLLBACK"); console.error(err); res.status(500).send("Error"); } finally { client.release(); }
});

// 5. BILL TOURNAMENT / GENERAL
router.post("/bill/general", authorize, async (req, res) => {
  const client = await pool.connect();
  try {
    const { tournament_id, per_head_amount, description, custom_user_ids, date } = req.body; // <--- NEW DATE INPUT
    await client.query("BEGIN");

    let targetUsers = [];
    if(custom_user_ids && custom_user_ids.length > 0) {
        targetUsers = custom_user_ids.map(id => ({ user_id: id }));
    } else {
        const res = await client.query("SELECT user_id FROM users WHERE status = 'active'");
        targetUsers = res.rows;
    }

    for (const p of targetUsers) {
        await client.query(
            "INSERT INTO finance_records (user_id, amount, type, description, status, related_tournament_id, billing_date) VALUES ($1, $2, 'payment_in', $3, 'pending', $4, $5)",
            [p.user_id, per_head_amount, description, tournament_id || null, date]
        );
    }
    await client.query("COMMIT");
    res.json("Billed Successfully");
  } catch (err) { await client.query("ROLLBACK"); console.error(err); res.status(500).send("Error"); } finally { client.release(); }
});

// 6. MANUAL ADD (For Ledger Tab)
router.post("/add", authorize, async (req, res) => {
  try {
    const { user_id, amount, type, description, date } = req.body; // <--- NEW DATE INPUT
    
    const newRecord = await pool.query(
      "INSERT INTO finance_records (user_id, amount, type, description, billing_date) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [user_id || null, amount, type, description, date]
    );

    res.json(newRecord.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 7. GET MY FINANCIALS (Player View - Categorized Support)
router.get("/my/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    const records = await pool.query(`
      SELECT 
        f.record_id,
        f.amount,
        f.reimbursed_amount,
        f.status,
        f.type,
        f.related_event_id,        -- <--- ADD THIS
        f.related_tournament_id,   -- <--- ADD THIS
        f.billing_date as final_date,
        COALESCE(t.name, CONCAT(ae.event_type, ' (', ae.description, ')'), f.description) as description
      FROM finance_records f
      LEFT JOIN tournaments t ON f.related_tournament_id = t.tournament_id
      LEFT JOIN attendance_events ae ON f.related_event_id = ae.event_id
      WHERE f.user_id = $1
      ORDER BY final_date DESC
    `, [userId]);

    res.json(records.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
// 8. UPDATE REIMBURSEMENT
router.put("/reimburse/:id", authorize, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    await pool.query("UPDATE finance_records SET reimbursed_amount = $1 WHERE record_id = $2", [amount, id]);
    res.json("Updated");
  } catch (err) { console.error(err); res.status(500).send("Error"); }
});

// 9. GET FUNDS
router.get("/funds", async (req, res) => {
  try {
    const funds = await pool.query("SELECT balance FROM team_funds WHERE id = 1");
    res.json(funds.rows[0]);
  } catch (err) { console.error(err); res.status(500).send("Server Error"); }
});

// 10. UPDATE FUNDS (Manual Balance Adjustment - No History Log)
router.post("/funds/update", authorize, async (req, res) => {
  try {
    const { amount, type } = req.body; 
    // type: 'add' or 'subtract'

    if (type === 'add') {
        await pool.query("UPDATE team_funds SET balance = balance + $1 WHERE id = 1", [amount]);
    } else {
        await pool.query("UPDATE team_funds SET balance = balance - $1 WHERE id = 1", [amount]);
    }

    res.json({ message: "Funds Updated Successfully" });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
module.exports = router;