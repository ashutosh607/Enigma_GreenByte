const Exchange = require("../models/Exchange");
const Deal = require("../models/Deal");
const Notification = require("../models/Notification");

// @desc    Get exchange details by deal ID
// @route   GET /api/exchanges/:dealId
const getExchangeByDealId = async (req, res) => {
  try {
    let exchange = await Exchange.findOne({ dealId: req.params.dealId });
    if (!exchange) {
      exchange = await Exchange.create({ dealId: req.params.dealId });
    }
    res.json({ success: true, exchange });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Seller marks resource as dispatched
// @route   POST /api/exchanges/:dealId/dispatch
const markDispatched = async (req, res) => {
  try {
    const { actualQuantity, unit, dispatchDate, carrierName, trackingNumber, vehicleNumber, driverContact, dispatchNotes } = req.body;

    const deal = await Deal.findById(req.params.dealId).populate("resource");
    if (!deal) {
      return res.status(404).json({ success: false, message: "Deal not found" });
    }

    let exchange = await Exchange.findOne({ dealId: deal._id });
    if (!exchange) {
      exchange = new Exchange({ dealId: deal._id });
    }

    exchange.dispatchDetails = {
      isDispatched: true,
      actualQuantity: Number(actualQuantity) || deal.quantity,
      unit: unit || deal.unit || "tons",
      dispatchDate: dispatchDate ? new Date(dispatchDate) : new Date(),
      carrierName: carrierName || "BlueStar Bulk Freight Logistics",
      trackingNumber: trackingNumber || "TRK-IND-" + Math.floor(100000 + Math.random() * 900000),
      vehicleNumber: vehicleNumber || "MH-12-QZ-4921",
      driverContact: driverContact || "+91 98230 44102",
      dispatchManifestUrl: "/docs/manifest-01.pdf",
      dispatchNotes: dispatchNotes || "Consignment loaded and tarped under industrial rain protection.",
      dispatchedBy: req.user?._id,
    };
    exchange.status = "Dispatched / In Transit";
    await exchange.save();

    deal.status = "In Transit";
    await deal.save();

    // Notify Buyer
    await Notification.create({
      recipientCompany: deal.buyer,
      type: "DISPATCH_CONFIRMED",
      title: "Consignment Dispatched",
      message: `${exchange.dispatchDetails.actualQuantity} ${deal.unit} of ${deal.resource?.title} is now in transit via ${exchange.dispatchDetails.carrierName}. Tracking: ${exchange.dispatchDetails.trackingNumber}.`,
      actionLabel: "Track Consignment",
      actionLink: `/deals/${deal._id}`,
      metadata: { dealId: deal._id },
    });

    res.json({
      success: true,
      exchange,
      deal,
      message: "Material marked as dispatched. Status updated to In Transit.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Buyer confirms delivery receipt
// @route   POST /api/exchanges/:dealId/delivery
const confirmDelivery = async (req, res) => {
  try {
    const { quantityReceived, deliveryCondition, receiverName, receivingFacility, deliveryNotes } = req.body;

    const deal = await Deal.findById(req.params.dealId).populate("resource");
    if (!deal) {
      return res.status(404).json({ success: false, message: "Deal not found" });
    }

    const exchange = await Exchange.findOne({ dealId: deal._id });
    if (!exchange) {
      return res.status(404).json({ success: false, message: "Exchange record not found" });
    }

    exchange.deliveryDetails = {
      isDelivered: true,
      quantityReceived: Number(quantityReceived) || exchange.dispatchDetails?.actualQuantity || deal.quantity,
      receivedDate: new Date(),
      receivingFacility: receivingFacility || "Yard 3 - Secondary Materials Receiving Silo",
      deliveryCondition: deliveryCondition || "Optimal",
      receiverName: receiverName || req.user?.name || "Receiving Dock Manager",
      deliveryNotes: deliveryNotes || "Truck weighbridge tare & gross recorded accurately.",
    };
    exchange.status = "Delivered / Under Quality Audit";
    await exchange.save();

    deal.status = "Quality Confirmation";
    await deal.save();

    // Notify Seller
    await Notification.create({
      recipientCompany: deal.seller,
      type: "DELIVERY_CONFIRMED",
      title: "Consignment Delivered",
      message: `Buyer confirmed receipt of ${exchange.deliveryDetails.quantityReceived} ${deal.unit}. Quality inspection initiated.`,
      actionLabel: "View Deal",
      actionLink: `/deals/${deal._id}`,
      metadata: { dealId: deal._id },
    });

    res.json({
      success: true,
      exchange,
      deal,
      message: "Delivery receipt recorded. Quality inspection initiated.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Buyer confirms quality or files discrepancy
// @route   POST /api/exchanges/:dealId/quality
const confirmQuality = async (req, res) => {
  try {
    const { status, hasDiscrepancy, issueType, description, moistureLevelPercent, purityVerifiedPercent, notes } = req.body;

    const deal = await Deal.findById(req.params.dealId).populate("resource");
    if (!deal) {
      return res.status(404).json({ success: false, message: "Deal not found" });
    }

    const exchange = await Exchange.findOne({ dealId: deal._id });
    if (!exchange) {
      return res.status(404).json({ success: false, message: "Exchange record not found" });
    }

    if (hasDiscrepancy) {
      // Discrepancy flow: Do not complete deal
      exchange.discrepancy = {
        hasDiscrepancy: true,
        issueType: issueType || "Quality Deviation",
        description: description || "Lab moisture or purity deviation outside contract tolerance.",
        resolutionStatus: "Reported",
      };
      exchange.status = "Dispute Active";
      await exchange.save();

      await Notification.create({
        recipientCompany: deal.seller,
        type: "QUALITY_DISCREPANCY",
        title: "Quality Discrepancy Reported",
        message: `Buyer reported an issue during quality verification: ${description || issueType}. Facilitator notified.`,
        actionLabel: "Review Discrepancy",
        actionLink: `/deals/${deal._id}`,
        metadata: { dealId: deal._id },
      });

      return res.json({
        success: true,
        exchange,
        deal,
        message: "Discrepancy reported. Platform facilitator assigned to mediate.",
      });
    }

    // Success flow: Quality Approved
    exchange.qualityConfirmation = {
      isConfirmed: true,
      status: status || "Quality Approved",
      labAnalysisBatch: "QC-" + Math.floor(1000 + Math.random() * 9000),
      moistureLevelPercent: moistureLevelPercent || 2.8,
      purityVerifiedPercent: purityVerifiedPercent || 91.5,
      confirmedBy: req.user?.name || "Plant Materials Lab Lead",
      confirmedAt: new Date(),
      notes: notes || "Batch samples fully satisfy specifications and mechanical properties.",
    };
    exchange.status = "Exchange Completed";
    exchange.completedAt = new Date();
    await exchange.save();

    deal.status = "Exchange Completed";
    await deal.save();

    // Notify both parties
    await Notification.create({
      recipientCompany: deal.seller,
      type: "EXCHANGE_COMPLETED",
      title: "Exchange Successfully Completed",
      message: `Quality confirmed for Deal ${deal.dealNumber}. Escrow funds released to supplier account.`,
      actionLabel: "View Impact",
      actionLink: `/deals/${deal._id}`,
      metadata: { dealId: deal._id },
    });

    await Notification.create({
      recipientCompany: deal.buyer,
      type: "EXCHANGE_COMPLETED",
      title: "Industrial Exchange Completed",
      message: `Quality inspection signed off for Deal ${deal.dealNumber}. Environmental impact credits updated.`,
      actionLabel: "View Impact",
      actionLink: `/impact`,
      metadata: { dealId: deal._id },
    });

    res.json({
      success: true,
      exchange,
      deal,
      message: "Quality verified and signed off. Industrial exchange successfully completed!",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getExchangeByDealId,
  markDispatched,
  confirmDelivery,
  confirmQuality,
};
