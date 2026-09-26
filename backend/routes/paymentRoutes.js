const express = require("express");
const router = express.Router();
const {
  getDealPaymentSummary,
  processPayment,
  getPayments,
} = require("../controllers/paymentController");
const { protect } = require("../middleware/auth");

router.get("/deal-summary/:dealId", protect, getDealPaymentSummary);
router.post("/process", protect, processPayment);
router.get("/", protect, getPayments);

module.exports = router;
