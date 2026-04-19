// backend/seedAdmin.js
const db = require("./config/db");
const bcrypt = require("bcryptjs");

const createFirstAdmin = async () => {
  const name = "Super Admin";
  const email = "admin@portal.com";
  const password = "password123"; // Change this!
  const role = "Admin";

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await db
      .promise()
      .query(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        [name, email, hashedPassword, role]
      );

    console.log("✅ First Admin created successfully!");
    console.log(`Email: ${email} | Password: ${password}`);
    process.exit();
  } catch (err) {
    console.error("❌ Error creating admin:", err.message);
    process.exit(1);
  }
};

createFirstAdmin();
