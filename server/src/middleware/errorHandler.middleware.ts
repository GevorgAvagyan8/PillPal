import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import { VisionExtractionError } from "../services/vision/visionExtraction.types";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof multer.MulterError) {
    const status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    res.status(status).json({ error: { code: err.code, message: err.message } });
    return;
  }

  if (err instanceof VisionExtractionError) {
    res.status(422).json({ error: { code: "EXTRACTION_FAILED", message: err.message } });
    return;
  }

  if (err instanceof Error && err.message === "UNSUPPORTED_FILE_TYPE") {
    res.status(400).json({
      error: { code: "UNSUPPORTED_FILE_TYPE", message: "Please upload a JPEG, PNG, WEBP, or HEIC photo." },
    });
    return;
  }

  console.error(err);
  res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Something went wrong. Please try again." } });
}
