const Resource = require("../models/Resource");
const Company = require("../models/Company");
const { sanitizeResourceForViewer } = require("../middleware/auth");

// @desc    Get all resources with rich industrial filters
// @route   GET /api/resources
const getResources = async (req, res) => {
  try {
    const {
      search,
      category,
      stateOfMatter,
      region,
      availability,
      minPrice,
      maxPrice,
      processingRequired,
      evidenceStatus,
      identityVisibility,
      sellingMethod,
      sellerOnly,
    } = req.query;

    const query = { status: "Active" };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { "properties.name": { $regex: search, $options: "i" } },
        { "properties.value": { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    if (category && category !== "All") {
      query.category = category;
    }

    if (stateOfMatter && stateOfMatter !== "All") {
      query.stateOfMatter = stateOfMatter;
    }

    if (region && region !== "All") {
      query["location.region"] = region;
    }

    if (availability && availability !== "All") {
      query.availability = availability;
    }

    if (minPrice || maxPrice) {
      query.basePrice = {};
      if (minPrice) query.basePrice.$gte = Number(minPrice);
      if (maxPrice) query.basePrice.$lte = Number(maxPrice);
    }

    if (processingRequired !== undefined && processingRequired !== "All") {
      query.processingRequired = processingRequired === "true";
    }

    if (evidenceStatus && evidenceStatus !== "All") {
      query["materialPassport.evidenceStatus"] = evidenceStatus;
    }

    if (identityVisibility && identityVisibility !== "All") {
      query.identityVisibility = identityVisibility;
    }

    if (sellingMethod && sellingMethod !== "All") {
      query.sellingMethod = sellingMethod;
    }

    // If user requests only their own company's resources
    if (sellerOnly === "true" && req.user && req.user.company) {
      delete query.status; // allow seeing inactive/under deal too
      query.seller = req.user.company._id;
    }

    const resources = await Resource.find(query)
      .populate("seller", "name industry location verificationStatus isDefaultConfidential")
      .sort({ createdAt: -1 });

    const viewerCompanyId = req.user?.company?._id || req.user?.company;

    const sanitizedResources = resources.map((r) =>
      sanitizeResourceForViewer(r, viewerCompanyId)
    );

    res.json({
      success: true,
      count: sanitizedResources.length,
      resources: sanitizedResources,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single resource by ID with full passport
// @route   GET /api/resources/:id
const getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id).populate(
      "seller",
      "name industry location verificationStatus gstNumber website logo"
    );

    if (!resource) {
      return res.status(404).json({ success: false, message: "Resource not found" });
    }

    const viewerCompanyId = req.user?.company?._id || req.user?.company;
    const sanitized = sanitizeResourceForViewer(resource, viewerCompanyId);

    res.json({ success: true, resource: sanitized });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new industrial listing
// @route   POST /api/resources
const createResource = async (req, res) => {
  try {
    const {
      title,
      category,
      stateOfMatter,
      description,
      quantity,
      unit,
      availability,
      location,
      basePrice,
      negotiationRange,
      sellingMethod,
      processingRequired,
      processingDetails,
      properties,
      materialPassport,
      identityVisibility,
      images,
      tags,
    } = req.body;

    let sellerId = req.user?.company?._id;
    if (!sellerId) {
      // Find a default seller company
      const defaultCompany = await Company.findOne({ roleType: { $in: ["Producer", "Both"] } });
      sellerId = defaultCompany?._id;
    }

    const resource = await Resource.create({
      title,
      category: category || "By-product",
      stateOfMatter: stateOfMatter || "Solid",
      description,
      quantity: Number(quantity),
      unit: unit || "tons/month",
      availability: availability || "Available Recurring",
      location: location || {
        region: "Western India",
        city: "Nagpur",
        state: "Maharashtra",
        approxDistanceKm: 65,
      },
      basePrice: Number(basePrice),
      negotiationRange: negotiationRange || {
        minPrice: Math.round(Number(basePrice) * 0.9),
        preferredPrice: Number(basePrice),
        maxPrice: Math.round(Number(basePrice) * 1.1),
      },
      sellingMethod: sellingMethod || "Price Negotiation",
      processingRequired: processingRequired === true || processingRequired === "true",
      processingDetails: processingDetails || "Crushing and mechanical screening required",
      properties: properties || [],
      materialPassport: materialPassport || {
        sourceStatus: "Verified Continuous Blast Stream",
        preparation: "Water-quenched & milled",
        testDate: new Date(),
        evidenceStatus: "Verified Lab Report",
        summary: "Trace elemental assay confirmed compliant with environmental guidelines.",
      },
      identityVisibility: identityVisibility || "Confidential",
      images: images || [],
      tags: tags || [],
      seller: sellerId,
      sellerUser: req.user?._id,
    });

    const populated = await Resource.findById(resource._id).populate("seller");

    res.status(201).json({
      success: true,
      resource: populated,
      message: "Resource listed successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getResources,
  getResourceById,
  createResource,
};
