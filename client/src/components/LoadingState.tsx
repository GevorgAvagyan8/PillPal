export function LoadingState() {
  return (
    <div className="loading-state" role="status" aria-live="polite" aria-busy="true">
      <div className="loading-state__spinner" aria-hidden="true" />
      <p>Reading your label…</p>
    </div>
  );
}
