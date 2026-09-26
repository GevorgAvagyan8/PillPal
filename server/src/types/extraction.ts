import type { ExtractedMedication } from "../services/vision/visionExtraction.types";

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
  interactions: null; // seam: future openFDA/RxNorm phase fills this in
  pictogram: null; // seam: future pictogram phase fills this in
  audio: null; // seam: future TTS phase fills this in
  createdAt: string;
}
