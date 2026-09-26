import { config } from "../../config";
import { StubVisionExtractionService } from "./visionExtraction.stub";
import type { VisionExtractionService } from "./visionExtraction.types";

let cachedService: VisionExtractionService | null = null;

// Swap seam: once a real Claude API key is available, add a
// ClaudeVisionExtractionService implementing VisionExtractionService in a
// sibling file, branch on config.visionProvider === "claude" below, and set
// VISION_PROVIDER=claude in .env. No caller of getVisionExtractionService()
// needs to change.
export function getVisionExtractionService(): VisionExtractionService {
  if (!cachedService) {
    switch (config.visionProvider) {
      case "stub":
      default:
        cachedService = new StubVisionExtractionService();
        break;
    }
  }
  return cachedService;
}

export type { VisionExtractionService } from "./visionExtraction.types";
