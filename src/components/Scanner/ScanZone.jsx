import { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { useCamera } from "../../hooks/useCamera";
import { scanDispatchTag } from "../../services/geminiOCR";
import { parseOCRResponse } from "../../services/parseOCRResponse";
import CameraView from "./CameraView";
import ImagePreview from "./ImagePreview";

// scanFn: optional override — async (base64, apiKey) => parsedObject
// label: optional header text override
export default function ScanZone({ onOCRSuccess, apiKey, scanFn, label }) {
  const [scanning, setScanning] = useState(false);
  const [image, setImage] = useState(null);
  const [ocrResult, setOcrResult] = useState(null);
  const [error, setError] = useState(null);
  const [showRaw, setShowRaw] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const { isActive, videoRef, startCamera, stopCamera, captureFrame, error: cameraError } = useCamera();

  const noApiKey = !apiKey;

  const runOCR = async (base64Image) => {
    if (!apiKey) return;
    setScanning(true);
    setError(null);
    setOcrResult(null);
    try {
      let parsed;
      if (scanFn) {
        // Custom scan function (e.g. invoice OCR) — expected to return already-parsed object
        parsed = await scanFn(base64Image, apiKey);
      } else {
        const raw = await scanDispatchTag(base64Image, apiKey);
        parsed = parseOCRResponse(raw);
      }
      setOcrResult(JSON.stringify(parsed, null, 2));
      onOCRSuccess(parsed);
    } catch (err) {
      setError(err.message || "OCR failed. You can fill fields manually.");
    } finally {
      setScanning(false);
    }
  };

  const handleFileInput = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target.result);
      stopCamera();
      runOCR(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCapture = useCallback(() => {
    const frame = captureFrame();
    if (frame) {
      setImage(frame);
      stopCamera();
      runOCR(frame);
    }
  }, [captureFrame]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileInput(file);
  };

  const clearImage = () => {
    setImage(null);
    setOcrResult(null);
    setError(null);
  };

  return (
    <div className="card space-y-4">
      <p className="section-header">{label || "Step 1: Scan Dispatch Tag"}</p>

      {noApiKey && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-sm text-amber-400">
          Add your Gemini API key in{" "}
          <Link to="/settings" className="underline hover:text-amber-300 font-medium">
            Settings
          </Link>{" "}
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
          <p className="text-gray-400 text-sm mb-4">Drag &amp; drop a tag image here, or use the buttons below</p>
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

      {scanning && (
        <div className="flex items-center gap-3 bg-[#2C2C2E] rounded-lg p-3">
          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-amber-400">Scanning tag... Extracting data</span>
        </div>
      )}

      {!scanning && ocrResult && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-green-400 text-sm font-medium">✓ OCR Data Extracted Successfully</span>
            <button
              onClick={() => setShowRaw(!showRaw)}
              className="text-xs text-gray-400 hover:text-gray-200 underline"
            >
              {showRaw ? "Hide" : "Show"} raw output
            </button>
          </div>
          {showRaw && (
            <pre className="text-xs text-gray-400 font-mono bg-[#141416] rounded p-2 overflow-auto max-h-40">
              {ocrResult}
            </pre>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
          {error}
          <span className="block mt-1 text-gray-500">You can still fill all fields manually below.</span>
        </div>
      )}
    </div>
  );
}
