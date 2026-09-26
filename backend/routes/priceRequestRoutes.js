const express = require("express");
const router = express.Router();
const {
  submitPriceRequest,
  acceptPriceRequest,
  counterPriceRequest,
  buyerAcceptCounter,
  rejectPriceRequest,
  getPriceRequests,
} = require("../controllers/priceRequestController");
const { protect } = require("../middleware/auth");

router.post("/", protect, submitPriceRequest);
router.get("/", protect, getPriceRequests);
router.post("/:id/accept", protect, acceptPriceRequest);
router.post("/:id/counter", protect, counterPriceRequest);
router.post("/:id/buyer-accept", protect, buyerAcceptCounter);
router.post("/:id/reject", protect, rejectPriceRequest);

module.exports = router;
