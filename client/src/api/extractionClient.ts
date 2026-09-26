import type { ExtractionResponse } from "../types/extraction";

export type ExtractionScenario = "default" | "lowConfidence" | "damaged";

export async function postPrescriptionPhoto(
  file: File,
  scenario: ExtractionScenario = "default"
): Promise<ExtractionResponse> {
  const formData = new FormData();
  formData.append("photo", file);

  const query = scenario === "default" ? "" : `?scenario=${scenario}`;
  const response = await fetch(`/api/extraction${query}`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = body?.error?.message ?? "Something went wrong reading your label.";
    throw new Error(message);
  }

  return response.json();
}
