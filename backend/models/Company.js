const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, unique: true, sparse: true },
    industry: {
      type: String,
      required: true,
      enum: [
        "Steel & Metallurgy",
        "Cement & Construction",
        "Chemical & Petrochemicals",
        "Power & Thermal Generation",
        "Pulp & Paper",
        "Automotive & Foundry",
        "Ceramics & Minerals",
        "Agriculture & Bio-processing",
        "Other",
      ],
      default: "Steel & Metallurgy",
    },
    description: { type: String, default: "" },
    location: {
      address: { type: String, default: "" },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, default: "India" },
      region: { type: String, default: "Western India" },
      coordinates: {
        lat: { type: Number, default: 19.076 },
        lng: { type: Number, default: 72.8777 },
      },
    },
    verificationStatus: {
      type: String,
      enum: ["Not Verified", "Under Review", "Verified"],
      default: "Verified",
    },
    verificationDocuments: [
      {
        title: String,
        fileUrl: String,
        verifiedAt: Date,
      },
    ],
    gstNumber: { type: String, default: "27AAACR1234F1Z8" },
    website: { type: String, default: "" },
    logo: { type: String, default: "" },
    roleType: {
      type: String,
      enum: ["Producer", "Consumer", "Both"],
      default: "Both",
    },
    isDefaultConfidential: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Company", companySchema);
