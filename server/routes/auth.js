const router = require("express").Router();
const pool = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER ROUTE (Time-Aware)
router.post("/register", async (req, res) => {
  try {
    const { 
        player_id, password, 
        first_name, middle_name, last_name, 
        branch, year_of_study, 
        joining_month, joining_year,
        birth_date 
    } = req.body;

    const user = await pool.query("SELECT * FROM users WHERE player_id = $1", [player_id]);
    if (user.rows.length > 0) return res.status(401).json("User already exists!");

    const salt = await bcrypt.genSalt(10);
    const bcryptPassword = await bcrypt.hash(password, salt);
    const full_name = `${first_name} ${middle_name ? middle_name + ' ' : ''}${last_name}`;

    // --- DATE CONSTRUCTION LOGIC ---
    const monthMap = {
        "January": "01", "February": "02", "March": "03", "April": "04", "May": "05", "June": "06",
        "July": "07", "August": "08", "September": "09", "October": "10", "November": "11", "December": "12"
    };
    // Default to 1st of that month
    const joining_date = `${joining_year}-${monthMap[joining_month]}-01`;

    const newUser = await pool.query(
      `INSERT INTO users (
          player_id, password_hash, full_name, 
          first_name, middle_name, last_name,
          branch, year_of_study, 
          joining_month, joining_year, birth_date,
          joining_date, status  -- <--- Added joining_date and explicit status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'pending') RETURNING *`,
      [
          player_id, bcryptPassword, full_name,
          first_name, middle_name, last_name,
          branch, year_of_study,
          joining_month, joining_year, birth_date,
          joining_date
      ]
    );

    const token = jwt.sign({ user: newUser.rows[0].user_id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, user: newUser.rows[0] });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// LOGIN ROUTE
// LOGIN ROUTE
router.post("/login", async (req, res) => {
  try {
    const { player_id, password } = req.body;

    // 1. Check if user exists
    const user = await pool.query("SELECT * FROM users WHERE player_id = $1", [
      player_id,
    ]);

    if (user.rows.length === 0) {
      return res.status(401).json("Password or Email is incorrect");
    }

    // 2. Check Password
    const validPassword = await bcrypt.compare(
      password,
      user.rows[0].password_hash
    );

    if (!validPassword) {
      return res.status(401).json("Password or Email is incorrect");
    }

    // --- NEW CHECK: BLOCK PENDING USERS ---
    if (user.rows[0].status === 'pending') {
        return res.status(403).json("Account is pending Admin approval. Please contact your captain.");
    }
    // --------------------------------------

    // 3. Issue Token
    const token = jwt.sign({ user: user.rows[0].user_id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ token, user: user.rows[0] });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// auth.js
router.post("/team-login", async (req, res) => {
  try {
    const { player_id, password } = req.body;
    const user = await pool.query("SELECT * FROM users WHERE player_id = $1", [player_id]);

    if (user.rows.length === 0) {
      return res.status(401).json("Password or Player ID is incorrect");
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!validPassword) {
      return res.status(401).json("Password or Player ID is incorrect");
    }

    // FIX: Explicitly set role to "team" in the token
    const token = jwt.sign(
      { user: user.rows[0].user_id, role: "team" }, 
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, user: user.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});


// VERIFY ROUTE (Get User Data)
router.get("/verify", async (req, res) => {
  try {
    const token = req.header("token");
    if (!token) return res.status(403).json("Not Authorized");

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Recognise either Admin or Team roles from the token
    if (payload.role === "admin" || payload.role === "team") {
      return res.json({ 
        role: payload.role, 
        user_id: payload.user 
      });
    }

    // Default player check...
    const user = await pool.query("SELECT * FROM users WHERE user_id = $1", [payload.user]);

    if (user.rows.length === 0) {
        return res.status(403).json("User not found");
    }

    res.json(user.rows[0]);
  } catch (err) {
    console.error("Verify Error:", err.message);
    res.status(403).json("Not Authorized");
  }
});

module.exports = router;