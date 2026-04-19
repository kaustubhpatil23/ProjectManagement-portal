const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Secret key should be in your .env file
const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_key";

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await db
      .promise()
      .query("SELECT * FROM users WHERE email = ?", [email]);
    const user = users[0];

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Compare hashed password (assuming passwords are hashed when Admins create users)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate Token with user ID and Role
    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "8h" } // Token expires in 8 hours
    );

    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ error: "Database error during login" });
  }
};
