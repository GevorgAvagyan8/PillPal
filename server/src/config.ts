import "dotenv/config";

export const config = {
  port: Number(process.env.PORT ?? 3001),
  maxUploadMb: Number(process.env.MAX_UPLOAD_MB ?? 8),
  visionProvider: process.env.VISION_PROVIDER ?? "stub",
};
