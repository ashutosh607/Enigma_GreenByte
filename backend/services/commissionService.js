const CommissionConfig = require("../models/CommissionConfig");

/**
 * Calculates platform fee based on active dynamic tiers or base config
 */
async function calculateCommission(dealAmount) {
  let config = await CommissionConfig.findOne({ isActive: true });
  if (!config) {
    config = await CommissionConfig.create({
      name: "Standard Industrial Circular Tier",
      baseRatePercent: 3.5,
      minFee: 2500,
      maxCapFee: 75000,
      tiers: [
        { minAmount: 0, maxAmount: 500000, ratePercent: 4.0 },
        { minAmount: 500000, maxAmount: 2500000, ratePercent: 3.0 },
        { minAmount: 2500000, maxAmount: 10000000, ratePercent: 2.0 },
      ],
      isActive: true,
    });
  }

  let ratePercent = config.baseRatePercent;

  if (config.tiers && config.tiers.length > 0) {
    for (const tier of config.tiers) {
      if (dealAmount >= tier.minAmount && (tier.maxAmount === 0 || dealAmount <= tier.maxAmount)) {
        ratePercent = tier.ratePercent;
        break;
      }
    }
  }

  let rawFee = Math.round((dealAmount * ratePercent) / 100);

  // Apply minimum fee floor and maximum cap ceiling
  if (config.minFee && rawFee < config.minFee) {
    rawFee = config.minFee;
  }
  if (config.maxCapFee && rawFee > config.maxCapFee) {
    rawFee = config.maxCapFee;
  }

  return {
    dealAmount,
    ratePercent,
    platformFee: rawFee,
    minFeeApplied: rawFee === config.minFee,
    capApplied: rawFee === config.maxCapFee,
    supplierReceivable: Math.max(0, dealAmount - rawFee),
    configId: config._id,
  };
}

module.exports = { calculateCommission };
