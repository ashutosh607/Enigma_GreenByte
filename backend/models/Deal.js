const mongoose = require("mongoose");

const dealSchema = new mongoose.Schema(
  {
    dealNumber: {
      type: String,
      required: true,
      unique: true,
      default: () => "DL-" + Math.floor(100000 + Math.random() * 900000),
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
    buyerUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    sellerUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource",
      required: true,
    },
    opportunity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Opportunity",
    },
    quantity: { type: Number, required: true },
    unit: { type: String, default: "tons" },
    originalPrice: { type: Number, required: true },
    currentNegotiatedPrice: { type: Number, required: true },
    finalAgreedPrice: { type: Number },
    status: {
      type: String,
      enum: [
        "Deal Initiated",
        "Introduction",
        "Assessment",
        "Price Negotiation",
        "Agreement",
        "Payment Pending",
        "Payment Completed",
        "Dispatch",
        "In Transit",
        "Delivery",
        "Quality Confirmation",
        "Exchange Completed",
        "Cancelled",
      ],
      default: "Deal Initiated",
    },
    confidentiality: {
      isConfidentialToBuyer: { type: Boolean, default: true },
      isConfidentialToSeller: { type: Boolean, default: false },
    },
    terms: {
      processingOwner: {
        type: String,
        default: "Buyer arrangements with certified local processor",
      },
      transportOwner: {
        type: String,
        default: "Platform designated bulk logistics carrier",
      },
      deliverySchedule: {
        type: String,
        default: "Bi-weekly staggered dispatches of 150 tons",
      },
      paymentTerms: {
        type: String,
        default: "100% Escrow deposit via RE:SOURCE Gateway prior to dispatch",
      },
      qualityAcceptanceCriteria: {
        type: String,
        default: "Moisture < 4%, Free Lime < 3%, Granulometry 0-10mm",
      },
    },
    costs: {
      materialSubtotal: { type: Number, default: 0 },
      processingCost: { type: Number, default: 0 },
      transportCost: { type: Number, default: 0 },
      platformFee: { type: Number, default: 0 },
      commissionRate: { type: Number, default: 3.5 },
      totalPayable: { type: Number, default: 0 },
      supplierReceivable: { type: Number, default: 0 },
    },
    priceRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PriceRequest",
    },
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assessment",
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
    exchange: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exchange",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Deal", dealSchema);
