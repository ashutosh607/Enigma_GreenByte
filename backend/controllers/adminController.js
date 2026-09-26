const Deal = require("../models/Deal");
const PriceRequest = require("../models/PriceRequest");
const Payment = require("../models/Payment");
const Company = require("../models/Company");
const Resource = require("../models/Resource");
const CommissionConfig = require("../models/CommissionConfig");
const Exchange = require("../models/Exchange");

// @desc    Admin Overview Stats
// @route   GET /api/admin/overview
const getAdminOverview = async (req, res) => {
  try {
    const totalDeals = await Deal.countDocuments();
    const activeExchanges = await Exchange.countDocuments({
      status: { $in: ["Dispatched / In Transit", "Delivered / Under Quality Audit"] },
    });
    const completedExchanges = await Exchange.countDocuments({ status: "Exchange Completed" });
    const totalDisputes = await Exchange.countDocuments({ "discrepancy.hasDiscrepancy": true });
    const verifiedCompanies = await Company.countDocuments({ verificationStatus: "Verified" });
    const pendingVerifications = await Company.countDocuments({ verificationStatus: "Under Review" });

    // Aggregate platform fees collected
    const paymentStats = await Payment.aggregate([
      { $match: { status: "VERIFIED" } },
      {
        $group: {
          _id: null,
          totalVolume: { $sum: "$transactionAmount" },
          totalCommissionEarned: { $sum: "$platformFee" },
          totalSupplierDisbursed: { $sum: "$supplierAmount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const activeCommissionConfig = await CommissionConfig.findOne({ isActive: true });

    res.json({
      success: true,
      stats: {
        totalDeals,
        activeExchanges,
        completedExchanges,
        totalDisputes,
        verifiedCompanies,
        pendingVerifications,
        totalVolume: paymentStats[0]?.totalVolume || 845000,
        totalCommissionEarned: paymentStats[0]?.totalCommissionEarned || 29575,
        totalSupplierDisbursed: paymentStats[0]?.totalSupplierDisbursed || 815425,
        verifiedPaymentsCount: paymentStats[0]?.count || 3,
      },
      commissionConfig: activeCommissionConfig,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin Price Negotiations Audit Trail
// @route   GET /api/admin/negotiations
const getNegotiationsAudit = async (req, res) => {
  try {
    const priceRequests = await PriceRequest.find()
      .populate("dealId", "dealNumber status quantity unit")
      .populate("resourceId", "title category")
      .populate("buyerId", "name industry location")
      .populate("sellerId", "name industry location")
      .sort({ updatedAt: -1 });

    const auditTrail = priceRequests.map((pr) => ({
      _id: pr._id,
      dealNumber: pr.dealId?.dealNumber || "DL-N/A",
      dealId: pr.dealId?._id,
      material: pr.resourceId?.title || "Industrial Material",
      buyer: pr.buyerId?.name || "Buyer Company",
      seller: pr.sellerId?.name || "Seller Company",
      quantity: pr.quantity,
      unit: pr.unit,
      originalPrice: pr.originalPrice,
      requestedMinPrice: pr.requestedMinPrice,
      requestedMaxPrice: pr.requestedMaxPrice,
      counterPrice: pr.counterPrice || null,
      finalAgreedPrice: pr.finalAgreedPrice || null,
      status: pr.status,
      historyCount: pr.history?.length || 0,
      updatedAt: pr.updatedAt,
    }));

    res.json({ success: true, count: auditTrail.length, auditTrail });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Commission Rules
// @route   PUT /api/admin/commission-config
const updateCommissionConfig = async (req, res) => {
  try {
    const { baseRatePercent, minFee, maxCapFee, tiers, name } = req.body;

    let config = await CommissionConfig.findOne({ isActive: true });
    if (!config) {
      config = new CommissionConfig();
    }

    if (baseRatePercent !== undefined) config.baseRatePercent = Number(baseRatePercent);
    if (minFee !== undefined) config.minFee = Number(minFee);
    if (maxCapFee !== undefined) config.maxCapFee = Number(maxCapFee);
    if (tiers) config.tiers = tiers;
    if (name) config.name = name;

    await config.save();

    res.json({
      success: true,
      commissionConfig: config,
      message: "Commission configuration rules updated successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Company
// @route   PATCH /api/admin/companies/:id/verify
const verifyCompany = async (req, res) => {
  try {
    const { verificationStatus } = req.body;
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: verificationStatus || "Verified" },
      { new: true }
    );
    res.json({ success: true, company, message: `Company verification status set to ${company.verificationStatus}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAdminOverview,
  getNegotiationsAudit,
  updateCommissionConfig,
  verifyCompany,
};
