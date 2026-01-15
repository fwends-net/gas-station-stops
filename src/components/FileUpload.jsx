import { useCallback } from 'react';

export default function FileUpload({ onFileLoad, isLoading }) {
  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      const file = e.dataTransfer?.files[0];
      if (file && file.name.endsWith('.gpx')) {
        readFile(file);
      }
    },
    [onFileLoad]
  );

  const handleFileSelect = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (file) {
        readFile(file);
      }
    },
    [onFileLoad]
  );

  const readFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      onFileLoad(e.target.result, file.name);
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div
      className="file-upload"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="upload-content">
        <span className="upload-icon">📂</span>
        <p>Drag & drop a GPX file here</p>
        <p className="upload-or">or</p>
        <label className="upload-button">
          Browse Files
          <input
            type="file"
            accept=".gpx"
            onChange={handleFileSelect}
            disabled={isLoading}
          />
        </label>
      </div>
    </div>
  );
}
