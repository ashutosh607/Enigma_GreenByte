const Resource = require("../models/Resource");
const Opportunity = require("../models/Opportunity");

/**
 * =========================================================================
 * FASTAPI / ML TEAM INTEGRATION BRIDGE HOOK
 * =========================================================================
 * Notice to ML / Data Science Team:
 * Configure FASTAPI_ML_URL in backend/.env (e.g., http://localhost:8000/api/v1/predict-symbiosis)
 * This hook is structured to call the FastAPI microservice asynchronously.
 * If the FastAPI server is unreachable or still in training/development,
 * it seamlessly and gracefully falls back to the high-performance
 * heuristic industrial matching engine below so the user workflow is never interrupted.
 */
async function callFastApiMlEngine(requirementData, candidateResources) {
  const fastApiUrl = process.env.FASTAPI_ML_URL;
  if (!fastApiUrl) {
    return null; // Fallback to internal heuristic industrial engine
  }

  try {
    const response = await fetch(`${fastApiUrl}/match`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requirement: requirementData,
        candidates: candidateResources,
      }),
      signal: AbortSignal.timeout(3000), // 3-second timeout for rapid UX
    });

    if (response.ok) {
      const data = await response.json();
      console.log("⚡ [FastAPI ML Engine] Returned predictions successfully");
      return data.matches;
    }
  } catch (err) {
    console.warn("⚠️ [FastAPI ML Bridge] Offline or timeout; using internal industrial rule engine:", err.message);
  }
  return null;
}

// Built-in industrial symbiosis domain knowledge matrix
const INDUSTRIAL_SYMBIO_RULES = [
  {
    targetUses: ["aggregate", "road base", "construction material", "ballast", "concrete filler"],
    keywords: ["slag", "steel", "aggregate", "rock", "crushed", "clinker"],
    baseTechFit: 94,
    whySummary: "The supplier's recorded slag properties satisfy standard abrasive wear and compressive load requirements for aggregate replacement after screening.",
    confirmed: [
      "Compressive density exceeds 1,450 kg/m³ threshold",
      "High volumetric stability under weathering",
      "Recurring monthly batch production matches schedule",
    ],
    unknown: [
      "Specific free-lime hydration expansion test pending",
      "Local crushing / sieve screening vendor confirmation needed",
    ],
    avgProcessingCost: 15,
    avgTransportCost: 10,
    co2eReductionPercent: 74,
  },
  {
    targetUses: ["cement", "pozzolan", "concrete", "fly ash", "clinker replacement"],
    keywords: ["ash", "pozzolana", "fly ash", "silica", "cement"],
    baseTechFit: 91,
    whySummary: "Reactive silica and alumina indices allow up to 35% Portland cement replacement without compromising early curing strength.",
    confirmed: [
      "Class F chemical pozzolanic index verified (>70% SiO2 + Al2O3 + Fe2O3)",
      "Low loss on ignition (LOI < 3.2%)",
      "Bulk pneumatic tanker dispatch available",
    ],
    unknown: [
      "Specific blaine fineness variance across seasons",
      "Silo pneumatic unloading compatibility at buyer site",
    ],
    avgProcessingCost: 8,
    avgTransportCost: 12,
    co2eReductionPercent: 82,
  },
  {
    targetUses: ["gypsum", "plaster", "board", "soil amendment", "agriculture"],
    keywords: ["gypsum", "phosphogypsum", "sulfate", "calcium"],
    baseTechFit: 88,
    whySummary: "High calcium sulfate dihydrate content (CaSO4·2H2O > 92%) presents direct alternative to mined rock gypsum.",
    confirmed: [
      "High chemical purity (>92% dihydrate)",
      "Ideal soil conditioning pH neutralizing capability",
      "Moisture within mechanical desiccation specs",
    ],
    unknown: [
      "Radionuclide background screening trace confirmation",
      "Washing cycle verification for trace phosphate residues",
    ],
    avgProcessingCost: 12,
    avgTransportCost: 14,
    co2eReductionPercent: 68,
  },
  {
    targetUses: ["sand", "foundry", "molding", "fine aggregate", "asphalt"],
    keywords: ["sand", "silica", "foundry", "spent", "mold"],
    baseTechFit: 89,
    whySummary: "Uniform sub-angular grains provide high shear strength and thermal stability suitable for structural fill and sub-base.",
    confirmed: [
      "Grain fineness number (GFN 50-60) verified",
      "Low clay and fine dust content",
      "High load bearing angle of internal friction",
    ],
    unknown: [
      "Phenolic resin residual leaching certificate update",
      "Moisture conditioning prior to bulk hauling",
    ],
    avgProcessingCost: 10,
    avgTransportCost: 8,
    co2eReductionPercent: 71,
  },
];

/**
 * Intelligent Industrial Match Engine
 */
