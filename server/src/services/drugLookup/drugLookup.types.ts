// "skipped_low_confidence" isn't a status here — the pipeline represents
// that case as `interactions: null` instead of calling the lookup at all.
export type DrugLookupStatus = "matched" | "no_rxnorm_match" | "no_fda_label_match" | "lookup_failed";

export interface DrugInteractionInfo {
  source: "openFDA";
  lookupStatus: DrugLookupStatus;
  rxcui: string | null;
  matchedBrandName: string | null;
  matchedGenericName: string | null;
  boxedWarning: string[];
  drugInteractions: string[];
  warnings: string[];
  contraindications: string[];
}
