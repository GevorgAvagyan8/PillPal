import { fetchJson } from "./httpTimeout";

interface ApproximateTermResponse {
  approximateGroup?: {
    candidate?: { rxcui: string; name: string; score: string }[];
  };
}

export interface RxNormMatch {
  rxcui: string;
  matchedName: string;
}

export type RxNormLookupResult =
  | { status: "matched"; match: RxNormMatch }
  | { status: "no_match" }
  | { status: "failed" };

// Resolves fuzzy, OCR-style text (e.g. "Lisinopril 10mg Tab") to a precise
// RxNorm concept. "no_match" (RxNorm reached, nothing found) is reported
// separately from "failed" (network/timeout) — callers must not fall back
// to a fuzzier search on either, that could match the wrong drug.
export async function normalizeDrugName(term: string): Promise<RxNormLookupResult> {
  const url = `https://rxnav.nlm.nih.gov/REST/approximateTerm.json?term=${encodeURIComponent(term)}&maxEntries=1`;
  const result = await fetchJson<ApproximateTermResponse>(url);

  if (!result.reached || result.status !== 200) {
    return { status: "failed" };
  }

  const candidate = result.data.approximateGroup?.candidate?.[0];
  if (!candidate?.rxcui) {
    return { status: "no_match" };
  }

  return { status: "matched", match: { rxcui: candidate.rxcui, matchedName: candidate.name } };
}
