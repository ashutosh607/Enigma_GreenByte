const express = require("express");
const router = express.Router();
const {
  submitAndMatch,
  getOpportunities,
  getOpportunityById,
} = require("../controllers/discoveryController");
const { protect, requireAuth } = require("../middleware/auth");

router.post("/match", protect, requireAuth, submitAndMatch);
router.get("/opportunities", protect, requireAuth, getOpportunities);
router.get("/opportunities/:id", protect, requireAuth, getOpportunityById);

module.exports = router;
