const db = require("../config/db");
const bcrypt = require("bcryptjs");

exports.createUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db
      .promise()
      .query(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        [name, email, hashedPassword, role]
      );
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to create user" });
  }
};

exports.createProject = async (req, res) => {
  const { name, description } = req.body;
  try {
    await db
      .promise()
      .query("INSERT INTO projects (name, description) VALUES (?, ?)", [
        name,
        description,
      ]);
    res.status(201).json({ message: "Project created successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to create project" });
  }
};

exports.mapUserToProject = async (req, res) => {
  const { user_id, project_id } = req.body;
  try {
    await db
      .promise()
      .query(
        "INSERT IGNORE INTO user_projects (user_id, project_id) VALUES (?, ?)",
        [user_id, project_id]
      );
    res.json({ message: "User mapped to project" });
  } catch (err) {
    res.status(500).json({ error: "Mapping failed" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    // We only pull id, name, and role. We don't need to send passwords to the frontend!
    const [users] = await db
      .promise()
      .query("SELECT id, name, role FROM users");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

exports.getAllProjects = async (req, res) => {
  try {
    const [projects] = await db
      .promise()
      .query("SELECT id, name FROM projects");
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
};

exports.getAllIssuesForAdmin = async (req, res) => {
  try {
    const [issues] = await db.promise().query("SELECT * FROM issues");
    res.json(issues);
  } catch (err) {
    res.status(500).json({ error: "Error" });
  }
};

exports.deleteIssue = async (req, res) => {
  try {
    await db
      .promise()
      .query("DELETE FROM issues WHERE id = ?", [req.params.id]);
    res.json({ message: "Ticket cleared" });
  } catch (err) {
    res.status(500).json({ error: "Error" });
  }
};

// Fetch all issues across all projects for the Admin
exports.getAllIssuesForAdmin = async (req, res) => {
  try {
    const [issues] = await db
      .promise()
      .query("SELECT * FROM issues ORDER BY created_at DESC");
    res.json(issues);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch issues" });
  }
};

// Delete a single ticket (One by One)
exports.deleteIssue = async (req, res) => {
  try {
    await db
      .promise()
      .query("DELETE FROM issues WHERE id = ?", [req.params.id]);
    res.json({ message: "Ticket deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete ticket" });
  }
};

// Delete ALL tickets
exports.deleteAllIssues = async (req, res) => {
  try {
    // DELETE FROM issues removes all rows but keeps the table structure intact
    await db.promise().query("DELETE FROM issues");
    res.json({ message: "All tickets have been cleared from the database" });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear dashboard" });
  }
};
