const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipientCompany: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    recipientUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      required: true,
      enum: [
        "PRICE_REQUEST_RECEIVED",
        "PRICE_REQUEST_ACCEPTED",
        "PRICE_REQUEST_REJECTED",
        "COUNTER_PRICE_RECEIVED",
        "FINAL_PRICE_AGREED",
        "NEW_AI_OPPORTUNITY",
        "ASSESSMENT_BLOCKER",
        "PAYMENT_REQUIRED",
        "PAYMENT_COMPLETED",
        "DISPATCH_CONFIRMED",
        "DELIVERY_CONFIRMED",
        "QUALITY_CONFIRMED",
        "QUALITY_DISCREPANCY",
        "EXCHANGE_COMPLETED",
      ],
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    actionLabel: { type: String, default: "Review" },
    actionLink: { type: String, default: "/dashboard" },
    metadata: {
      dealId: { type: mongoose.Schema.Types.ObjectId, ref: "Deal" },
      resourceId: { type: mongoose.Schema.Types.ObjectId, ref: "Resource" },
      priceRequestId: { type: mongoose.Schema.Types.ObjectId, ref: "PriceRequest" },
      amount: Number,
    },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
