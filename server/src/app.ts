import cors from "cors";
import express from "express";
import { errorHandler } from "./middleware/errorHandler.middleware";
import { extractionRouter } from "./routes/extraction.routes";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use("/api", extractionRouter);
  app.use(errorHandler);

  return app;
}
