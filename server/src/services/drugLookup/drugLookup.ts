import { simplifyClinicalText } from "../textSimplification/simplifyClinicalText";
import type { ExtractedMedication } from "../vision/visionExtraction.types";
import type { DrugInteractionInfo } from "./drugLookup.types";
import { fetchLabelByRxcui } from "./openFdaClient";
import { normalizeDrugName } from "./rxnormClient";

const MAX_BULLETS_PER_FIELD = 5;

// openFDA label sections are dense clinical/legal paragraphs — rewrite them
// into short plain-language bullets before they ever reach the client, so
// InteractionInfo.tsx just renders strings without knowing about any of this.
function simplifyField(rawEntries: string[], drugName: string | null): string[] {
  const bullets = rawEntries.flatMap((entry) => simplifyClinicalText(entry, MAX_BULLETS_PER_FIELD, drugName));
  return bullets.slice(0, MAX_BULLETS_PER_FIELD);
}

// Process-lifetime cache, no eviction — cheap reliability/speed win for
// repeat lookups of the same drug during a demo session.
const cache = new Map<string, DrugInteractionInfo>();

// openFDA's openfda.rxcui is tied to a specific dose form (e.g. "Oral
// Tablet"), but RxNorm's approximateTerm resolves plain "<ingredient>
// <strength>" text (no dose form word) to a coarser ingredient+strength
// concept that no label carries — confirmed live: "Metformin HCl 500mg"
// alone has no openFDA match, but "Metformin HCl 500mg Oral Tablet" does.
// Retrying once with the most common oral solid form covers that gap
// without guessing at anything clinical.
const FALLBACK_SUFFIXES = ["", " Oral Tablet"];

function emptyInfo(status: DrugInteractionInfo["lookupStatus"], rxcui: string | null = null): DrugInteractionInfo {
  return {
    source: "openFDA",
    lookupStatus: status,
    rxcui,
    matchedBrandName: null,
    matchedGenericName: null,
    boxedWarning: [],
    drugInteractions: [],
    warnings: [],
    contraindications: [],
  };
}

async function attemptLookup(term: string): Promise<DrugInteractionInfo> {
  const rxnormResult = await normalizeDrugName(term);
  if (rxnormResult.status !== "matched") {
    return emptyInfo(rxnormResult.status === "failed" ? "lookup_failed" : "no_rxnorm_match");
  }

  const { rxcui } = rxnormResult.match;
  const labelResult = await fetchLabelByRxcui(rxcui);
  if (labelResult.status !== "matched") {
    return emptyInfo(labelResult.status === "failed" ? "lookup_failed" : "no_fda_label_match", rxcui);
  }

  const { fields } = labelResult;
  const anchorName = fields.genericName?.toLowerCase() ?? null;
  return {
    source: "openFDA",
    lookupStatus: "matched",
    rxcui,
    matchedBrandName: fields.brandName,
    matchedGenericName: fields.genericName,
    boxedWarning: simplifyField(fields.boxedWarning, anchorName),
    drugInteractions: simplifyField(fields.drugInteractions, anchorName),
    warnings: simplifyField(fields.warnings, anchorName),
    contraindications: simplifyField(fields.contraindications, anchorName),
  };
}

export async function lookupDrugInteractions(drugName: ExtractedMedication["drugName"]): Promise<DrugInteractionInfo> {
  // Use the fuller raw OCR text (e.g. "Lisinopril 10mg Tab"), not the
  // cleaned-up ingredient name — RxNorm's approximateTerm only resolves to
  // openFDA's product-level rxcui when given dosage/form text like this.
  const term = drugName.raw;
  const cached = cache.get(term);
  if (cached) {
    return cached;
  }

  let result = emptyInfo("no_rxnorm_match");
  for (const suffix of FALLBACK_SUFFIXES) {
    result = await attemptLookup(term + suffix);
    if (result.lookupStatus === "matched") {
      break;
    }
  }

  cache.set(term, result);
  return result;
}
