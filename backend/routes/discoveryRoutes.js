const express = require("express");
const router = express.Router();
const {
  submitAndMatch,
  getOpportunities,
  getOpportunityById,
} = require("../controllers/discoveryController");
const { protect } = require("../middleware/auth");

router.post("/match", protect, submitAndMatch);
router.get("/opportunities", protect, getOpportunities);
router.get("/opportunities/:id", protect, getOpportunityById);

module.exports = router;
