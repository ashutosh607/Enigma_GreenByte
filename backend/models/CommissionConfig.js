const mongoose = require("mongoose");

const commissionConfigSchema = new mongoose.Schema(
  {
    name: { type: String, default: "Standard Industrial Circular Tier" },
    baseRatePercent: { type: Number, default: 3.5 }, // 3.5%
    minFee: { type: Number, default: 2500 }, // ₹2,500 minimum platform fee
    maxCapFee: { type: Number, default: 75000 }, // ₹75,000 maximum cap
    tiers: [
      {
        minAmount: { type: Number, default: 0 },
        maxAmount: { type: Number, default: 500000 }, // 0 to 5 Lakhs
        ratePercent: { type: Number, default: 4.0 },
      },
      {
        minAmount: { type: Number, default: 500000 },
        maxAmount: { type: Number, default: 2500000 }, // 5 to 25 Lakhs
        ratePercent: { type: Number, default: 3.0 },
      },
      {
        minAmount: { type: Number, default: 2500000 },
        maxAmount: { type: Number, default: 10000000 }, // 25 Lakhs+
        ratePercent: { type: Number, default: 2.0 },
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CommissionConfig", commissionConfigSchema);
