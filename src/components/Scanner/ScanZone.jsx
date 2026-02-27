import { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { useCamera } from "../../hooks/useCamera";
import { useScanner } from "../../hooks/useScanner";
import CameraView from "./CameraView";
import ImagePreview from "./ImagePreview";

// scanFn: optional override — async (base64, apiKey) => parsedObject
// label: optional header text override
export default function ScanZone({ onOCRSuccess, apiKey, scanFn, label }) {
  const [image, setImage]           = useState(null);
  const [showRaw, setShowRaw]       = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const { isActive, videoRef, startCamera, stopCamera, captureFrame, error: cameraError } = useCamera();
  const { isScanning, error, isQuota, result, hasLastImage, scan, retry, clearScanner } = useScanner();

  const noApiKey = !apiKey;

  // Single entry point for every scan trigger (file, camera, drag-drop)
  const handleScan = useCallback((base64) => {
    scan(base64, apiKey, scanFn, onOCRSuccess);
  }, [scan, apiKey, scanFn, onOCRSuccess]);

  const handleFileInput = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target.result);
      stopCamera();
      handleScan(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCapture = useCallback(() => {
    const frame = captureFrame();
    if (frame) {
      setImage(frame);
      stopCamera();
      handleScan(frame);
    }
  }, [captureFrame, handleScan, stopCamera]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileInput(e.dataTransfer.files[0]);
  };

  const clearImage = () => {
    setImage(null);
    clearScanner();
  };

  return (
    <div className="card space-y-4">
      <p className="section-header">{label || "Step 1: Scan Dispatch Tag"}</p>

      {noApiKey && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-sm text-amber-400">
          Add your Gemini API key in{" "}
          <Link to="/settings" className="underline hover:text-amber-300 font-medium">Settings</Link>{" "}
          to enable OCR scanning. You can still fill fields manually below.
        </div>
      )}

      {cameraError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
          {cameraError}
        </div>
      )}

      {isActive ? (
        <CameraView videoRef={videoRef} onCapture={handleCapture} onClose={stopCamera} />
      ) : image ? (
        <ImagePreview src={image} onClear={clearImage} />
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            isDragging ? "border-amber-500 bg-amber-500/5" : "border-[#3A3A3C] hover:border-[#4A4A4C]"
          }`}
        >
          <div className="text-4xl mb-3">📷</div>
          <p className="text-slate-500 dark:text-gray-400 text-sm mb-4">
            Drag &amp; drop a tag image here, or use the buttons below
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={startCamera}
              disabled={noApiKey}
              className="btn-primary flex items-center gap-2"
              title={noApiKey ? "Configure Gemini API key first" : ""}
            >
              <span>📸</span> Open Camera
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary flex items-center gap-2"
            >
              <span>📁</span> Upload Image
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileInput(e.target.files[0])}
          />
        </div>
      )}

      {/* ── Scanning indicator ── */}
      {isScanning && (
        <div className="flex items-center gap-3 bg-slate-100 dark:bg-[#2C2C2E] rounded-lg p-3">
          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
          <span className="text-sm text-amber-600 dark:text-amber-400">Analyzing image with Gemini AI…</span>
        </div>
      )}

      {/* ── Success panel ── */}
      {!isScanning && result && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-green-600 dark:text-green-400 text-sm font-medium">✓ OCR Data Extracted Successfully</span>
            <button
              onClick={() => setShowRaw(!showRaw)}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 underline"
            >
              {showRaw ? "Hide" : "Show"} raw output
            </button>
          </div>
          {showRaw && (
            <pre className="text-xs text-slate-600 dark:text-gray-400 font-mono bg-slate-100 dark:bg-[#141416] rounded p-2 overflow-auto max-h-40">
              {result}
            </pre>
          )}
          {/* Rescan after success */}
          {hasLastImage && (
            <button
              onClick={retry}
              className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-gray-500 hover:text-amber-500 dark:hover:text-amber-400 transition-colors mt-1"
            >
              <RefreshCw className="w-3 h-3" />
              Re-scan this image
            </button>
          )}
        </div>
      )}

      {/* ── Error panel with Retry ── */}
      {!isScanning && error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 space-y-2">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>

          {isQuota ? (
            <p className="text-xs text-slate-500 dark:text-gray-500">
              API quota exceeded. Wait a moment before retrying — the app will automatically
              fall back to Gemini 1.5 Flash when you retry.
            </p>
          ) : (
            <p className="text-xs text-slate-500 dark:text-gray-500">
              You can retry the scan or fill all fields manually below.
            </p>
          )}

          <div className="flex items-center gap-3 pt-1">
            {hasLastImage && (
              <button
                onClick={retry}
                disabled={isScanning}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg
                           border border-slate-300 dark:border-[#3A3A3C]
                           text-slate-700 dark:text-gray-300
                           hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400
                           transition-colors disabled:opacity-50"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Scan
              </button>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-slate-500 dark:text-gray-500 hover:text-slate-700 dark:hover:text-gray-300 underline"
            >
              Upload a different image
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileInput(e.target.files[0])}
            />
          </div>
        </div>
      )}
    </div>
  );
}
