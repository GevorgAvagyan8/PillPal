import { Router } from "express";
import { uploadPhoto } from "../middleware/upload.middleware";
import { runExtractionPipeline } from "../pipeline/extractionPipeline";
import type { ExtractionScenario } from "../services/vision/visionExtraction.types";

const VALID_SCENARIOS: ExtractionScenario[] = ["default", "lowConfidence", "damaged"];

export const extractionRouter = Router();

extractionRouter.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

extractionRouter.post("/extraction", uploadPhoto, async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: { code: "MISSING_PHOTO", message: "No photo was uploaded." } });
      return;
    }

    const requestedScenario = req.query.scenario;
    const scenario = VALID_SCENARIOS.includes(requestedScenario as ExtractionScenario)
      ? (requestedScenario as ExtractionScenario)
      : "default";

    const result = await runExtractionPipeline(req.file.buffer, req.file.mimetype, scenario);
    res.json(result);
  } catch (err) {
    next(err);
  }
});
