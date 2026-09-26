const mongoose = require("mongoose");

const opportunitySchema = new mongoose.Schema(
  {
    mlAssessment: { type: mongoose.Schema.Types.Mixed },
    engine: { type: String },
    title: { type: String, required: true }, // e.g. "Steel Slag → Aggregate"
    intendedUse: { type: String, required: true },
    requirement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Requirement",
    },
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource",
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    compatibility: {
      technicalFit: { type: Number, default: 94 },
      quantityFit: { type: Number, default: 87 },
      timingFit: { type: Number, default: 91 },
      logisticsFit: { type: Number, default: 82 },
      processingFit: { type: Number, default: 76 },
      evidenceFit: { type: Number, default: 61 },
      overallScore: { type: Number, default: 86 },
    },
    whyMatch: {
      summary: {
        type: String,
        default:
          "The supplier's recorded properties may satisfy several of your stated aggregate requirements after processing. The supplier indicates recurring availability that matches your requirement volume.",
      },
      confirmed: [
        { type: String, default: "Quantity capacity confirmed" },
        { type: String, default: "Material laboratory test report available" },
        { type: String, default: "Recurring monthly delivery available" },
      ],
      unknown: [
        { type: String, default: "Specific leachable trace data pending" },
        { type: String, default: "Pilot sample validation required before mass batch" },
        { type: String, default: "Final customized toll-processing cost pending site verification" },
      ],
    },
    opportunityAssessment: {
      technicalFit: { type: String, default: "High" },
      practicalFit: { type: String, default: "Medium" },
      evidence: { type: String, default: "Medium" },
      economicPotential: { type: String, default: "Pending transport quote" },
      environmentalPotential: { type: String, default: "Positive scenario" },
    },
    costComparison: {
      currentMaterialName: { type: String, default: "Virgin Raw Material" },
      currentCostPerTon: { type: Number, default: 100 },
      alternativeMaterialCost: { type: Number, default: 50 },
      processingCost: { type: Number, default: 15 },
      transportCost: { type: Number, default: 10 },
      testingCost: { type: Number, default: 0 },
      estimatedSubtotal: { type: Number, default: 75 },
      potentialSavingsPerTon: { type: Number, default: 25 },
      note: {
        type: String,
        default: "Potential savings before unresolved freight & secondary handling costs.",
      },
    },
    environmentalScenario: {
      materialExchangedPerMonth: { type: Number, default: 300 },
      virginMaterialDisplaced: { type: Number, default: 300 },
      residualMaterialUtilized: { type: Number, default: 300 },
      transportEmissions: { type: String, default: "Estimated 14 kg CO2e / ton" },
      preparationImpact: { type: String, default: "Estimated 6 kg CO2e / ton" },
      netEnvironmentalScenario: {
        type: String,
        default: "Net reduction of ~72% CO2e compared to conventional quarrying and calcining.",
      },
    },
    status: {
      type: String,
      enum: ["Identified", "Shortlisted", "Deal Initiated", "Dismissed"],
      default: "Identified",
    },
    deal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deal",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Opportunity", opportunitySchema);
