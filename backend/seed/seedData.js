require("dotenv").config({ path: __dirname + "/../.env" });
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Company = require("../models/Company");
const Resource = require("../models/Resource");
const Requirement = require("../models/Requirement");
const Opportunity = require("../models/Opportunity");
const Deal = require("../models/Deal");
const PriceRequest = require("../models/PriceRequest");
const Assessment = require("../models/Assessment");
const Payment = require("../models/Payment");
const Exchange = require("../models/Exchange");
const Notification = require("../models/Notification");
const CommissionConfig = require("../models/CommissionConfig");

async function seed() {
  try {
    await connectDB();
    console.log("Cleaning existing collections...");

    await Promise.all([
      User.deleteMany({}),
      Company.deleteMany({}),
      Resource.deleteMany({}),
      Requirement.deleteMany({}),
      Opportunity.deleteMany({}),
      Deal.deleteMany({}),
      PriceRequest.deleteMany({}),
      Assessment.deleteMany({}),
      Payment.deleteMany({}),
      Exchange.deleteMany({}),
      Notification.deleteMany({}),
      CommissionConfig.deleteMany({}),
    ]);

    console.log("Creating Companies...");
    const [tata, ultratech, gujarat, ecopozz] = await Company.create([
      {
        name: "Tata Metaliks & Foundry Division",
        code: "TATA-MET-01",
        industry: "Steel & Metallurgy",
        description: "Primary blast furnace iron and steel manufacturing with secondary granulated mineral slag streams.",
        location: {
          address: "Kharagpur Integrated Plant, Industrial Sector 4",
          city: "Nagpur",
          state: "Maharashtra",
          region: "Western India",
          coordinates: { lat: 21.1458, lng: 79.0882 },
        },
        verificationStatus: "Verified",
        gstNumber: "27AABCT2341M1Z5",
        roleType: "Producer",
        isDefaultConfidential: true,
      },
      {
        name: "UltraTech Infrastructure & Aggregates",
        code: "UT-INFRA-02",
        industry: "Cement & Construction",
        description: "National road engineering, pre-cast structural concrete and sustainable aggregate blending works.",
        location: {
          address: "Hinjawadi Phase 3 Engineering Hub",
          city: "Pune",
          state: "Maharashtra",
          region: "Western India",
          coordinates: { lat: 18.5204, lng: 73.8567 },
        },
        verificationStatus: "Verified",
        gstNumber: "27AAACU9812K1Z9",
        roleType: "Consumer",
        isDefaultConfidential: false,
      },
      {
        name: "Gujarat Heavy Chemicals & Minerals",
        code: "GHCL-MIN-03",
        industry: "Chemical & Petrochemicals",
        description: "Inorganic basic chemical refining and thermal co-generation residuals.",
        location: {
          address: "Dahej Industrial Corridor, Plot 42",
          city: "Bharuch",
          state: "Gujarat",
          region: "Western India",
          coordinates: { lat: 21.7051, lng: 72.9959 },
        },
        verificationStatus: "Verified",
        gstNumber: "24AABCG5541L1Z2",
        roleType: "Producer",
        isDefaultConfidential: false,
      },
      {
        name: "EcoPozz Mineral Solutions",
        code: "ECOPOZZ-04",
        industry: "Cement & Construction",
        description: "Geopolymer binders, low-carbon mortar research, and secondary pozzolan processing.",
        location: {
          address: "MIDC Industrial Area, Block C",
          city: "Nashik",
          state: "Maharashtra",
          region: "Western India",
          coordinates: { lat: 19.9975, lng: 73.7898 },
        },
        verificationStatus: "Verified",
        gstNumber: "27AAACE4412B1Z7",
        roleType: "Consumer",
        isDefaultConfidential: false,
      },
    ]);

    console.log("Creating Users (Buyer, Seller, Admin)...");
    const buyerUser = await User.create({
      name: "Ashutosh Kadam",
      email: "buyer@resource.com",
      password: "password123",
      role: "buyer",
      company: ultratech._id,
      jobTitle: "Lead Procurement & Materials Director",
    });

    const sellerUser = await User.create({
      name: "Rajesh Varma",
      email: "seller@resource.com",
      password: "password123",
      role: "seller",
      company: tata._id,
      jobTitle: "Industrial By-Product & Sustainability Head",
    });

    const adminUser = await User.create({
      name: "Platform Facilitator",
      email: "admin@resource.com",
      password: "password123",
      role: "admin",
      company: ultratech._id,
      jobTitle: "Senior Industrial Symbiosis Facilitator",
    });

    console.log("Creating Commission Configuration...");
    const commConfig = await CommissionConfig.create({
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

    console.log("Creating Industrial Resources...");
    const [steelSlag, flyAsh, phosphogypsum, foundrySand, ggbsSlag] = await Resource.create([
      {
        title: "Steel Slag",
        category: "By-product",
        stateOfMatter: "Solid",
        description: "Dense, air-cooled weathered metallurgical slag with high mechanical shear resistance. Excellent alternative for aggregate, sub-base construction, and asphalt wear surfaces.",
        quantity: 500,
        unit: "tons / month",
        availability: "Available Recurring",
        location: {
          region: "Western India",
          city: "Nagpur",
          state: "Maharashtra",
          approxDistanceKm: 78,
          coordinates: { lat: 21.1458, lng: 79.0882 },
        },
        basePrice: 60,
        unitPriceUnit: "₹ / ton",
        negotiationRange: {
          minPrice: 54,
          preferredPrice: 60,
          maxPrice: 65,
        },
        sellingMethod: "Price Negotiation",
        processingRequired: true,
        processingDetails: "Mechanical sieve screening to 0-10mm and magnetic separation of metallic iron nodules.",
        properties: [
          { name: "Composition (CaO)", value: "38.5%", unit: "wt%" },
          { name: "Composition (SiO2)", value: "28.2%", unit: "wt%" },
          { name: "Composition (FeO)", value: "19.4%", unit: "wt%" },
          { name: "Bulk Density", value: "1,620", unit: "kg/m³" },
          { name: "Moisture Content", value: "2.8%", unit: "%" },
          { name: "Los Angeles Abrasion", value: "21%", unit: "wt loss" },
        ],
        materialPassport: {
          sourceStatus: "Verified Metallurgical Basic Oxygen Furnace",
          preparation: "Air-cooled, stabilized & magnetic separated",
          testDate: new Date("2026-08-15"),
          labReportUrl: "/docs/lab-analysis-cert.pdf",
          evidenceStatus: "Verified Lab Report",
          summary: "NABL certified batch inspection verifies free lime < 2.5% and compliant TCLP leaching values.",
        },
        identityVisibility: "Confidential",
        seller: tata._id,
        sellerUser: sellerUser._id,
        tags: ["Slag", "Aggregate", "Metallurgy", "Secondary Aggregate", "Paving"],
      },
      {
        title: "Class F Pulverized Fly Ash",
        category: "By-product",
        stateOfMatter: "Solid",
        description: "High-fineness dry electrostatic precipitator pozzolan. Rich in reactive siliceous and aluminous glass, ideal for Portland cement replacement and geopolymer concrete.",
        quantity: 1200,
        unit: "tons / month",
        availability: "Available Recurring",
        location: {
          region: "Western India",
          city: "Dahej",
          state: "Gujarat",
          approxDistanceKm: 140,
          coordinates: { lat: 21.7051, lng: 72.9959 },
        },
        basePrice: 45,
        unitPriceUnit: "₹ / ton",
        negotiationRange: {
          minPrice: 40,
          preferredPrice: 45,
          maxPrice: 52,
        },
        sellingMethod: "Price Negotiation",
        processingRequired: false,
        processingDetails: "None required. Sourced directly from pneumatic dry silos into sealed bulkers.",
        properties: [
          { name: "Reactive SiO2 + Al2O3", value: "76.4%", unit: "wt%" },
          { name: "Loss on Ignition (LOI)", value: "1.9%", unit: "%" },
          { name: "Fineness (Blaine)", value: "340", unit: "m²/kg" },
          { name: "Moisture", value: "0.4%", unit: "%" },
        ],
        materialPassport: {
          sourceStatus: "Supercritical Thermal Generation Unit",
          preparation: "Dry electrostatic precipitator collected",
          testDate: new Date("2026-09-01"),
          labReportUrl: "/docs/flyash-assay.pdf",
          evidenceStatus: "Verified Lab Report",
          summary: "Complies with IS 3812 Part 1 Grade 1 criteria for structural pozzolanic applications.",
        },
        identityVisibility: "Open",
        seller: gujarat._id,
        sellerUser: sellerUser._id,
        tags: ["Fly Ash", "Cement Replacement", "Pozzolan", "Geopolymer"],
      },
      {
        title: "Phosphogypsum Filter Cake",
        category: "Residual",
        stateOfMatter: "Solid",
        description: "High purity calcium sulfate dihydrate residual from wet-process phosphoric acid manufacturing. Suitable for soil remediation, agricultural conditioner, and plasterboard.",
        quantity: 450,
        unit: "tons / month",
        availability: "Recurring",
        location: {
          region: "Western India",
          city: "Bharuch",
          state: "Gujarat",
          approxDistanceKm: 155,
          coordinates: { lat: 21.7051, lng: 72.9959 },
        },
        basePrice: 35,
        unitPriceUnit: "₹ / ton",
        negotiationRange: {
          minPrice: 30,
          preferredPrice: 35,
          maxPrice: 42,
        },
        sellingMethod: "Price Negotiation",
        processingRequired: true,
        processingDetails: "Washing cycle to neutralize trace acidity followed by desiccation.",
        properties: [
          { name: "CaSO4 · 2H2O", value: "93.1%", unit: "wt%" },
          { name: "P2O5 Soluble", value: "0.22%", unit: "wt%" },
          { name: "pH (10% slurry)", value: "4.8", unit: "pH" },
          { name: "Free Moisture", value: "8.5%", unit: "%" },
        ],
        materialPassport: {
          sourceStatus: "Phosphoric Acid Synthesis Wash Table",
          preparation: "Multi-stage counter-current wash filter",
          testDate: new Date("2026-08-20"),
          evidenceStatus: "Verified Lab Report",
          summary: "AERB radioactivity clearance and heavy metal test certificate confirmed.",
        },
        identityVisibility: "Confidential",
        seller: gujarat._id,
        tags: ["Phosphogypsum", "Gypsum", "Agricultural", "Sulfur"],
      },
      {
        title: "Spent Foundry Silica Sand",
        category: "Secondary Material",
        stateOfMatter: "Solid",
        description: "Thermal-reclaimed high silica sub-angular sand from ferrous casting molds. Uniform gradation and superior thermal stability for structural flowable fill and asphalt base.",
        quantity: 350,
        unit: "tons / month",
        availability: "Available Recurring",
        location: {
          region: "Western India",
          city: "Kolhapur",
          state: "Maharashtra",
          approxDistanceKm: 110,
          coordinates: { lat: 16.705, lng: 74.2433 },
        },
        basePrice: 55,
        unitPriceUnit: "₹ / ton",
        negotiationRange: {
          minPrice: 50,
          preferredPrice: 55,
          maxPrice: 62,
        },
        sellingMethod: "Direct Agreement",
        processingRequired: false,
        processingDetails: "Pre-screened and de-dusted at foundry reclamation unit.",
        properties: [
          { name: "SiO2 Purity", value: "92.8%", unit: "wt%" },
          { name: "Grain Fineness (GFN)", value: "54", unit: "AFS" },
          { name: "Clay Content", value: "0.45%", unit: "%" },
          { name: "Acid Demand Value", value: "5.2", unit: "ml" },
        ],
        materialPassport: {
          sourceStatus: "Ferrous Foundry Induction Caster",
          preparation: "Mechanical calcining and dust scrubbing",
          testDate: new Date("2026-07-28"),
          evidenceStatus: "Verified Lab Report",
          summary: "Zero toxic binder residues; complies with non-hazardous solid waste norms.",
        },
        identityVisibility: "Open",
        seller: tata._id,
        tags: ["Silica Sand", "Foundry", "Fine Aggregate", "Sub-base"],
      },
      {
        title: "Blast Furnace Granulated Slag (GGBS)",
        category: "By-product",
        stateOfMatter: "Solid",
        description: "Quenched vitreous glassy iron slag granules with latent hydraulic reactivity for high-durability marine concrete and sulphate-resistant infrastructure.",
        quantity: 800,
        unit: "tons / month",
        availability: "Available Recurring",
        location: {
          region: "Western India",
          city: "Nagpur",
          state: "Maharashtra",
          approxDistanceKm: 85,
          coordinates: { lat: 21.1458, lng: 79.0882 },
        },
        basePrice: 75,
        unitPriceUnit: "₹ / ton",
        negotiationRange: {
          minPrice: 68,
          preferredPrice: 75,
          maxPrice: 84,
        },
        sellingMethod: "Price Negotiation",
        processingRequired: true,
        processingDetails: "Vertical roller mill grinding to blaine fineness > 400 m²/kg.",
        properties: [
          { name: "Glass Content", value: "95.5%", unit: "%" },
          { name: "Basicity Index", value: "1.18", unit: "ratio" },
          { name: "Al2O3", value: "13.2%", unit: "wt%" },
          { name: "Moisture", value: "1.2%", unit: "%" },
        ],
        materialPassport: {
          sourceStatus: "High Pressure Water Quenching Granulator",
          preparation: "Rapid chiller granulation",
          testDate: new Date("2026-08-30"),
          evidenceStatus: "Verified Lab Report",
          summary: "Certified high glass content with active hydraulic index for severe marine exposure.",
        },
        identityVisibility: "Confidential",
        seller: tata._id,
        tags: ["GGBS", "Slag", "Marine Concrete", "Hydraulic Binder"],
      },
    ]);

    console.log("Creating Requirement & AI Opportunity...");
    const requirement = await Requirement.create({
      currentMaterial: "Virgin Calcium Carbonate",
      intendedUse: "Construction Aggregate & Sub-base",
      requiredQuantity: 300,
      unit: "tons / month",
      requiredProperties: [
        { name: "Bulk Density", targetValue: "1,500 kg/m³", tolerance: "±5%" },
        { name: "Moisture", targetValue: "< 3.5%", tolerance: "±0.5%" },
        { name: "Los Angeles Abrasion", targetValue: "< 25%", tolerance: "±2%" },
      ],
      currentCostPerUnit: 100,
      deliveryLocation: {
        city: "Pune",
        state: "Maharashtra",
        region: "Western India",
      },
      timing: "Recurring",
      buyer: ultratech._id,
      buyerUser: buyerUser._id,
    });

    const opportunity = await Opportunity.create({
      title: "Steel Slag → Aggregate",
      intendedUse: "Construction Aggregate & Sub-base",
      requirement: requirement._id,
      resource: steelSlag._id,
      buyer: ultratech._id,
      seller: tata._id,
      compatibility: {
        technicalFit: 94,
        quantityFit: 87,
        timingFit: 91,
        logisticsFit: 82,
        processingFit: 76,
        evidenceFit: 61,
        overallScore: 86,
      },
      whyMatch: {
        summary: "The supplier's recorded properties satisfy several of your stated aggregate requirements after processing. The supplier indicates approximately 500 tons/month of recurring availability, while your requirement is 300 tons/month.",
        confirmed: [
          "Quantity capacity confirmed (500 tons/mo vs 300 tons/mo need)",
          "Material laboratory test report available",
          "Recurring monthly availability verified",
        ],
        unknown: [
          "Specific leachable trace data pending final site water table review",
          "Sample validation required before bulk dispatch",
          "Processing cost quotation subject to local crushing vendor",
        ],
      },
      opportunityAssessment: {
        technicalFit: "High",
        practicalFit: "Medium",
        evidence: "Medium",
        economicPotential: "Pending transport quote",
        environmentalPotential: "Positive scenario",
      },
      costComparison: {
        currentMaterialName: "Virgin material",
        currentCostPerTon: 100,
        alternativeMaterialCost: 50,
        processingCost: 15,
        transportCost: 10,
        testingCost: 0,
        estimatedSubtotal: 75,
        potentialSavingsPerTon: 25,
        note: "Potential savings: ₹25 / usable ton before unresolved costs.",
      },
      environmentalScenario: {
        materialExchangedPerMonth: 300,
        virginMaterialDisplaced: 300,
        residualMaterialUtilized: 300,
        transportEmissions: "Estimated 14 kg CO2e / ton",
        preparationImpact: "Estimated 6 kg CO2e / ton",
        netEnvironmentalScenario: "Estimated 74% net carbon reduction vs virgin quarrying.",
      },
      status: "Shortlisted",
    });

    console.log("Creating Active Pipeline Deals...");
    // DEAL 1: In Structured Price Negotiation
    const deal1 = await Deal.create({
      dealNumber: "DL-2026-0814",
      buyer: ultratech._id,
      seller: tata._id,
      buyerUser: buyerUser._id,
      sellerUser: sellerUser._id,
      resource: steelSlag._id,
      opportunity: opportunity._id,
      quantity: 300,
      unit: "tons",
      originalPrice: 60,
      currentNegotiatedPrice: 56,
      status: "Price Negotiation",
      confidentiality: {
        isConfidentialToBuyer: true,
        isConfidentialToSeller: false,
      },
      costs: {
        materialSubtotal: 300 * 56,
        processingCost: 300 * 15,
        transportCost: 300 * 10,
        platformFee: 672,
        commissionRate: 4.0,
        totalPayable: (300 * 56) + (300 * 15) + (300 * 10) + 672,
        supplierReceivable: (300 * 56) - 672,
      },
    });

    const assess1 = await Assessment.create({
      dealId: deal1._id,
      technicalRequirements: [
        {
          item: "Aggregate Impact Value (AIV)",
          specification: "< 24% for structural road base",
          status: "Passed",
          notes: "Recorded at 18.4% by regional highway lab.",
        },
        {
          item: "Flakiness & Elongation Index",
          specification: "< 15% combined",
          status: "Passed",
          notes: "Crushing circuit yields cubical particles.",
        },
      ],
      evidenceItems: [
        {
          title: "Chemical Assay & Trace Metals",
          documentType: "Lab Report",
          status: "Available",
          fileUrl: "/docs/lab-analysis-cert.pdf",
        },
        {
          title: "Contamination Leaching Data",
          documentType: "TCLP Certificate",
          status: "Required",
          fileUrl: "",
        },
      ],
      sampleRequested: true,
      sampleStatus: "Sample Requested",
      sampleTrackingNumber: "SMPL-IN-9821",
      trialRequired: false,
      blockers: [
        {
          issue: "Contamination evidence is missing",
          owner: "Seller Quality Lab",
          evidenceRequired: "Leachability TCLP Lab Report",
          completionCondition: "Independent third-party lab signoff",
          nextAction: "Upload contamination report",
          isResolved: false,
        },
      ],
      responsiblePerson: "Buyer Technical Team",
      status: "Action Required",
    });

    const priceReq1 = await PriceRequest.create({
      dealId: deal1._id,
      buyerId: ultratech._id,
      sellerId: tata._id,
      resourceId: steelSlag._id,
      originalPrice: 60,
      requestedMinPrice: 55,
      requestedMaxPrice: 57,
      requestedPriceType: "range",
      quantity: 300,
      unit: "tons",
      originalTotalValue: 18000,
      requestedTotalValueMin: 16500,
      requestedTotalValueMax: 17100,
      status: "PENDING",
      history: [
        {
          actorRole: "buyer",
          action: "REQUEST_SUBMITTED",
          price: 56,
          minPrice: 55,
          maxPrice: 57,
          note: "Buyer requested price range between ₹55–₹57 / ton (Midpoint ₹56 / ton).",
          timestamp: new Date(Date.now() - 3600000 * 4),
        },
      ],
    });

    const exchange1 = await Exchange.create({
      dealId: deal1._id,
      status: "Awaiting Dispatch",
    });

    deal1.assessment = assess1._id;
    deal1.priceRequest = priceReq1._id;
    deal1.exchange = exchange1._id;
    await deal1.save();

    // DEAL 2: In Transit / Dispatch
    const deal2 = await Deal.create({
      dealNumber: "DL-2026-0792",
      buyer: ecopozz._id,
      seller: gujarat._id,
      resource: flyAsh._id,
      quantity: 500,
      unit: "tons",
      originalPrice: 45,
      currentNegotiatedPrice: 44,
      finalAgreedPrice: 44,
      status: "In Transit",
      confidentiality: {
        isConfidentialToBuyer: false,
        isConfidentialToSeller: false,
      },
      costs: {
        materialSubtotal: 22000,
        processingCost: 0,
        transportCost: 5000,
        platformFee: 880,
        commissionRate: 4.0,
        totalPayable: 27880,
        supplierReceivable: 21120,
      },
    });

    const payment2 = await Payment.create({
      dealId: deal2._id,
      buyerId: ecopozz._id,
      sellerId: gujarat._id,
      transactionAmount: 27880,
      platformFee: 880,
      commissionRate: 4.0,
      supplierAmount: 21120,
      paymentMethod: "NEFT / RTGS Industrial Escrow",
      status: "VERIFIED",
      verifiedAt: new Date(Date.now() - 3600000 * 24),
      breakdown: {
        materialSubtotal: 22000,
        processingFee: 0,
        logisticsFee: 5000,
        platformFee: 880,
        totalPayable: 27880,
      },
      auditNotes: "Automated RTGS verified by RE:SOURCE Escrow",
    });

    const exchange2 = await Exchange.create({
      dealId: deal2._id,
      dispatchDetails: {
        isDispatched: true,
        actualQuantity: 500,
        unit: "tons",
        dispatchDate: new Date(Date.now() - 3600000 * 12),
        carrierName: "BlueStar Bulk Freight Logistics",
        trackingNumber: "TRK-IND-928172",
        vehicleNumber: "GJ-16-AX-8910",
        driverContact: "+91 94221 00982",
        dispatchNotes: "Dispatched in pressurized bulk dry pneumatic tankers.",
      },
      deliveryDetails: {
        isDelivered: false,
        quantityReceived: 0,
      },
      status: "Dispatched / In Transit",
    });

    deal2.payment = payment2._id;
    deal2.exchange = exchange2._id;
    await deal2.save();

    // DEAL 3: Completed Exchange with Impact
    const deal3 = await Deal.create({
      dealNumber: "DL-2026-0640",
      buyer: ultratech._id,
      seller: tata._id,
      resource: foundrySand._id,
      quantity: 200,
      unit: "tons",
      originalPrice: 55,
      currentNegotiatedPrice: 52,
      finalAgreedPrice: 52,
      status: "Exchange Completed",
      costs: {
        materialSubtotal: 10400,
        processingCost: 0,
        transportCost: 2000,
        platformFee: 2500, // minimum fee applied
        commissionRate: 4.0,
        totalPayable: 14900,
        supplierReceivable: 7900,
      },
    });

    const exchange3 = await Exchange.create({
      dealId: deal3._id,
      dispatchDetails: {
        isDispatched: true,
        actualQuantity: 200,
        unit: "tons",
        dispatchDate: new Date("2026-09-10"),
        carrierName: "Western Heavy Haulers",
        trackingNumber: "TRK-IND-771239",
        vehicleNumber: "MH-14-EA-3321",
      },
      deliveryDetails: {
        isDelivered: true,
        quantityReceived: 200,
        receivedDate: new Date("2026-09-12"),
        receivingFacility: "Pune Pre-cast Yard",
        deliveryCondition: "Optimal",
        receiverName: "S. Deshmukh (Yard Manager)",
      },
      qualityConfirmation: {
        isConfirmed: true,
        status: "Quality Approved",
        labAnalysisBatch: "QC-8841",
        moistureLevelPercent: 1.4,
        purityVerifiedPercent: 94.2,
        confirmedBy: "Quality Engineer S. Patil",
        confirmedAt: new Date("2026-09-13"),
        notes: "Sieve fraction verified 100% compliant with structural flowable fill norms.",
      },
      status: "Exchange Completed",
      completedAt: new Date("2026-09-13"),
    });

    deal3.exchange = exchange3._id;
    await deal3.save();

    console.log("Creating Structured Notifications...");
    await Notification.create([
      {
        recipientCompany: tata._id,
        type: "PRICE_REQUEST_RECEIVED",
        title: "Price Request Received",
        message: "Buyer requested ₹55–₹57 / ton (Current Price: ₹60 / ton) for 300 tons of Steel Slag.",
        actionLabel: "Review",
        actionLink: `/deals/${deal1._id}`,
        metadata: { dealId: deal1._id, priceRequestId: priceReq1._id },
        isRead: false,
      },
      {
        recipientCompany: ultratech._id,
        type: "ASSESSMENT_BLOCKER",
        title: "Assessment Required",
        message: "Contamination evidence is missing for Steel Slag assessment. Lab signoff pending.",
        actionLabel: "Resolve",
        actionLink: `/deals/${deal1._id}`,
        metadata: { dealId: deal1._id },
        isRead: false,
      },
      {
        recipientCompany: ecopozz._id,
        type: "DISPATCH_CONFIRMED",
        title: "Material Dispatched",
        message: "500 tons of Class F Fly Ash dispatched via BlueStar Bulk Freight (Tracking: TRK-IND-928172).",
        actionLabel: "Confirm Receipt",
        actionLink: `/deals/${deal2._id}`,
        metadata: { dealId: deal2._id },
        isRead: false,
      },
      {
        recipientCompany: ultratech._id,
        type: "EXCHANGE_COMPLETED",
        title: "Exchange Completed",
        message: "Deal DL-2026-0640 for 200 tons Foundry Sand completed. Circularity certificate issued.",
        actionLabel: "View Certificate",
        actionLink: `/impact`,
        metadata: { dealId: deal3._id },
        isRead: true,
      },
    ]);

    console.log("✅ Seed database finished successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed Error:", error);
    process.exit(1);
  }
}

seed();
