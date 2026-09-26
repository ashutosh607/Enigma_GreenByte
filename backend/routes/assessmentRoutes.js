const express = require("express");
const router = express.Router();
const {
  getAssessment,
  updateBlocker,
  updateSampleStatus,
} = require("../controllers/assessmentController");
const { protect } = require("../middleware/auth");

router.get("/:id", protect, getAssessment);
router.patch("/:id/blockers/:blockerIndex", protect, updateBlocker);
router.patch("/:id/sample-status", protect, updateSampleStatus);

module.exports = router;
