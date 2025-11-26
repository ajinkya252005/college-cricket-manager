const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db"); // Import the connection we just made

// Middleware
app.use(cors());
app.use(express.json()); // Allows us to access req.body

// ----------------- ROUTES ----------------- //
app.use("/api/auth", require("./routes/auth"));
app.use("/api/tournaments", require("./routes/tournaments"));
app.use("/api/players", require("./routes/players"));
app.use("/api/matches", require("./routes/matches"));
// 1. Test Route (To check if server is running)
app.get("/", (req, res) => {
  res.send("Server is running correctly!");
});

// 2. Database Connection Test
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()"); // Simple SQL query
    res.json({ message: "Database Connected!", time: result.rows[0].now });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Database Connection Failed");
  }
});

// ------------------------------------------ //

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server has started on port ${PORT}`);
});