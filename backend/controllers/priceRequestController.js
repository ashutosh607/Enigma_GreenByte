const PriceRequest = require("../models/PriceRequest");
const Deal = require("../models/Deal");
const Notification = require("../models/Notification");
const { calculateCommission } = require("../services/commissionService");

// @desc    Buyer submits a price request via slider (single or range)
// @route   POST /api/price-requests
const submitPriceRequest = async (req, res) => {
  try {
    const { dealId, requestedMinPrice, requestedMaxPrice, priceType, note } = req.body;

    const deal = await Deal.findById(dealId).populate("resource").populate("seller");
    if (!deal) {
      return res.status(404).json({ success: false, message: "Deal not found" });
    }

    const minPrice = Number(requestedMinPrice);
    const maxPrice = priceType === "range" ? Number(requestedMaxPrice) : minPrice;
    const qty = deal.quantity;

    let priceRequest = await PriceRequest.findOne({ dealId });

    if (!priceRequest) {
      priceRequest = new PriceRequest({
        dealId: deal._id,
        buyerId: deal.buyer,
        sellerId: deal.seller._id || deal.seller,
        resourceId: deal.resource._id,
        originalPrice: deal.originalPrice,
        quantity: qty,
        unit: deal.unit,
      });
    }

    priceRequest.requestedMinPrice = minPrice;
    priceRequest.requestedMaxPrice = maxPrice;
    priceRequest.requestedPriceType = priceType || (minPrice === maxPrice ? "single" : "range");
    priceRequest.originalTotalValue = qty * deal.originalPrice;
    priceRequest.requestedTotalValueMin = qty * minPrice;
    priceRequest.requestedTotalValueMax = qty * maxPrice;
    priceRequest.status = "PENDING";

    const noteText =
      priceType === "range"
        ? `Buyer requested range ₹${minPrice}–₹${maxPrice} / ${deal.unit}. ${note || ""}`
        : `Buyer requested ₹${minPrice} / ${deal.unit} (Difference: ₹${minPrice - deal.originalPrice} / ${deal.unit}). ${note || ""}`;

    priceRequest.history.push({
      actorRole: "buyer",
      action: "REQUEST_SUBMITTED",
      price: minPrice,
      minPrice,
      maxPrice,
      note: noteText,
      timestamp: new Date(),
    });

    await priceRequest.save();

    // Advance Deal state
    deal.status = "Price Negotiation";
    deal.currentNegotiatedPrice = minPrice;
    deal.priceRequest = priceRequest._id;
    await deal.save();

    // Notify seller
    await Notification.create({
      recipientCompany: deal.seller._id || deal.seller,
      type: "PRICE_REQUEST_RECEIVED",
      title: "Price Request Received",
      message: `Buyer requested ₹${minPrice}${priceType === "range" ? `–₹${maxPrice}` : ""} / ${deal.unit} for ${deal.resource?.title || "material"}.`,
      actionLabel: "Review Request",
      actionLink: `/deals/${deal._id}`,
      metadata: {
        dealId: deal._id,
        priceRequestId: priceRequest._id,
        amount: priceRequest.requestedTotalValueMin,
      },
    });

    res.status(200).json({
      success: true,
      priceRequest,
      deal,
      message: "Price request submitted to seller dashboard",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Seller accepts buyer price request
// @route   POST /api/price-requests/:id/accept
const acceptPriceRequest = async (req, res) => {
  try {
    const priceRequest = await PriceRequest.findById(req.params.id);
    if (!priceRequest) {
      return res.status(404).json({ success: false, message: "Price request not found" });
    }

    const agreedPrice = priceRequest.requestedMinPrice;
    priceRequest.finalAgreedPrice = agreedPrice;
    priceRequest.status = "FINAL_AGREED";

    priceRequest.history.push({
      actorRole: "seller",
      action: "ACCEPTED",
      price: agreedPrice,
      note: `Seller accepted the proposed price of ₹${agreedPrice} / ${priceRequest.unit}.`,
      timestamp: new Date(),
    });

    await priceRequest.save();

    // Update Deal
    const deal = await Deal.findById(priceRequest.dealId);
    if (deal) {
      deal.finalAgreedPrice = agreedPrice;
      deal.currentNegotiatedPrice = agreedPrice;
      deal.status = "Agreement";

      // Recalculate costs with agreed price
      const materialSubtotal = deal.quantity * agreedPrice;
      const commissionData = await calculateCommission(materialSubtotal);

      deal.costs.materialSubtotal = materialSubtotal;
      deal.costs.platformFee = commissionData.platformFee;
      deal.costs.commissionRate = commissionData.ratePercent;
      deal.costs.supplierReceivable = commissionData.supplierReceivable;
      deal.costs.totalPayable =
        materialSubtotal +
        (deal.costs.processingCost || 0) +
        (deal.costs.transportCost || 0) +
        commissionData.platformFee;

      await deal.save();

      // Notify Buyer
      await Notification.create({
        recipientCompany: deal.buyer,
        type: "PRICE_REQUEST_ACCEPTED",
        title: "Price Request Accepted",
        message: `Seller accepted your requested price of ₹${agreedPrice} / ${deal.unit}. Proceed to agreement & payment.`,
        actionLabel: "View Agreement",
        actionLink: `/deals/${deal._id}`,
        metadata: { dealId: deal._id, priceRequestId: priceRequest._id, amount: deal.costs.totalPayable },
      });
    }

    res.json({
      success: true,
      priceRequest,
      deal,
      message: `Price agreed at ₹${agreedPrice} / ${priceRequest.unit}. Deal locked and ready for agreement.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Seller counters buyer price request
// @route   POST /api/price-requests/:id/counter
const counterPriceRequest = async (req, res) => {
  try {
    const { counterPrice, note } = req.body;
    const priceRequest = await PriceRequest.findById(req.params.id);

    if (!priceRequest) {
      return res.status(404).json({ success: false, message: "Price request not found" });
    }

    const counterVal = Number(counterPrice);
    priceRequest.counterPrice = counterVal;
    priceRequest.status = "BUYER_REVIEW";

    priceRequest.history.push({
      actorRole: "seller",
      action: "COUNTER_OFFERED",
      price: counterVal,
      note: `Seller countered with ₹${counterVal} / ${priceRequest.unit}. ${note || ""}`,
      timestamp: new Date(),
    });

    await priceRequest.save();

    const deal = await Deal.findById(priceRequest.dealId);
    if (deal) {
      deal.currentNegotiatedPrice = counterVal;
      await deal.save();

      // Notify Buyer
      await Notification.create({
        recipientCompany: deal.buyer,
        type: "COUNTER_PRICE_RECEIVED",
        title: "Counter Price Received",
        message: `Seller countered your price request with ₹${counterVal} / ${priceRequest.unit}.`,
        actionLabel: "Review Counter",
        actionLink: `/deals/${deal._id}`,
        metadata: { dealId: deal._id, priceRequestId: priceRequest._id },
      });
    }

    res.json({
      success: true,
      priceRequest,
      deal,
      message: `Counter offer of ₹${counterVal} / ${priceRequest.unit} submitted to buyer.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Buyer accepts seller counter price
// @route   POST /api/price-requests/:id/buyer-accept
const buyerAcceptCounter = async (req, res) => {
  try {
    const priceRequest = await PriceRequest.findById(req.params.id);
    if (!priceRequest) {
      return res.status(404).json({ success: false, message: "Price request not found" });
    }

    const agreedPrice = priceRequest.counterPrice || priceRequest.originalPrice;
    priceRequest.finalAgreedPrice = agreedPrice;
    priceRequest.status = "FINAL_AGREED";

    priceRequest.history.push({
      actorRole: "buyer",
      action: "FINALIZED",
      price: agreedPrice,
      note: `Buyer accepted seller counter price of ₹${agreedPrice} / ${priceRequest.unit}. Price locked.`,
      timestamp: new Date(),
    });

    await priceRequest.save();

    const deal = await Deal.findById(priceRequest.dealId);
    if (deal) {
      deal.finalAgreedPrice = agreedPrice;
      deal.currentNegotiatedPrice = agreedPrice;
      deal.status = "Agreement";

      const materialSubtotal = deal.quantity * agreedPrice;
      const commissionData = await calculateCommission(materialSubtotal);

      deal.costs.materialSubtotal = materialSubtotal;
      deal.costs.platformFee = commissionData.platformFee;
      deal.costs.commissionRate = commissionData.ratePercent;
      deal.costs.supplierReceivable = commissionData.supplierReceivable;
      deal.costs.totalPayable =
        materialSubtotal +
        (deal.costs.processingCost || 0) +
        (deal.costs.transportCost || 0) +
        commissionData.platformFee;

      await deal.save();

      // Notify Seller
      await Notification.create({
        recipientCompany: deal.seller,
        type: "FINAL_PRICE_AGREED",
        title: "Final Price Agreed",
        message: `Buyer accepted your counter price of ₹${agreedPrice} / ${deal.unit}. Agreement generated.`,
        actionLabel: "View Deal",
        actionLink: `/deals/${deal._id}`,
        metadata: { dealId: deal._id, priceRequestId: priceRequest._id },
      });
    }

    res.json({
      success: true,
      priceRequest,
      deal,
      message: `Final price locked at ₹${agreedPrice} / ${priceRequest.unit}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Seller rejects buyer price request
// @route   POST /api/price-requests/:id/reject
const rejectPriceRequest = async (req, res) => {
  try {
    const { reason } = req.body;
    const priceRequest = await PriceRequest.findById(req.params.id);
    if (!priceRequest) {
      return res.status(404).json({ success: false, message: "Price request not found" });
    }

    priceRequest.status = "REJECTED";
    priceRequest.history.push({
      actorRole: "seller",
      action: "REJECTED",
      price: priceRequest.originalPrice,
      note: `Seller rejected price request. ${reason || "Seller maintaining original price."}`,
      timestamp: new Date(),
    });

    await priceRequest.save();

    const deal = await Deal.findById(priceRequest.dealId);
    if (deal) {
      // Revert current negotiated price back to original
      deal.currentNegotiatedPrice = deal.originalPrice;
      await deal.save();

      await Notification.create({
        recipientCompany: deal.buyer,
        type: "PRICE_REQUEST_REJECTED",
        title: "Price Request Declined",
        message: `Seller did not accept requested price. Base price remains ₹${deal.originalPrice} / ${deal.unit}.`,
        actionLabel: "Review Deal",
        actionLink: `/deals/${deal._id}`,
        metadata: { dealId: deal._id, priceRequestId: priceRequest._id },
      });
    }

    res.json({
      success: true,
      priceRequest,
      deal,
      message: "Price request rejected. Original price maintained.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all price requests for active company
// @route   GET /api/price-requests
const getPriceRequests = async (req, res) => {
  try {
    const companyId = req.user?.company?._id;
    const query = {};
    if (companyId) {
      query.$or = [{ buyerId: companyId }, { sellerId: companyId }];
    }

    const priceRequests = await PriceRequest.find(query)
      .populate("dealId")
      .populate("resourceId")
      .populate("buyerId", "name industry location")
      .populate("sellerId", "name industry location")
      .sort({ updatedAt: -1 });

    res.json({ success: true, count: priceRequests.length, priceRequests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  submitPriceRequest,
  acceptPriceRequest,
  counterPriceRequest,
  buyerAcceptCounter,
  rejectPriceRequest,
  getPriceRequests,
};
