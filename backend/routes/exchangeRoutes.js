const express = require("express");
const router = express.Router();
const {
  getExchangeByDealId,
  markDispatched,
  confirmDelivery,
  confirmQuality,
} = require("../controllers/exchangeController");
const { protect } = require("../middleware/auth");

router.get("/:dealId", protect, getExchangeByDealId);
router.post("/:dealId/dispatch", protect, markDispatched);
router.post("/:dealId/delivery", protect, confirmDelivery);
router.post("/:dealId/quality", protect, confirmQuality);

module.exports = router;
