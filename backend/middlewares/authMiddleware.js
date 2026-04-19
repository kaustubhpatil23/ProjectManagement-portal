const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_key";

exports.verifyToken = (req, res, next) => {
  // Get token from header: "Bearer <token>"
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(403).json({ error: "Access denied. No token provided." });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified; // Attach user payload {id, role} to request object
    next(); // Proceed to the next middleware or route
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token." });
  }
};
