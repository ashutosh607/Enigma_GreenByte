const express = require("express");
const router = express.Router();
const {
  getDealPaymentSummary,
  processPayment,
  getPayments,
  instantPurchase,
} = require("../controllers/paymentController");
const { protect } = require("../middleware/auth");

router.get("/deal-summary/:dealId", protect, getDealPaymentSummary);
router.post("/process", protect, processPayment);
router.post("/instant-purchase", protect, instantPurchase);
router.get("/", protect, getPayments);

module.exports = router;
