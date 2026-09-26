import { Camera } from "@phosphor-icons/react";
import { useId, useState, type ChangeEvent } from "react";

interface PhotoUploadProps {
  onSubmit: (file: File) => void;
}

export function PhotoUpload({ onSubmit }: PhotoUploadProps) {
  const inputId = useId();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  }

  function handleSubmit() {
    if (selectedFile) {
      onSubmit(selectedFile);
    }
  }

  return (
    <div className="photo-upload">
      <header className="app-header">
        <Camera size={32} weight="regular" aria-hidden="true" />
        <h1>PillPal</h1>
      </header>
      <p className="subtitle">
        Take a photo of your prescription label to get plain-language instructions.
      </p>

      <input
        id={inputId}
        className="visually-hidden-input"
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
      />
      <label htmlFor={inputId} className="photo-upload__dropzone">
        <Camera size={40} weight="regular" aria-hidden="true" />
        <span className="photo-upload__dropzone-label">
          {selectedFile ? selectedFile.name : "Choose or take a photo"}
        </span>
        <span className="photo-upload__dropzone-hint">JPEG, PNG, WEBP, or HEIC</span>
      </label>

      {previewUrl && (
        <img className="photo-upload__preview" src={previewUrl} alt="Selected prescription label" />
      )}

      <button type="button" disabled={!selectedFile} onClick={handleSubmit}>
        Read my label
      </button>
    </div>
  );
}
