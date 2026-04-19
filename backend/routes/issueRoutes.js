const express = require("express");
const router = express.Router();
const issueController = require("../controllers/issueController");
const { verifyToken } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

// Route to create an issue (Maker only)
router.post(
  "/",
  verifyToken,
  upload.array("files", 5),
  issueController.createIssue
);

// Route to update issue status (Checker or Maker)
router.put("/:id/status", verifyToken, issueController.updateIssueStatus);

// Route to get issues assigned to a checker
router.get("/checker", verifyToken, async (req, res) => {
  const db = require("../config/db");
  try {
    const [issues] = await db
      .promise()
      .query("SELECT * FROM issues WHERE checker_id = ?", [req.user.id]);
    res.json(issues);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/maker/projects", verifyToken, issueController.getMakerProjects);
router.get(
  "/maker/issues/:projectId",
  verifyToken,
  issueController.getMakerIssues
);
router.get("/checkers", verifyToken, issueController.getCheckers);
// Add this with the other routes
router.get(
  "/:id/attachments",
  verifyToken,
  issueController.getIssueAttachments
);
module.exports = router;