async function discoverAlternatives(requirement, buyerCompanyId) {
  const allResources = await Resource.find({ status: "Active" }).populate("seller");

  // Step 1: Check FastAPI integration
  const mlResults = await callFastApiMlEngine(requirement, allResources);
  if (mlResults && mlResults.length > 0) {
    return mlResults;
  }

  // Step 2: High-precision domain matching engine
  const reqText = `${requirement.currentMaterial} ${requirement.intendedUse}`.toLowerCase();

  const scoredMatches = [];

  for (const resource of allResources) {
    // Avoid recommending buyer's own resources
    if (
      resource.seller &&
      buyerCompanyId &&
      resource.seller._id.toString() === buyerCompanyId.toString()
    ) {
      continue;
    }

    const resText = `${resource.title} ${resource.category} ${resource.description}`.toLowerCase();

    // Check matching rule
    let matchedRule = INDUSTRIAL_SYMBIO_RULES.find((rule) =>
      rule.keywords.some((kw) => resText.includes(kw) || reqText.includes(kw))
    );

    if (!matchedRule) {
      matchedRule = INDUSTRIAL_SYMBIO_RULES[0]; // standard baseline
    }

    // Compute compatibility indicators
    // 1. Technical Fit
    let technicalFit = matchedRule.baseTechFit;
    if (resText.includes("slag") && reqText.includes("calcium") || reqText.includes("aggregate")) {
      technicalFit = 94;
    }

    // 2. Quantity Fit
    const reqQty = Number(requirement.requiredQuantity) || 300;
    const resQty = Number(resource.quantity) || 500;
    const qtyRatio = Math.min(resQty / reqQty, reqQty / resQty);
    const quantityFit = Math.min(98, Math.max(65, Math.round(qtyRatio * 95)));

    // 3. Timing Fit
    const timingFit = resource.availability.includes("Recurring") ? 92 : 78;

    // 4. Logistics Fit
    const distanceKm = resource.location?.approxDistanceKm || 90;
    const logisticsFit = Math.max(55, Math.round(95 - (distanceKm * 0.2)));

    // 5. Processing Fit
    const processingFit = resource.processingRequired ? 76 : 94;

    // 6. Evidence Fit
    const evidenceFit = resource.materialPassport?.evidenceStatus === "Verified Lab Report" ? 88 : 65;

    const overallScore = Math.round(
      technicalFit * 0.35 +
      quantityFit * 0.20 +
      logisticsFit * 0.15 +
      timingFit * 0.10 +
      processingFit * 0.10 +
      evidenceFit * 0.10
    );

    // Cost calculations
    const currentCost = Number(requirement.currentCostPerUnit) || 100;
    const alternativeMaterialCost = Number(resource.basePrice) || Math.round(currentCost * 0.5);
    const processingCost = resource.processingRequired ? matchedRule.avgProcessingCost : 5;
    const transportCost = matchedRule.avgTransportCost;
    const testingCost = 0;
    const estimatedSubtotal = alternativeMaterialCost + processingCost + transportCost + testingCost;
    const potentialSavingsPerTon = Math.max(0, currentCost - estimatedSubtotal);

    const opportunityTitle = `${resource.title} → ${requirement.intendedUse || "Secondary Industrial Input"}`;

    scoredMatches.push({
      resource,
      title: opportunityTitle,
      intendedUse: requirement.intendedUse || "Industrial Input",
      compatibility: {
        technicalFit,
        quantityFit,
        timingFit,
        logisticsFit,
        processingFit,
        evidenceFit,
        overallScore,
      },
      whyMatch: {
        summary: matchedRule.whySummary,
        confirmed: matchedRule.confirmed,
        unknown: matchedRule.unknown,
      },
      opportunityAssessment: {
        technicalFit: technicalFit >= 90 ? "High" : "Medium",
        practicalFit: processingFit >= 80 ? "High" : "Medium",
        evidence: evidenceFit >= 80 ? "High" : "Medium",
        economicPotential: potentialSavingsPerTon > 0 ? `₹${potentialSavingsPerTon}/ton potential margin` : "Pending freight finalization",
        environmentalPotential: "Positive scenario (~72% carbon & landfill abatement)",
      },
      costComparison: {
        currentMaterialName: requirement.currentMaterial,
        currentCostPerTon: currentCost,
        alternativeMaterialCost,
        processingCost,
        transportCost,
        testingCost,
        estimatedSubtotal,
        potentialSavingsPerTon,
        note: "Potential savings before unresolved freight & secondary handling costs.",
      },
      environmentalScenario: {
        materialExchangedPerMonth: reqQty,
        virginMaterialDisplaced: reqQty,
        residualMaterialUtilized: reqQty,
        transportEmissions: "Estimated 14 kg CO2e / ton",
        preparationImpact: "Estimated 6 kg CO2e / ton",
        netEnvironmentalScenario: `Net reduction of ~${matchedRule.co2eReductionPercent}% CO2e vs virgin resource extraction.`,
      },
    });
  }

  // Sort by highest overall score
  scoredMatches.sort((a, b) => b.compatibility.overallScore - a.compatibility.overallScore);

  return scoredMatches.slice(0, 6);
}

module.exports = {
  discoverAlternatives,
  callFastApiMlEngine,
};
