const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
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
    transactionAmount: { type: Number, required: true },
    platformFee: { type: Number, required: true },
    commissionRate: { type: Number, default: 3.5 },
    supplierAmount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    paymentMethod: {
      type: String,
      enum: ["NEFT / RTGS Industrial Escrow", "Direct Gateway", "Corporate Net Banking", "Credit Line"],
      default: "NEFT / RTGS Industrial Escrow",
    },
    gatewayTransactionId: {
      type: String,
      default: () => "TXN-RES-" + Math.floor(10000000 + Math.random() * 90000000),
    },
    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "COMPLETED", "VERIFIED", "FAILED", "REFUNDED"],
      default: "PENDING",
    },
    verifiedAt: { type: Date },
    breakdown: {
      materialSubtotal: { type: Number, required: true },
      processingFee: { type: Number, default: 0 },
      logisticsFee: { type: Number, default: 0 },
      platformFee: { type: Number, required: true },
      gstApplicable: { type: Number, default: 0 },
      totalPayable: { type: Number, required: true },
    },
    auditNotes: { type: String, default: "Verified by RE:SOURCE Automated Settlement Clearinghouse" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
