const cron = require("node-cron");
const pool = require("./db");

const startCronJobs = () => {
  // Schedule: 0 0 1 6 * (At 00:00 on Day-of-Month 1 in June)
  cron.schedule("0 0 1 6 *", async () => {
    console.log("📅 Running Annual Academic Promotion Task...");

    try {
      // 1. Promote 1st, 2nd, 3rd Years
      // We do this in reverse order (3->4, 2->3, 1->2) to avoid double-promoting if we ran multiple queries
      // Actually, a single SQL UPDATE handles this safely in one go.
      
      // A. Move 4th Years to Alumni
      await pool.query(`
        UPDATE users 
        SET status = 'alumni', leaving_date = CURRENT_DATE 
        WHERE year_of_study = 4 AND status = 'active'
      `);

      // B. Promote Everyone Else (1->2, 2->3, 3->4)
      await pool.query(`
        UPDATE users 
        SET year_of_study = year_of_study + 1 
        WHERE year_of_study < 4 AND status = 'active'
      `);

      console.log("✅ Academic Promotion Complete.");
    } catch (err) {
      console.error("❌ Cron Job Failed:", err.message);
    }
  });
};

module.exports = startCronJobs;