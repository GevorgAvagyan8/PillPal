import type {
  ExtractedMedication,
  ExtractionScenario,
  VisionExtractionService,
} from "./visionExtraction.types";
import { VisionExtractionError } from "./visionExtraction.types";

const CANNED_MEDICATIONS: ExtractedMedication[] = [
  {
    drugName: { raw: "Lisinopril 10mg Tab", normalized: "Lisinopril", confidence: 0.97 },
    dosage: { amount: "10", unit: "mg", confidence: 0.95 },
    frequency: {
      timesPerDay: 1,
      structured: { timesPerDay: 1, intervalHours: 24, withFood: false, timeOfDay: ["morning"] },
      raw: "Take 1 tablet by mouth once daily",
      confidence: 0.93,
    },
    route: "oral",
    warnings: [
      { text: "May cause dizziness, especially when standing up quickly.", confidence: 0.88 },
      { text: "Do not take if pregnant or planning to become pregnant.", confidence: 0.9 },
    ],
    quantity: { count: 30, raw: "QTY: 30" },
  },
  {
    drugName: { raw: "Metformin HCl 500mg", normalized: "Metformin", confidence: 0.95 },
    dosage: { amount: "500", unit: "mg", confidence: 0.94 },
    frequency: {
      timesPerDay: 2,
      structured: { timesPerDay: 2, intervalHours: 12, withFood: true, timeOfDay: ["morning", "evening"] },
      raw: "Take 1 tablet by mouth twice daily with food",
      confidence: 0.91,
    },
    route: "oral",
    warnings: [
      { text: "Take with food to reduce stomach upset.", confidence: 0.92 },
      { text: "Contact your doctor if you experience unusual muscle pain or weakness.", confidence: 0.8 },
    ],
    quantity: { count: 60, raw: "QTY: 60" },
  },
  {
    drugName: { raw: "Atorvastatin 20mg", normalized: "Atorvastatin", confidence: 0.96 },
    dosage: { amount: "20", unit: "mg", confidence: 0.93 },
    frequency: {
      timesPerDay: 1,
      structured: { timesPerDay: 1, intervalHours: 24, withFood: false, timeOfDay: ["bedtime"] },
      raw: "Take 1 tablet by mouth once daily at bedtime",
      confidence: 0.9,
    },
    route: "oral",
    warnings: [
      { text: "Avoid grapefruit juice while taking this medication.", confidence: 0.85 },
      { text: "Report any unexplained muscle pain, tenderness, or weakness.", confidence: 0.87 },
    ],
    quantity: { count: 30, raw: "QTY: 30" },
  },
];

function cloneMedication(medication: ExtractedMedication): ExtractedMedication {
  return JSON.parse(JSON.stringify(medication));
}

function applyLowConfidence(medication: ExtractedMedication): ExtractedMedication {
  const degraded = cloneMedication(medication);
  degraded.drugName.confidence = 0.42;
  degraded.drugName.normalized = null;
  degraded.dosage.confidence = 0.38;
  degraded.frequency.confidence = 0.45;
  degraded.warnings = degraded.warnings.map((warning) => ({ ...warning, confidence: 0.4 }));
  return degraded;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelayMs() {
  return 800 + Math.floor(Math.random() * 700);
}

export class StubVisionExtractionService implements VisionExtractionService {
  async extract(
    _imageBuffer: Buffer,
    _mimeType: string,
    scenario: ExtractionScenario = "default"
  ): Promise<ExtractedMedication> {
    await sleep(randomDelayMs());

    if (scenario === "damaged") {
      throw new VisionExtractionError(
        "The label appears damaged or unreadable. Please retake the photo in better lighting."
      );
    }

    const base = CANNED_MEDICATIONS[Math.floor(Math.random() * CANNED_MEDICATIONS.length)];
    return scenario === "lowConfidence" ? applyLowConfidence(base) : cloneMedication(base);
  }
}
