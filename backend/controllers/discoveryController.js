const Requirement = require("../models/Requirement");
const Opportunity = require("../models/Opportunity");
const { discoverAlternatives } = require("../services/aiDiscoveryService");
const { sanitizeResourceForViewer } = require("../middleware/auth");
const { MlIntegrationError } = require("../services/mlMarketplaceAdapter");

function safeOpportunity(opportunity, viewer) {
  const obj = opportunity.toObject ? opportunity.toObject() : { ...opportunity };
  obj.resource = sanitizeResourceForViewer(obj.resource, viewer);
  if (obj.resource?.identityVisibility === 'Confidential' && String(obj.seller?._id ?? obj.seller) !== String(viewer)) {
    obj.seller = { name: 'Confidential supplier', isConfidential: true };
    if (obj.resource.seller) obj.resource.seller = { name: 'Confidential supplier', isConfidential: true };
    if (obj.resource.location) obj.resource.location = { region: obj.resource.location.region, state: obj.resource.location.state };
    if (obj.resource.materialPassport) {
      obj.resource.materialPassport = { evidenceStatus: obj.resource.materialPassport.evidenceStatus };
    }
    delete obj.resource.sellerUser;
  }
  return obj;
}
const submitAndMatch = async (req, res) => {
  try {
    const buyerId = req.user?.company?._id;
    if (!buyerId) return res.status(401).json({ success: false, message: 'Sign in with a company account to run discovery.' });
    const body = req.body;
    for (const field of ['currentMaterial', 'targetResource', 'intendedUse']) {
      if (typeof body[field] !== 'string' || !body[field].trim()) throw new MlIntegrationError(`Enter ${field}.`);
    }
    if (!(Number(body.requiredQuantity) > 0)) throw new MlIntegrationError('Enter a positive required quantity.');
    if (body.currentCostPerUnit === '' || body.currentCostPerUnit == null || !Number.isFinite(Number(body.currentCostPerUnit)) || Number(body.currentCostPerUnit) < 0) throw new MlIntegrationError('Enter a non-negative current delivered price.');
    const fields = ['currentMaterial', 'targetResource', 'intendedUse', 'requiredQuantity', 'minimumQuantity', 'unit', 'requiredProperties', 'currentCostPerUnit', 'deliveryLocation', 'timing', 'neededFrom', 'neededUntil', 'processingAllowed'];
    const input = Object.fromEntries(fields.filter(k => body[k] != null).map(k => [k, body[k]]));
    // Allocate an ID before assessment, but only save after the ML request succeeds.
    const requirement = new Requirement({ ...input, buyer: buyerId, buyerUser: req.user._id });
    await requirement.validate();
    const { matches, metadata } = await discoverAlternatives(requirement, buyerId, { scenario: body.scenario });
    await requirement.save();
    const opportunities = [];
    for (const match of matches) {
      const opp = await Opportunity.create({ ...match, requirement: requirement._id, resource: match.resource._id,
        buyer: buyerId, seller: match.resource.seller._id || match.resource.seller, status: 'Identified' });
      const populated = await Opportunity.findById(opp._id).populate('resource').populate('seller', 'name industry location verificationStatus');
      opportunities.push(safeOpportunity(populated, buyerId));
    }
    res.json({ success: true, requirement, ...metadata, matchesFound: opportunities.length, opportunities });
  } catch (error) {
    res.status(error.statusCode || (error.name === 'ValidationError' ? 422 : 500)).json({ success: false, message: error.message });
  }
};
const getOpportunities = async (req, res) => {
  try {
    const viewer = req.user?.company?._id;
    if (!viewer) return res.status(401).json({ success: false, message: 'Company sign-in required.' });
    // Discovery includes private buyer requirements/costs. Sellers use the deal workspace.
    const opportunities = await Opportunity.find({ buyer: viewer }).populate('resource').populate('seller', 'name industry location verificationStatus').sort({ createdAt: -1 });
    res.json({ success: true, count: opportunities.length, opportunities: opportunities.map(o => safeOpportunity(o, viewer)) });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
const getOpportunityById = async (req, res) => {
  try {
    const viewer = req.user?.company?._id;
    if (!viewer) return res.status(401).json({ success: false, message: 'Company sign-in required.' });
    const opportunity = await Opportunity.findOne({ _id: req.params.id, buyer: viewer }).populate('resource').populate('requirement').populate('seller', 'name industry location verificationStatus');
    if (!opportunity) return res.status(404).json({ success: false, message: 'Opportunity not found' });
    res.json({ success: true, opportunity: safeOpportunity(opportunity, viewer) });
  } catch (error) { res.status(error.name === 'CastError' ? 404 : 500).json({ success: false, message: error.message }); }
};
module.exports = { submitAndMatch, getOpportunities, getOpportunityById, safeOpportunity };
