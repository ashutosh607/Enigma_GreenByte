const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ["By-product", "Residual", "Waste", "Secondary Material"],
      default: "By-product",
    },
    stateOfMatter: {
      type: String,
      enum: ["Solid", "Liquid", "Slurry", "Gas"],
      default: "Solid",
    },
    description: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, default: "tons/month" },
    availability: {
      type: String,
      enum: ["Available Recurring", "Recurring", "One-time Batch", "Spot Available"],
      default: "Available Recurring",
    },
    location: {
      region: { type: String, default: "Western India" },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, default: "India" },
      approxDistanceKm: { type: Number, default: 85 },
      coordinates: {
        lat: { type: Number, default: 19.076 },
        lng: { type: Number, default: 72.8777 },
      },
    },
    basePrice: { type: Number, required: true },
    unitPriceUnit: { type: String, default: "₹ / ton" },
    negotiationRange: {
      minPrice: { type: Number, required: true },
      preferredPrice: { type: Number, required: true },
      maxPrice: { type: Number, required: true },
    },
    sellingMethod: {
      type: String,
      enum: ["Price Negotiation", "Fixed Price", "Direct Agreement", "Auction"],
      default: "Price Negotiation",
    },
    processingRequired: { type: Boolean, default: false },
    processingDetails: {
      type: String,
      default: "Standard crushing and screening recommended prior to aggregation.",
    },
    properties: [
      {
        name: { type: String, required: true },
        value: { type: String, required: true },
        unit: { type: String, default: "" },
      },
    ],
    materialPassport: {
      sourceStatus: { type: String, default: "Verified Industrial Stream" },
      preparation: { type: String, default: "Air-cooled & Granulated" },
      testDate: { type: Date, default: Date.now },
      labReportUrl: { type: String, default: "/docs/lab-analysis-cert.pdf" },
      evidenceStatus: {
        type: String,
        enum: ["Available", "Pending", "Verified Lab Report"],
        default: "Verified Lab Report",
      },
      summary: {
        type: String,
        default: "NABL certified batch testing confirms composition stability and low leachable heavy metals.",
      },
    },
    identityVisibility: {
      type: String,
      enum: ["Open", "Confidential"],
      default: "Confidential",
    },
    images: [{ type: String }],
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    sellerUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["Active", "Under Deal", "Depleted"],
      default: "Active",
    },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resource", resourceSchema);
