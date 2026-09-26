import { Warning } from "@phosphor-icons/react";
import { useState } from "react";
import { postPrescriptionPhoto } from "./api/extractionClient";
import { LoadingState } from "./components/LoadingState";
import { PhotoUpload } from "./components/PhotoUpload";
import { ResultsView } from "./components/ResultsView";
import type { ExtractionResponse } from "./types/extraction";

type AppState =
  | { status: "idle" }
  | { status: "uploading" }
  | { status: "success"; data: ExtractionResponse }
  | { status: "error"; message: string };

function App() {
  const [state, setState] = useState<AppState>({ status: "idle" });

  async function handleSubmit(file: File) {
    setState({ status: "uploading" });
    try {
      const data = await postPrescriptionPhoto(file);
      setState({ status: "success", data });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setState({ status: "error", message });
    }
  }

  function handleStartOver() {
    setState({ status: "idle" });
  }

  return (
    <main className="app">
      {state.status === "idle" && <PhotoUpload onSubmit={handleSubmit} />}
      {state.status === "uploading" && <LoadingState />}
      {state.status === "success" && <ResultsView data={state.data} onStartOver={handleStartOver} />}
      {state.status === "error" && (
        <div className="error-state" role="alert">
          <Warning size={40} weight="fill" aria-hidden="true" />
          <p>{state.message}</p>
          <button type="button" onClick={handleStartOver}>
            Try again
          </button>
        </div>
      )}
    </main>
  );
}

export default App;
