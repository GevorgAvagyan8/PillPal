import { Check, Warning } from "@phosphor-icons/react";
import { useState } from "react";
import type { ExtractedMedication } from "../types/extraction";

type FieldStatus = "unconfirmed" | "confirmed" | "flagged";

interface ConfirmationPanelProps {
  extracted: ExtractedMedication;
}

const FIELDS: { key: string; label: string; getValue: (medication: ExtractedMedication) => string }[] = [
  { key: "drugName", label: "Medication name", getValue: (m) => m.drugName.normalized ?? m.drugName.raw },
  { key: "dosage", label: "Dosage", getValue: (m) => `${m.dosage.amount}${m.dosage.unit}` },
  { key: "frequency", label: "Frequency", getValue: (m) => m.frequency.raw },
];

export function ConfirmationPanel({ extracted }: ConfirmationPanelProps) {
  const [statuses, setStatuses] = useState<Record<string, FieldStatus>>({});

  function toggleStatus(key: string, status: FieldStatus) {
    setStatuses((prev) => ({ ...prev, [key]: prev[key] === status ? "unconfirmed" : status }));
  }

  return (
    <div className="confirmation-panel">
      <h2>Is this right?</h2>
      <ul>
        {FIELDS.map((field) => {
          const status = statuses[field.key] ?? "unconfirmed";
          return (
            <li key={field.key} className={`confirmation-panel__row confirmation-panel__row--${status}`}>
              <span className="confirmation-panel__label">{field.label}:</span>{" "}
              <span className="confirmation-panel__value">{field.getValue(extracted)}</span>
              {status === "confirmed" && (
                <span className="confirmation-panel__status confirmation-panel__status--confirmed">
                  <Check size={16} weight="bold" aria-hidden="true" /> Confirmed
                </span>
              )}
              {status === "flagged" && (
                <span className="confirmation-panel__status confirmation-panel__status--flagged">
                  <Warning size={16} weight="fill" aria-hidden="true" /> Flagged
                </span>
              )}
              <div className="confirmation-panel__actions">
                <button
                  type="button"
                  aria-pressed={status === "confirmed"}
                  onClick={() => toggleStatus(field.key, "confirmed")}
                >
                  Yes, correct
                </button>
                <button
                  type="button"
                  aria-pressed={status === "flagged"}
                  onClick={() => toggleStatus(field.key, "flagged")}
                >
                  Not sure / unclear
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
