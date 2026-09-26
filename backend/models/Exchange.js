const mongoose = require("mongoose");

const exchangeSchema = new mongoose.Schema(
  {
    dealId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deal",
      required: true,
      unique: true,
    },
    dispatchDetails: {
      isDispatched: { type: Boolean, default: false },
      actualQuantity: { type: Number },
      unit: { type: String, default: "tons" },
      dispatchDate: { type: Date },
      carrierName: { type: String, default: "BlueStar Bulk Freight Logistics" },
      trackingNumber: { type: String },
      vehicleNumber: { type: String },
      driverContact: { type: String },
      dispatchManifestUrl: { type: String, default: "/docs/manifest-01.pdf" },
      dispatchNotes: { type: String },
    },
    deliveryDetails: {
      isDelivered: { type: Boolean, default: false },
      quantityReceived: { type: Number },
      receivedDate: { type: Date },
      receivingFacility: { type: String },
      deliveryCondition: {
        type: String,
        enum: ["Optimal", "Acceptable", "Damaged Packaging", "Moisture Issue", "Partial Shortage"],
        default: "Optimal",
      },
      receiverName: { type: String },
      deliveryNotes: { type: String },
    },
    qualityConfirmation: {
      isConfirmed: { type: Boolean, default: false },
      status: {
        type: String,
        enum: ["Pending Inspection", "Quality Approved", "Minor Discrepancy Accepted", "Rejected"],
        default: "Pending Inspection",
      },
      labAnalysisBatch: { type: String },
      moistureLevelPercent: { type: Number },
      purityVerifiedPercent: { type: Number },
      confirmedBy: { type: String },
      confirmedAt: { type: Date },
      notes: { type: String },
    },
    discrepancy: {
      hasDiscrepancy: { type: Boolean, default: false },
      shortageTons: { type: Number, default: 0 },
      issueType: {
        type: String,
        enum: ["None", "Weight Discrepancy", "Quality Deviation", "Transit Delay", "Contamination"],
        default: "None",
      },
      description: { type: String },
      resolutionStatus: {
        type: String,
        enum: ["None", "Reported", "Under Facilitation", "Settled"],
        default: "None",
      },
      settlementAdjustment: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: [
        "Awaiting Dispatch",
        "Dispatched / In Transit",
        "Delivered / Under Quality Audit",
        "Exchange Completed",
        "Dispute Active",
      ],
      default: "Awaiting Dispatch",
    },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Exchange", exchangeSchema);
