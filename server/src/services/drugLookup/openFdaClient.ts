import { fetchJson } from "./httpTimeout";

interface OpenFdaLabelResult {
  openfda?: {
    brand_name?: string[];
    generic_name?: string[];
  };
  boxed_warning?: string[];
  drug_interactions?: string[];
  warnings?: string[];
  warnings_and_cautions?: string[];
  contraindications?: string[];
}

interface OpenFdaLabelResponse {
  results?: OpenFdaLabelResult[];
}

export interface OpenFdaLabelFields {
  brandName: string | null;
  genericName: string | null;
  boxedWarning: string[];
  drugInteractions: string[];
  warnings: string[];
  contraindications: string[];
}

export type OpenFdaLookupResult =
  | { status: "matched"; fields: OpenFdaLabelFields }
  | { status: "no_match" }
  | { status: "failed" };

// Looks up a single drug's own FDA label by its precise RxNorm concept ID.
// Deliberately does not fall back to a fuzzy name search on a miss — that
// risks returning a different (e.g. combo) product's label.
export async function fetchLabelByRxcui(rxcui: string): Promise<OpenFdaLookupResult> {
  const query = encodeURIComponent(`openfda.rxcui:"${rxcui}"`);
  const url = `https://api.fda.gov/drug/label.json?search=${query}&limit=1`;
  const result = await fetchJson<OpenFdaLabelResponse>(url);

  if (!result.reached) {
    return { status: "failed" };
  }
  // openFDA uses a real HTTP 404 to mean "no matching label" — that's a
  // confident no-match, not a failure.
  if (result.status === 404) {
    return { status: "no_match" };
  }
  if (result.status !== 200) {
    return { status: "failed" };
  }

  const label = result.data.results?.[0];
  if (!label) {
    return { status: "no_match" };
  }

  return {
    status: "matched",
    fields: {
      brandName: label.openfda?.brand_name?.[0] ?? null,
      genericName: label.openfda?.generic_name?.[0] ?? null,
      boxedWarning: label.boxed_warning ?? [],
      drugInteractions: label.drug_interactions ?? [],
      warnings: label.warnings ?? label.warnings_and_cautions ?? [],
      contraindications: label.contraindications ?? [],
    },
  };
}
