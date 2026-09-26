import { Warning } from "@phosphor-icons/react";

interface LowConfidenceBannerProps {
  reasons: string[];
}

export function LowConfidenceBanner({ reasons }: LowConfidenceBannerProps) {
  return (
    <div className="low-confidence-banner" role="alert">
      <Warning size={24} weight="fill" className="low-confidence-banner__icon" aria-hidden="true" />
      <div>
        <strong>We couldn't read this label clearly.</strong>
        <p>Please double-check the details below with your pharmacist before relying on them.</p>
        {reasons.length > 0 && (
          <ul>
            {reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
