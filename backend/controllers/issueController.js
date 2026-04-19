const db = require("../config/db");

exports.createIssue = async (req, res) => {
  const { project_id, checker_id, description, criticality } = req.body;
  const maker_id = req.user.id; // From auth middleware
  const ticket_number = `TKT-${Date.now()}`;

  try {
    const [result] = await db.promise().query(
      `INSERT INTO issues (ticket_number, project_id, maker_id, checker_id, description, criticality) 
             VALUES (?, ?, ?, ?, ?, ?)`,
      [
        ticket_number,
        project_id,
        maker_id,
        checker_id,
        description,
        criticality,
      ]
    );

    const issueId = result.insertId;

    // Handle Attachments
    if (req.files && req.files.length > 0) {
      const attachmentQueries = req.files.map((file) => {
        return db
          .promise()
          .query(
            `INSERT INTO attachments (issue_id, file_name, file_path) VALUES (?, ?, ?)`,
            [issueId, file.originalname, file.path]
          );
      });
      await Promise.all(attachmentQueries);
    }

    res
      .status(201)
      .json({ message: "Issue created successfully", ticket_number });
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
};

// exports.updateIssueStatus = async (req, res) => {
//   const { id } = req.params;
//   const { status } = req.body; // Checker sends "Resolved", Maker sends "Closed"

//   try {
//     await db
//       .promise()
//       .query(`UPDATE issues SET status = ? WHERE id = ?`, [status, id]);
//     res.json({ message: `Issue marked as ${status}` });
//   } catch (error) {
//     res.status(500).json({ error: "Database error" });
//   }
// };

exports.updateIssueStatus = async (req, res) => {
  const { id } = req.params;
  const { status, checker_comment } = req.body;
  const role = req.user.role; // From verifyToken middleware

  try {
    if (role === "Checker") {
      // Enforce comment rule for Checkers
      if (
        status === "Resolved" &&
        (!checker_comment || checker_comment.trim() === "")
      ) {
        return res.status(400).json({
          error: "A comment is required to mark an issue as Resolved.",
        });
      }
      await db
        .promise()
        .query(
          `UPDATE issues SET status = ?, checker_comment = ? WHERE id = ?`,
          [status, checker_comment, id]
        );
    } else if (role === "Maker") {
      await db
        .promise()
        .query(`UPDATE issues SET status = ? WHERE id = ?`, [status, id]);
    }
    res.json({ message: `Issue marked as ${status}` });
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
};

// Add this function to fetch attachments for the modal
exports.getIssueAttachments = async (req, res) => {
  try {
    const [files] = await db
      .promise()
      .query("SELECT * FROM attachments WHERE issue_id = ?", [req.params.id]);
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch attachments" });
  }
};

// Fetch projects mapped to the specific user
exports.getMakerProjects = async (req, res) => {
  try {
    const [projects] = await db.promise().query(
      `SELECT p.id, p.name FROM projects p 
             JOIN user_projects up ON p.id = up.project_id 
             WHERE up.user_id = ?`,
      [req.user.id]
    );
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch mapped projects" });
  }
};

// Fetch issues for a specific project raised by this Maker
exports.getMakerIssues = async (req, res) => {
  const { projectId } = req.params;
  try {
    const [issues] = await db
      .promise()
      .query(
        `SELECT * FROM issues WHERE maker_id = ? AND project_id = ? ORDER BY created_at DESC`,
        [req.user.id, projectId]
      );
    res.json(issues);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch issues" });
  }
};

// Fetch all users with the 'Checker' role
exports.getCheckers = async (req, res) => {
  try {
    const [checkers] = await db
      .promise()
      .query('SELECT id, name FROM users WHERE role = "Checker"');
    res.json(checkers);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch checkers" });
  }
};
