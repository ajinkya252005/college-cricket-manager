const router = require("express").Router();
const pool = require("../db");
const authorize = require("../middleware/authorization");

// --- GETTERS FOR UI ---

// 1. GET PENDING PRACTICE SESSIONS (Not yet billed)
router.get("/pending-practice", async (req, res) => {
  try {
    // Fetch sessions that don't have a finance record linked to them yet
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

// 2. GET PENDING TOURNAMENTS (Not yet billed)
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

// 3. GET LEDGER DATA (Grouped by Category)
router.get("/ledger", async (req, res) => {
  try {
    const practice = await pool.query(`
        SELECT DISTINCT ON (related_event_id) 
            related_event_id, description, amount, payment_date, 
            (SELECT json_agg(json_build_object('name', u.full_name, 'amount', fr.amount, 'reimbursed', fr.reimbursed_amount, 'id', fr.record_id)) 
             FROM finance_records fr JOIN users u ON fr.user_id = u.user_id WHERE fr.related_event_id = f.related_event_id) as players
        FROM finance_records f WHERE related_event_id IS NOT NULL ORDER BY related_event_id, payment_date DESC
    `);

    // Updated Tournament Query (Joins with Tournaments table)
    const tournament = await pool.query(`
        SELECT DISTINCT ON (f.related_tournament_id) 
            f.related_tournament_id, 
            t.name as tournament_name,  -- Fetch Real Name
            t.start_date,               -- Fetch Start Date
            f.description, 
            f.amount, 
            f.payment_date,
            (SELECT json_agg(json_build_object('name', u.full_name, 'amount', fr.amount, 'reimbursed', fr.reimbursed_amount, 'id', fr.record_id)) 
             FROM finance_records fr JOIN users u ON fr.user_id = u.user_id WHERE fr.related_tournament_id = f.related_tournament_id) as players
        FROM finance_records f 
        JOIN tournaments t ON f.related_tournament_id = t.tournament_id -- The JOIN
        WHERE f.related_tournament_id IS NOT NULL 
        ORDER BY f.related_tournament_id, f.payment_date DESC
    `);

    const other = await pool.query(`
        SELECT description, amount, payment_date, 
        json_agg(json_build_object('name', u.full_name, 'amount', f.amount, 'reimbursed', f.reimbursed_amount, 'id', f.record_id)) as players
        FROM finance_records f JOIN users u ON f.user_id = u.user_id 
        WHERE related_event_id IS NULL AND related_tournament_id IS NULL 
        GROUP BY description, amount, payment_date ORDER BY payment_date DESC
    `);

    res.json({ practice: practice.rows, tournament: tournament.rows, other: other.rows });
  } catch (err) { console.error(err); res.status(500).send("Server Error"); }
});

// --- BILLING ACTIONS ---

// 4. BILL PRACTICE SESSION
router.post("/bill/practice", authorize, async (req, res) => {
  const client = await pool.connect();
  try {
    const { event_id, per_head_amount, description } = req.body;
    await client.query("BEGIN");

    // Get Attendees
    const attendees = await client.query("SELECT user_id FROM attendance_logs WHERE event_id = $1 AND status = 'present'", [event_id]);
    
    for (const p of attendees.rows) {
        await client.query(
            "INSERT INTO finance_records (user_id, amount, type, description, status, related_event_id) VALUES ($1, $2, 'payment_in', $3, 'pending', $4)",
            [p.user_id, per_head_amount, description, event_id]
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
    const { tournament_id, per_head_amount, description, custom_user_ids } = req.body;
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
            "INSERT INTO finance_records (user_id, amount, type, description, status, related_tournament_id) VALUES ($1, $2, 'payment_in', $3, 'pending', $4)",
            [p.user_id, per_head_amount, description, tournament_id || null]
        );
    }
    await client.query("COMMIT");
    res.json("Billed Successfully");
  } catch (err) { await client.query("ROLLBACK"); console.error(err); res.status(500).send("Error"); } finally { client.release(); }
});

// 6. UPDATE REIMBURSEMENT
router.put("/reimburse/:id", authorize, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    await pool.query("UPDATE finance_records SET reimbursed_amount = $1 WHERE record_id = $2", [amount, id]);
    res.json("Updated");
  } catch (err) { console.error(err); res.status(500).send("Error"); }
});

module.exports = router;