const mongoose = require("mongoose");

const priceRequestSchema = new mongoose.Schema(
  {
    dealId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deal",
      required: true,
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource",
    },
    originalPrice: { type: Number, required: true },
    requestedMinPrice: { type: Number, required: true },
    requestedMaxPrice: { type: Number, required: true },
    requestedPriceType: {
      type: String,
      enum: ["single", "range"],
      default: "single",
    },
    counterPrice: { type: Number },
    counterMinPrice: { type: Number },
    counterMaxPrice: { type: Number },
    finalAgreedPrice: { type: Number },
    quantity: { type: Number, required: true },
    unit: { type: String, default: "tons" },
    originalTotalValue: { type: Number },
    requestedTotalValueMin: { type: Number },
    requestedTotalValueMax: { type: Number },
    status: {
      type: String,
      enum: [
        "PENDING",
        "ACCEPTED",
        "REJECTED",
        "COUNTERED",
        "BUYER_REVIEW",
        "FINAL_AGREED",
        "EXPIRED",
      ],
      default: "PENDING",
    },
    history: [
      {
        actorRole: { type: String, enum: ["buyer", "seller", "system"] },
        action: {
          type: String,
          enum: [
            "REQUEST_SUBMITTED",
            "COUNTER_OFFERED",
            "ACCEPTED",
            "REJECTED",
            "FINALIZED",
          ],
        },
        price: Number,
        minPrice: Number,
        maxPrice: Number,
        note: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("PriceRequest", priceRequestSchema);
