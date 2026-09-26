const mongoose = require("mongoose");

const assessmentSchema = new mongoose.Schema(
  {
    dealId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deal",
      required: true,
    },
    technicalRequirements: [
      {
        item: { type: String, required: true },
        specification: String,
        status: {
          type: String,
          enum: ["Passed", "Pending", "Failed"],
          default: "Passed",
        },
        notes: String,
      },
    ],
    evidenceItems: [
      {
        title: { type: String, required: true },
        documentType: String,
        status: {
          type: String,
          enum: ["Available", "Required", "Verified"],
          default: "Available",
        },
        fileUrl: String,
      },
    ],
    sampleRequested: { type: Boolean, default: true },
    sampleStatus: {
      type: String,
      enum: ["Not Requested", "Sample Requested", "Sample Shipped", "Sample Approved"],
      default: "Sample Requested",
    },
    sampleTrackingNumber: { type: String, default: "SMPL-IN-9821" },
    trialRequired: { type: Boolean, default: false },
    trialStatus: {
      type: String,
      enum: ["Not Required", "Trial Pending", "Trial Passed"],
      default: "Not Required",
    },
    blockers: [
      {
        issue: { type: String, required: true },
        owner: { type: String, required: true }, // e.g. "Buyer Technical Team", "Seller Quality Lab"
        evidenceRequired: { type: String, required: true },
        completionCondition: { type: String, required: true },
        nextAction: { type: String, required: true },
        isResolved: { type: Boolean, default: false },
      },
    ],
    responsiblePerson: {
      type: String,
      default: "Chief Metallurgist / Lead QA Inspector",
    },
    status: {
      type: String,
      enum: ["In Review", "Action Required", "Completed"],
      default: "Action Required",
    },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Assessment", assessmentSchema);
