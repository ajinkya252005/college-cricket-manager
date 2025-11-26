const router = require("express").Router();
const pool = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER ROUTE
router.post("/register", async (req, res) => {
  try {
    // 1. Destructure the req.body (name, password, etc.)
    const { player_id, password, full_name, branch, year_of_study, joining_year } = req.body;

    // 2. Check if user exists (if yes, throw error)
    const user = await pool.query("SELECT * FROM users WHERE player_id = $1", [
      player_id,
    ]);

    if (user.rows.length > 0) {
      return res.status(401).json("User already exists!");
    }

    // 3. Bcrypt the user password
    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound);
    const bcryptPassword = await bcrypt.hash(password, salt);

    // 4. Enter the new user inside our database
    const newUser = await pool.query(
      "INSERT INTO users (player_id, password_hash, full_name, branch, year_of_study, joining_year) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [player_id, bcryptPassword, full_name, branch, year_of_study, joining_year]
    );

    // 5. Generate the JWT Token
    const token = jwt.sign({ user: newUser.rows[0].user_id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // 6. Respond with the token
    res.json({ token, user: newUser.rows[0] });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// LOGIN ROUTE
router.post("/login", async (req, res) => {
  try {
    // 1. Destructure the req.body
    const { player_id, password } = req.body;

    // 2. Check if user exists (if not, throw error)
    const user = await pool.query("SELECT * FROM users WHERE player_id = $1", [
      player_id,
    ]);

    if (user.rows.length === 0) {
      return res.status(401).json("Password or Email is incorrect");
    }

    // 3. Check if incoming password is the same as the database password
    const validPassword = await bcrypt.compare(
      password,
      user.rows[0].password_hash
    );

    if (!validPassword) {
      return res.status(401).json("Password or Email is incorrect");
    }

    // 4. Give them the token
    const token = jwt.sign({ user: user.rows[0].user_id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ token, user: user.rows[0] });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// VERIFY ROUTE (Get User Data)
router.get("/verify", async (req, res) => {
  try {
    // 1. Get the token from the header
    const token = req.header("token");

    if (!token) {
      return res.status(403).json("Not Authorized");
    }

    // 2. Verify the token
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // 3. If valid, return the user info
    const user = await pool.query(
  "SELECT user_id, player_id, full_name, role, branch, total_matches, total_runs, total_wickets FROM users WHERE user_id = $1", 
  [payload.user]
);

    res.json(user.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(403).json("Not Authorized");
  }
});

module.exports = router;