const Assessment = require("../models/Assessment");
const Deal = require("../models/Deal");
const Notification = require("../models/Notification");

// @desc    Get assessment by ID or dealId
// @route   GET /api/assessments/:id
const getAssessment = async (req, res) => {
  try {
    let assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      assessment = await Assessment.findOne({ dealId: req.params.id });
    }
    if (!assessment) {
      return res.status(404).json({ success: false, message: "Assessment not found" });
    }
    res.json({ success: true, assessment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Resolve or update a blocker item
// @route   PATCH /api/assessments/:id/blockers/:blockerIndex
const updateBlocker = async (req, res) => {
  try {
    const { blockerIndex } = req.params;
    const { isResolved, evidenceSubmitted } = req.body;

    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ success: false, message: "Assessment not found" });
    }

    const idx = parseInt(blockerIndex, 10);
    if (assessment.blockers && assessment.blockers[idx]) {
      assessment.blockers[idx].isResolved = isResolved !== undefined ? isResolved : true;
      if (evidenceSubmitted) {
        assessment.evidenceItems.push({
          title: "Contamination Assay Clearance",
          documentType: "Lab Verification",
          status: "Verified",
          fileUrl: "/docs/contamination-clearance-cert.pdf",
        });
      }
    }

    const allResolved = assessment.blockers.every((b) => b.isResolved);
    if (allResolved) {
      assessment.status = "Completed";
      assessment.completedAt = new Date();

      // Check if deal is in Assessment stage and ready to advance
      const deal = await Deal.findById(assessment.dealId);
      if (deal && deal.status === "Assessment") {
        deal.status = "Price Negotiation";
        await deal.save();

        await Notification.create({
          recipientCompany: deal.buyer,
          type: "ASSESSMENT_BLOCKER",
          title: "Technical Assessment Completed",
          message: "All engineering and contamination blockers resolved. Ready for Price Negotiation.",
          actionLabel: "Negotiate Price",
          actionLink: `/deals/${deal._id}`,
          metadata: { dealId: deal._id },
        });
      }
    }

    await assessment.save();
    res.json({ success: true, assessment, message: "Assessment updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update sample status
// @route   PATCH /api/assessments/:id/sample-status
const updateSampleStatus = async (req, res) => {
  try {
    const { sampleStatus, trackingNumber } = req.body;
    const assessment = await Assessment.findById(req.params.id);

    if (!assessment) {
      return res.status(404).json({ success: false, message: "Assessment not found" });
    }

    assessment.sampleStatus = sampleStatus;
    if (trackingNumber) assessment.sampleTrackingNumber = trackingNumber;
    await assessment.save();

    res.json({ success: true, assessment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAssessment,
  updateBlocker,
  updateSampleStatus,
};
