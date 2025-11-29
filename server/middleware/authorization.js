const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = async (req, res, next) => {
  try {
    // 1. Get the token from the header
    // The frontend must send it as a header called "token"
    const jwtToken = req.header("token");

    if (!jwtToken) {
      return res.status(403).json("Not Authorized: No Token Provided");
    }

    // 2. Check if the token is real (Verify signature)
    const payload = jwt.verify(jwtToken, process.env.JWT_SECRET);

    // 3. Attach the user info to the request (so routes can use it)
    req.user = payload.user;

    // 4. Let them pass!
    next();
    
  } catch (err) {
    console.error(err.message);
    return res.status(403).json("Not Authorized: Invalid Token");
  }
};