const Deal = require("../models/Deal");
const Resource = require("../models/Resource");
const Opportunity = require("../models/Opportunity");
const Assessment = require("../models/Assessment");
const PriceRequest = require("../models/PriceRequest");
const Exchange = require("../models/Exchange");
const Company = require("../models/Company");
const Notification = require("../models/Notification");
const { sanitizeResourceForViewer } = require("../middleware/auth");

// @desc    Initiate a new Deal from Marketplace or Opportunity
// @route   POST /api/deals/initiate
const initiateDeal = async (req, res) => {
  try {
    const { resourceId, opportunityId, quantity, proposedPrice, notes } = req.body;

    const resource = await Resource.findById(resourceId).populate("seller");
    if (!resource) {
      return res.status(404).json({ success: false, message: "Resource not found" });
    }

    let buyerId = req.user?.company?._id;
    if (!buyerId) {
      const defaultBuyer = await Company.findOne({ roleType: { $in: ["Consumer", "Both"] } });
      buyerId = defaultBuyer?._id;
    }

    const sellerId = resource.seller._id || resource.seller;

    const dealQuantity = Number(quantity) || resource.quantity || 300;
    const basePrice = Number(resource.basePrice) || 60;
    const initialPrice = proposedPrice ? Number(proposedPrice) : basePrice;

    // Create the Deal
    const deal = await Deal.create({
      buyer: buyerId,
      seller: sellerId,
      buyerUser: req.user?._id,
      resource: resource._id,
      opportunity: opportunityId || undefined,
      quantity: dealQuantity,
      unit: resource.unit || "tons",
      originalPrice: basePrice,
      currentNegotiatedPrice: initialPrice,
      status: "Deal Initiated",
      confidentiality: {
        isConfidentialToBuyer: resource.identityVisibility === "Confidential",
        isConfidentialToSeller: false,
      },
      costs: {
        materialSubtotal: dealQuantity * initialPrice,
        processingCost: resource.processingRequired ? dealQuantity * 15 : 0,
        transportCost: dealQuantity * 10,
        platformFee: Math.round((dealQuantity * initialPrice) * 0.035),
        totalPayable: (dealQuantity * initialPrice) + (resource.processingRequired ? dealQuantity * 15 : 0) + (dealQuantity * 10) + Math.round((dealQuantity * initialPrice) * 0.035),
      },
    });

    // Create Initial Assessment Record
    const assessment = await Assessment.create({
      dealId: deal._id,
      technicalRequirements: [
        {
          item: "Chemical Composition & Heavy Metal Assay",
          specification: "Standard industrial grade compliance",
          status: "Passed",
          notes: "Supplier lab report verified for base heavy metal thresholds.",
        },
        {
          item: "Moisture Content & Free Moisture",
          specification: "< 4.0% by dry weight",
          status: "Passed",
          notes: "Granulated slag dried in air-cooling stream.",
        },
        {
          item: "Grain Size Distribution / Particle Sieve",
          specification: "0-10 mm fraction",
          status: "Pending",
          notes: "Awaiting site screening setup validation.",
        },
      ],
      evidenceItems: [
        {
          title: "Certificate of Analysis (COA)",
          documentType: "Lab Report",
          status: "Available",
          fileUrl: "/docs/lab-analysis-cert.pdf",
        },
        {
          title: "Hazardous Materials Classification (TCLP)",
          documentType: "Environmental Clearance",
          status: "Required",
          fileUrl: "",
        },
      ],
      sampleRequested: true,
      sampleStatus: "Sample Requested",
      trialRequired: false,
      blockers: [
        {
          issue: "Contamination data requires batch verification",
          owner: "Seller Quality Lab",
          evidenceRequired: "Leachability TCLP Lab Report",
          completionCondition: "Independent third-party lab signoff",
          nextAction: "Upload contamination report",
          isResolved: false,
        },
      ],
      responsiblePerson: "Buyer Lead Metallurgist & Materials Engineer",
      status: "Action Required",
    });

    // Create Initial Price Request (structured slider workflow)
    const priceRequest = await PriceRequest.create({
      dealId: deal._id,
      buyerId,
      sellerId,
      resourceId: resource._id,
      originalPrice: basePrice,
      requestedMinPrice: initialPrice,
      requestedMaxPrice: initialPrice,
      requestedPriceType: "single",
      quantity: dealQuantity,
      unit: resource.unit || "tons",
      originalTotalValue: dealQuantity * basePrice,
      requestedTotalValueMin: dealQuantity * initialPrice,
      requestedTotalValueMax: dealQuantity * initialPrice,
      status: proposedPrice && proposedPrice !== basePrice ? "PENDING" : "ACCEPTED",
      history: [
        {
          actorRole: "system",
          action: "REQUEST_SUBMITTED",
          price: initialPrice,
          note: `Initial base terms established at ₹${initialPrice}/ton for ${dealQuantity} tons.`,
        },
      ],
    });

    // Create Empty Exchange Record
    const exchange = await Exchange.create({
      dealId: deal._id,
      status: "Awaiting Dispatch",
    });

    // Attach refs back to Deal
    deal.assessment = assessment._id;
    deal.priceRequest = priceRequest._id;
    deal.exchange = exchange._id;
    await deal.save();

    if (opportunityId) {
      await Opportunity.findByIdAndUpdate(opportunityId, {
        status: "Deal Initiated",
        deal: deal._id,
      });
    }

    // Create structured notifications
    await Notification.create({
      recipientCompany: sellerId,
      type: "PRICE_REQUEST_RECEIVED",
      title: "New Commercial Deal Initiated",
      message: `A buyer initiated a deal for ${dealQuantity} tons of ${resource.title}.`,
      actionLabel: "View Deal",
      actionLink: `/deals/${deal._id}`,
      metadata: { dealId: deal._id, resourceId: resource._id },
    });

    res.status(201).json({
      success: true,
      dealId: deal._id,
      deal,
      message: "Deal successfully initiated and entered pipeline.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all deals for logged-in company
// @route   GET /api/deals
const getDeals = async (req, res) => {
  try {
    const viewerCompanyId = req.user?.company?._id;
    const query = {};

    if (viewerCompanyId) {
      query.$or = [{ buyer: viewerCompanyId }, { seller: viewerCompanyId }];
    }

    const deals = await Deal.find(query)
      .populate("resource")
      .populate("buyer", "name industry location")
      .populate("seller", "name industry location verificationStatus")
      .populate("priceRequest")
      .populate("assessment")
      .populate("exchange")
      .sort({ updatedAt: -1 });

    const sanitized = deals.map((deal) => {
      const dealObj = deal.toObject();
      const isPaid =
        ["Payment Verified", "Payment Completed", "In Transit", "Delivery", "Completed", "Exchange Completed"].includes(dealObj.status) ||
        dealObj.payment?.status === "VERIFIED";

      if (dealObj.resource) {
        dealObj.resource = sanitizeResourceForViewer(dealObj.resource, viewerCompanyId, isPaid);
      }

      const isBuyerViewer = viewerCompanyId && String(dealObj.buyer?._id || dealObj.buyer) === String(viewerCompanyId);
      const isConfidential = dealObj.confidentiality?.isConfidentialToBuyer || dealObj.resource?.identityVisibility === "Confidential";

      if (isConfidential) {
        if (isPaid) {
          dealObj.identityRevealed = true;
          if (dealObj.seller) {
            dealObj.seller.identityRevealed = true;
            dealObj.seller.isConfidential = false;
          }
        } else if (isBuyerViewer) {
          dealObj.identityRevealed = false;
          if (dealObj.seller) {
            dealObj.seller = {
              _id: dealObj.seller._id,
              name: "🔐 Verified Confidential Supplier",
              industry: dealObj.seller.industry || "Industrial Metallurgy / Refining",
              isConfidential: true,
              identityRevealed: false,
              location: dealObj.seller.location,
            };
          }
        }
      }

      return dealObj;
    });

    res.json({ success: true, count: sanitized.length, deals: sanitized });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single deal by ID with all populated entities
// @route   GET /api/deals/:id
const getDealById = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id)
      .populate("resource")
      .populate("buyer", "name industry location gstNumber")
      .populate("seller", "name industry location gstNumber verificationStatus")
      .populate("priceRequest")
      .populate("assessment")
      .populate("payment")
      .populate("exchange");

    if (!deal) {
      return res.status(404).json({ success: false, message: "Deal not found" });
    }

    const viewerCompanyId = req.user?.company?._id;
    const dealObj = deal.toObject();
    const isPaid =
      ["Payment Verified", "Payment Completed", "In Transit", "Delivery", "Completed", "Exchange Completed"].includes(dealObj.status) ||
      dealObj.payment?.status === "VERIFIED";

    if (dealObj.resource) {
      dealObj.resource = sanitizeResourceForViewer(dealObj.resource, viewerCompanyId, isPaid);
    }

    const isBuyerViewer = viewerCompanyId && String(dealObj.buyer?._id || dealObj.buyer) === String(viewerCompanyId);
    const isConfidential = dealObj.confidentiality?.isConfidentialToBuyer || dealObj.resource?.identityVisibility === "Confidential";

    if (isConfidential) {
      if (isPaid) {
        dealObj.identityRevealed = true;
        if (dealObj.seller) {
          dealObj.seller.identityRevealed = true;
          dealObj.seller.isConfidential = false;
        }
      } else if (isBuyerViewer) {
        dealObj.identityRevealed = false;
        if (dealObj.seller) {
          dealObj.seller = {
            _id: dealObj.seller._id,
            name: "🔐 Verified Confidential Supplier",
            industry: dealObj.seller.industry || "Industrial Metallurgy / Refining",
            isConfidential: true,
            identityRevealed: false,
            location: dealObj.seller.location,
          };
        }
      }
    }

    res.json({ success: true, deal: dealObj, isPaid });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Advance deal status
// @route   PATCH /api/deals/:id/advance-status
const advanceDealStatus = async (req, res) => {
  try {
    const { nextStatus } = req.body;
    const deal = await Deal.findById(req.params.id);

    if (!deal) {
      return res.status(404).json({ success: false, message: "Deal not found" });
    }

    deal.status = nextStatus;
    await deal.save();

    res.json({
      success: true,
      deal,
      message: `Deal status advanced to ${nextStatus}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Advance deal dispatch and telematics tracking
// @route   PATCH /api/deals/:id/advance-dispatch
const advanceDealDispatch = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id)
      .populate("resource")
      .populate("buyer")
      .populate("seller")
      .populate("exchange");

    if (!deal) {
      return res.status(404).json({ success: false, message: "Deal not found" });
    }

    const stageCycle = {
      "Deal Initiated": "Payment Completed",
      "Assessment": "Payment Completed",
      "Agreement": "Payment Completed",
      "Payment Pending": "Payment Completed",
      "Payment Completed": "Dispatch",
      "Dispatch": "In Transit",
      "In Transit": "Delivery",
      "Delivery": "Exchange Completed",
      "Exchange Completed": "In Transit",
    };

    const nextStatus = req.body?.status || stageCycle[deal.status] || "In Transit";
    deal.status = nextStatus;
    await deal.save();

    if (deal.exchange) {
      const exchange = await Exchange.findById(deal.exchange._id || deal.exchange);
      if (exchange) {
        if (nextStatus === "Delivery") {
          exchange.deliveryDetails = {
            isDelivered: false,
            receivingFacility: "Buyer Inbound Weighbridge Gate 2",
            receiverName: "Security Lead & Tare Inspector",
            deliveryNotes: "Truck arrived at buyer facility. Awaiting gross weighbridge clearance.",
          };
        } else if (nextStatus === "Exchange Completed") {
          exchange.deliveryDetails = {
            isDelivered: true,
            receivedDate: new Date(),
            receivingFacility: "Buyer Inbound Weighbridge Gate 2",
            deliveryCondition: "Optimal",
            receiverName: "Site Receiving Manager",
            deliveryNotes: "Gross weight verified against bill of lading. Material approved.",
          };
          exchange.qualityConfirmation = {
            isConfirmed: true,
            status: "Quality Approved",
            confirmedBy: "Lead Quality Chemist",
            confirmedAt: new Date(),
            notes: "Lab sample meets required composition standards.",
          };
        }
        await exchange.save();
      }
    }

    const updated = await Deal.findById(deal._id)
      .populate("resource")
      .populate("buyer")
      .populate("seller")
      .populate("payment")
      .populate("exchange");

    res.json({
      success: true,
      deal: updated,
      message: `Consignment tracking stage advanced to "${nextStatus}".`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  initiateDeal,
  getDeals,
  getDealById,
  advanceDealStatus,
  advanceDealDispatch,
};
