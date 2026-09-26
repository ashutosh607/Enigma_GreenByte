const express = require("express");
const router = express.Router();
const {
  initiateDeal,
  getDeals,
  getDealById,
  advanceDealStatus,
  advanceDealDispatch,
} = require("../controllers/dealController");
const { protect } = require("../middleware/auth");

router.post("/initiate", protect, initiateDeal);
router.get("/", protect, getDeals);
router.get("/:id", protect, getDealById);
router.patch("/:id/advance-status", protect, advanceDealStatus);
router.patch("/:id/advance-dispatch", protect, advanceDealDispatch);

module.exports = router;
