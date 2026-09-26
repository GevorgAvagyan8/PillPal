// Mirrors server/src/types/extraction.ts and
// server/src/services/vision/visionExtraction.types.ts. Keep these hand-synced
// until a shared package is worth the setup cost.

export interface FrequencyStructured {
  timesPerDay: number | null;
  intervalHours: number | null;
  withFood: boolean | null;
  timeOfDay: ("morning" | "afternoon" | "evening" | "night" | "bedtime")[];
}

export interface ExtractedMedication {
  drugName: { raw: string; normalized: string | null; confidence: number };
  dosage: { amount: string; unit: string; confidence: number };
  frequency: {
    timesPerDay: number | null;
    structured: FrequencyStructured;
    raw: string;
    confidence: number;
  };
  route: string | null;
  warnings: { text: string; confidence: number }[];
  quantity: { count: number | null; raw: string | null };
}

export interface ExtractionResponse {
  id: string;
  extracted: ExtractedMedication;
  plainLanguage: { summary: string; warnings: string[] };
  needsReview: boolean;
  reviewReasons: string[];
  interactions: null;
  pictogram: null;
  audio: null;
  createdAt: string;
}
