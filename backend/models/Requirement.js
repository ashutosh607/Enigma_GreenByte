const mongoose = require("mongoose");

const requirementSchema = new mongoose.Schema(
  {
    targetResource: { type: String },
    minimumQuantity: { type: Number },
    neededFrom: { type: Date },
    neededUntil: { type: Date },
    processingAllowed: { type: Boolean, default: true },
    currentMaterial: { type: String, required: true },
    intendedUse: { type: String, required: true },
    requiredQuantity: { type: Number, required: true },
    unit: { type: String, default: "tons/month" },
    requiredProperties: [
      {
        basis: { type: String, enum: ["input", "output"], default: "output" },
        name: { type: String, required: true },
        targetValue: { type: String, required: true },
        tolerance: { type: String, default: "±5%" },
      },
    ],
    currentCostPerUnit: { type: Number },
    unitPriceUnit: { type: String, default: "₹ / ton" },
    deliveryLocation: {
      city: { type: String, required: true },
      state: { type: String, required: true },
      latitude: { type: Number },
      longitude: { type: Number },
      coordinatesConfirmed: { type: Boolean, default: false },
      region: { type: String, default: "Western India" },
    },
    timing: {
      type: String,
      enum: ["Recurring", "Monthly", "Weekly", "One-time"],
      default: "Recurring",
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    buyerUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["Active", "Fulfilled", "Archived"],
      default: "Active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Requirement", requirementSchema);
