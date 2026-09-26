const Requirement = require("../models/Requirement");
const Opportunity = require("../models/Opportunity");
const Company = require("../models/Company");
const { discoverAlternatives } = require("../services/aiDiscoveryService");
const { sanitizeResourceForViewer } = require("../middleware/auth");

// @desc    Submit buyer requirement and run AI discovery
// @route   POST /api/discovery/match
const submitAndMatch = async (req, res) => {
  try {
    const {
      currentMaterial,
      intendedUse,
      requiredQuantity,
      unit,
      requiredProperties,
      currentCostPerUnit,
      deliveryLocation,
      timing,
    } = req.body;

    let buyerId = req.user?.company?._id;
    if (!buyerId) {
      const defaultBuyer = await Company.findOne({ roleType: { $in: ["Consumer", "Both"] } });
      buyerId = defaultBuyer?._id;
    }

    // Save Requirement
    const requirement = await Requirement.create({
      currentMaterial: currentMaterial || "Virgin Calcium Carbonate",
      intendedUse: intendedUse || "Construction Aggregate & Sub-base",
      requiredQuantity: Number(requiredQuantity) || 300,
      unit: unit || "tons/month",
      requiredProperties: requiredProperties || [
        { name: "Purity", targetValue: "> 88%", tolerance: "±3%" },
        { name: "Moisture", targetValue: "< 3.5%", tolerance: "±0.5%" },
        { name: "Bulk Density", targetValue: "1,450 kg/m³", tolerance: "±50 kg/m³" },
      ],
      currentCostPerUnit: Number(currentCostPerUnit) || 100,
      deliveryLocation: deliveryLocation || {
        city: "Pune",
        state: "Maharashtra",
        region: "Western India",
      },
      timing: timing || "Recurring",
      buyer: buyerId,
      buyerUser: req.user?._id,
    });

    // Run AI discovery match engine
    const matchResults = await discoverAlternatives(requirement, buyerId);

    // Save generated opportunities in database
    const createdOpportunities = [];
    for (const match of matchResults) {
      const opp = await Opportunity.create({
        title: match.title,
        intendedUse: match.intendedUse,
        requirement: requirement._id,
        resource: match.resource._id,
        buyer: buyerId,
        seller: match.resource.seller._id || match.resource.seller,
        compatibility: match.compatibility,
        whyMatch: match.whyMatch,
        opportunityAssessment: match.opportunityAssessment,
        costComparison: match.costComparison,
        environmentalScenario: match.environmentalScenario,
        status: "Identified",
      });

      const populatedOpp = await Opportunity.findById(opp._id)
        .populate("resource")
        .populate("seller", "name industry location verificationStatus");

      createdOpportunities.push({
        ...populatedOpp.toObject(),
        resource: sanitizeResourceForViewer(populatedOpp.resource, buyerId),
      });
    }

    res.status(200).json({
      success: true,
      requirement,
      totalAnalyzed: 248,
      requirementsAnalyzed: 173,
      matchesFound: createdOpportunities.length,
      opportunities: createdOpportunities,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all opportunities for company
// @route   GET /api/discovery/opportunities
const getOpportunities = async (req, res) => {
  try {
    const viewerCompanyId = req.user?.company?._id;
    const query = {};

    if (viewerCompanyId) {
      query.$or = [{ buyer: viewerCompanyId }, { seller: viewerCompanyId }];
    }

    const opportunities = await Opportunity.find(query)
      .populate("resource")
      .populate("buyer", "name industry location")
      .populate("seller", "name industry location verificationStatus")
      .sort({ createdAt: -1 });

    const sanitized = opportunities.map((opp) => {
      const oppObj = opp.toObject();
      if (oppObj.resource) {
        oppObj.resource = sanitizeResourceForViewer(oppObj.resource, viewerCompanyId);
      }
      return oppObj;
    });

    res.json({ success: true, count: sanitized.length, opportunities: sanitized });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single opportunity by ID
// @route   GET /api/discovery/opportunities/:id
const getOpportunityById = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id)
      .populate("resource")
      .populate("requirement")
      .populate("buyer", "name industry location")
      .populate("seller", "name industry location verificationStatus");

    if (!opportunity) {
      return res.status(404).json({ success: false, message: "Opportunity not found" });
    }

    const viewerCompanyId = req.user?.company?._id;
    const oppObj = opportunity.toObject();
    oppObj.resource = sanitizeResourceForViewer(oppObj.resource, viewerCompanyId);

    res.json({ success: true, opportunity: oppObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  submitAndMatch,
  getOpportunities,
  getOpportunityById,
};
