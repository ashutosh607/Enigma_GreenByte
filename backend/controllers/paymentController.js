const Payment = require("../models/Payment");
const Deal = require("../models/Deal");
const Notification = require("../models/Notification");
const { calculateCommission } = require("../services/commissionService");

// @desc    Get deal payment summary with dynamic commission calculation
// @route   GET /api/payments/deal-summary/:dealId
const getDealPaymentSummary = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.dealId)
      .populate("resource")
      .populate("buyer", "name industry location")
      .populate("seller", "name industry location");

    if (!deal) {
      return res.status(404).json({ success: false, message: "Deal not found" });
    }

    const price = deal.finalAgreedPrice || deal.currentNegotiatedPrice || deal.originalPrice;
    const materialSubtotal = deal.quantity * price;
    const processingCost = deal.resource?.processingRequired ? deal.quantity * 15 : 0;
    const transportCost = deal.quantity * 10;
    const subtotal = materialSubtotal + processingCost + transportCost;

    const commissionData = await calculateCommission(materialSubtotal);

    const totalPayable = subtotal + commissionData.platformFee;

    res.json({
      success: true,
      dealId: deal._id,
      dealNumber: deal.dealNumber,
      material: deal.resource?.title,
      quantity: deal.quantity,
      unit: deal.unit,
      agreedUnitPrice: price,
      breakdown: {
        materialSubtotal,
        processingCost,
        transportCost,
        subtotal,
        platformFee: commissionData.platformFee,
        commissionRate: commissionData.ratePercent,
        totalPayable,
        supplierReceivable: materialSubtotal - commissionData.platformFee,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Execute and verify payment through backend clearinghouse
// @route   POST /api/payments/process
const processPayment = async (req, res) => {
  try {
    const { dealId, paymentMethod, transactionNotes } = req.body;

    const deal = await Deal.findById(dealId).populate("resource");
    if (!deal) {
      return res.status(404).json({ success: false, message: "Deal not found" });
    }

    const price = deal.finalAgreedPrice || deal.currentNegotiatedPrice || deal.originalPrice;
    const materialSubtotal = deal.quantity * price;
    const processingCost = deal.resource?.processingRequired ? deal.quantity * 15 : 0;
    const transportCost = deal.quantity * 10;
    const subtotal = materialSubtotal + processingCost + transportCost;

    const commissionData = await calculateCommission(materialSubtotal);
    const totalPayable = subtotal + commissionData.platformFee;

    // Create verified payment record
    const payment = await Payment.create({
      dealId: deal._id,
      buyerId: deal.buyer,
      sellerId: deal.seller,
      transactionAmount: totalPayable,
      platformFee: commissionData.platformFee,
      commissionRate: commissionData.ratePercent,
      supplierAmount: materialSubtotal - commissionData.platformFee,
      paymentMethod: paymentMethod || "NEFT / RTGS Industrial Escrow",
      status: "VERIFIED",
      verifiedAt: new Date(),
      breakdown: {
        materialSubtotal,
        processingFee: processingCost,
        logisticsFee: transportCost,
        platformFee: commissionData.platformFee,
        totalPayable,
      },
      auditNotes: transactionNotes || "Automated RTGS settlement cleared into RE:SOURCE Escrow Vault",
    });

    // Advance Deal state
    deal.status = "Payment Completed";
    deal.payment = payment._id;
    deal.costs.totalPayable = totalPayable;
    deal.costs.platformFee = commissionData.platformFee;
    deal.costs.supplierReceivable = materialSubtotal - commissionData.platformFee;
    await deal.save();

    // Structured notification to Seller
    await Notification.create({
      recipientCompany: deal.seller,
      type: "PAYMENT_COMPLETED",
      title: "Escrow Payment Confirmed",
      message: `Buyer deposited ₹${totalPayable.toLocaleString()} into Escrow for Deal ${deal.dealNumber}. Please initiate dispatch.`,
      actionLabel: "Prepare Dispatch",
      actionLink: `/deals/${deal._id}`,
      metadata: { dealId: deal._id, amount: totalPayable },
    });

    res.status(200).json({
      success: true,
      payment,
      deal,
      message: "Payment successfully verified and locked in escrow.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all payments (for company or admin)
// @route   GET /api/payments
const getPayments = async (req, res) => {
  try {
    const viewerCompanyId = req.user?.company?._id;
    const query = {};

    if (viewerCompanyId && req.user?.role !== "admin") {
      query.$or = [{ buyerId: viewerCompanyId }, { sellerId: viewerCompanyId }];
    }

    const payments = await Payment.find(query)
      .populate("dealId", "dealNumber status quantity unit")
      .populate("buyerId", "name industry")
      .populate("sellerId", "name industry")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: payments.length, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDealPaymentSummary,
  processPayment,
  getPayments,
};
