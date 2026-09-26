import { Warning } from "@phosphor-icons/react";
import type { ExtractionResponse } from "../types/extraction";
import { ConfirmationPanel } from "./ConfirmationPanel";
import { LowConfidenceBanner } from "./LowConfidenceBanner";

interface ResultsViewProps {
  data: ExtractionResponse;
  onStartOver: () => void;
}

export function ResultsView({ data, onStartOver }: ResultsViewProps) {
  return (
    <div className="results-view">
      {data.needsReview && <LowConfidenceBanner reasons={data.reviewReasons} />}

      <h2>Here's what your label says</h2>
      <p className="results-view__summary">{data.plainLanguage.summary}</p>

      {data.plainLanguage.warnings.length > 0 && (
        <div className="results-view__warnings">
          <h3>
            <Warning size={20} weight="bold" aria-hidden="true" />
            Warnings
          </h3>
          <ul>
            {data.plainLanguage.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      <ConfirmationPanel extracted={data.extracted} />

      <button type="button" className="button--secondary" onClick={onStartOver}>
        Scan another label
      </button>
    </div>
  );
}
