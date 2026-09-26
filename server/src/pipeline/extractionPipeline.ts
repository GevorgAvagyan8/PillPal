import { randomUUID } from "crypto";
import { lookupDrugInteractions } from "../services/drugLookup/drugLookup";
import { getVisionExtractionService } from "../services/vision/visionExtraction";
import type { ExtractedMedication, ExtractionScenario } from "../services/vision/visionExtraction.types";
import type { ExtractionResponse, PlainLanguageSummary } from "../types/extraction";

const LOW_CONFIDENCE_THRESHOLD = 0.6;

function buildPlainLanguageSummary(extracted: ExtractedMedication): PlainLanguageSummary {
  const name = extracted.drugName.normalized ?? extracted.drugName.raw;
  const summary = `Take ${extracted.dosage.amount}${extracted.dosage.unit} of ${name}. ${extracted.frequency.raw}.`;
  return { summary, warnings: extracted.warnings.map((warning) => warning.text) };
}

function assessReview(extracted: ExtractedMedication): { needsReview: boolean; reviewReasons: string[] } {
  const reasons: string[] = [];
  if (extracted.drugName.confidence < LOW_CONFIDENCE_THRESHOLD) {
    reasons.push("Drug name could not be read with confidence.");
  }
  if (extracted.dosage.confidence < LOW_CONFIDENCE_THRESHOLD) {
    reasons.push("Dosage amount could not be read with confidence.");
  }
  if (extracted.frequency.confidence < LOW_CONFIDENCE_THRESHOLD) {
    reasons.push("Dosing frequency could not be read with confidence.");
  }
  return { needsReview: reasons.length > 0, reviewReasons: reasons };
}

// Orchestrates the pipeline: image -> vision extraction -> plain language.
// Future phases (interaction check, pictogram, TTS) slot in here, each
// filling in the currently-null field of ExtractionResponse.
export async function runExtractionPipeline(
  imageBuffer: Buffer,
  mimeType: string,
  scenario?: ExtractionScenario
): Promise<ExtractionResponse> {
  const visionService = getVisionExtractionService();
  const extracted = await visionService.extract(imageBuffer, mimeType, scenario);
  const plainLanguage = buildPlainLanguageSummary(extracted);
  const { needsReview, reviewReasons } = assessReview(extracted);

  // Skip the lookup entirely on a garbled drug name rather than risk
  // attaching a different drug's FDA label/interaction data.
  const interactions =
    extracted.drugName.confidence >= LOW_CONFIDENCE_THRESHOLD
      ? await lookupDrugInteractions(extracted.drugName)
      : null;

  return {
    id: randomUUID(),
    extracted,
    plainLanguage,
    needsReview,
    reviewReasons,
    interactions,
    pictogram: null,
    audio: null,
    createdAt: new Date().toISOString(),
  };
}
