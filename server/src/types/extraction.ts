import type { ExtractedMedication } from "../services/vision/visionExtraction.types";
import type { DrugInteractionInfo } from "../services/drugLookup/drugLookup.types";

export interface PlainLanguageSummary {
  summary: string;
  warnings: string[];
}

// Also mirrored in client/src/types/extraction.ts — keep the two hand-synced
// until a shared package is worth the setup cost.
export interface ExtractionResponse {
  id: string;
  extracted: ExtractedMedication;
  plainLanguage: PlainLanguageSummary;
  needsReview: boolean;
  reviewReasons: string[];
  // null only when skipped because drugName confidence was too low to
  // safely look up — see LOW_CONFIDENCE_THRESHOLD in extractionPipeline.ts.
  interactions: DrugInteractionInfo | null;
  pictogram: null; // seam: future pictogram phase fills this in
  audio: null; // seam: future TTS phase fills this in
  createdAt: string;
}
