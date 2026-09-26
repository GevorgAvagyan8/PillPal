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

export type ExtractionScenario = "default" | "lowConfidence" | "damaged";

export interface VisionExtractionService {
  extract(
    imageBuffer: Buffer,
    mimeType: string,
    scenario?: ExtractionScenario
  ): Promise<ExtractedMedication>;
}

// Thrown when a label can't be read at all (e.g. damaged/blank photo), as opposed
// to being read with low confidence — callers surface this as a 422, not a partial result.
export class VisionExtractionError extends Error {}
