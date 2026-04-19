const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { verifyToken } = require("../middlewares/authMiddleware");
const { requireRole } = require("../middlewares/roleMiddleware");

// Protect all admin routes
router.use(verifyToken, requireRole("Admin"));

router.post("/users", adminController.createUser);
router.post("/projects", adminController.createProject);
router.post("/map", adminController.mapUserToProject);

router.get("/users", adminController.getAllUsers);
router.get("/projects", adminController.getAllProjects);
router.get("/issues", adminController.getAllIssuesForAdmin);
router.delete("/issues/:id", adminController.deleteIssue);

// Add these to your Admin routes
router.get("/issues", adminController.getAllIssuesForAdmin);
router.delete("/issues/:id", adminController.deleteIssue); // One by one
router.delete("/issues", adminController.deleteAllIssues); // Clear all
module.exports = router;
