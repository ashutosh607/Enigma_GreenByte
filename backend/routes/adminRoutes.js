const express = require("express");
const router = express.Router();
const {
  getAdminOverview,
  getNegotiationsAudit,
  updateCommissionConfig,
  verifyCompany,
} = require("../controllers/adminController");
const { protect } = require("../middleware/auth");

router.get("/overview", protect, getAdminOverview);
router.get("/negotiations", protect, getNegotiationsAudit);
router.put("/commission-config", protect, updateCommissionConfig);
router.patch("/companies/:id/verify", protect, verifyCompany);

module.exports = router;
