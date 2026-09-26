import { Warning } from "@phosphor-icons/react";
import type { DrugInteractionInfo } from "../types/extraction";

interface InteractionInfoProps {
  data: DrugInteractionInfo | null;
}

function Section({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) {
    return null;
  }
  return (
    <div className="interaction-info__section">
      <h4>{title}</h4>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export function InteractionInfo({ data }: InteractionInfoProps) {
  if (!data) {
    return null;
  }

  if (data.lookupStatus === "no_rxnorm_match" || data.lookupStatus === "no_fda_label_match") {
    return (
      <div className="interaction-info interaction-info--status">
        No FDA label match was found for this medication — check with your pharmacist about interactions and
        warnings.
      </div>
    );
  }

  if (data.lookupStatus === "lookup_failed") {
    return (
      <div className="interaction-info interaction-info--status">
        Couldn't check FDA interaction data right now. Try again later, or ask your pharmacist.
      </div>
    );
  }

  const matchedName = data.matchedGenericName ?? data.matchedBrandName;
  const hasAnyContent =
    data.boxedWarning.length > 0 ||
    data.drugInteractions.length > 0 ||
    data.warnings.length > 0 ||
    data.contraindications.length > 0;

  if (!hasAnyContent) {
    return null;
  }

  return (
    <div className="interaction-info">
      {data.boxedWarning.length > 0 && (
        <div className="interaction-info__boxed-warning" role="alert">
          <Warning size={22} weight="fill" aria-hidden="true" />
          <div>
            <strong>FDA Boxed Warning</strong>
            <ul>
              {data.boxedWarning.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <Section title="Drug Interactions" items={data.drugInteractions} />
      <Section title="Warnings and Precautions" items={data.warnings} />
      <Section title="Contraindications" items={data.contraindications} />

      <p className="interaction-info__source">
        Source: FDA label via openFDA{matchedName ? ` for ${matchedName}` : ""}.
      </p>
    </div>
  );
}
