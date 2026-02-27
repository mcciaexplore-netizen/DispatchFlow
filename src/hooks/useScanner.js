/**
 * useScanner — centralized OCR pipeline hook used by ScanZone.
 *
 * Manages:
 *  - isScanning / error / result state
 *  - Retaining the last captured image so "Retry" re-runs without re-uploading
 *  - Quota / rate-limit error detection with a distinct flag
 *  - Cleanup to prevent duplicate entries on retry
 */
import { useState, useRef, useCallback } from "react";
import { scanDispatchTag } from "../services/geminiOCR";
import { parseOCRResponse } from "../services/parseOCRResponse";

/** Returns true if the error message indicates an API quota / rate-limit hit */
function isQuotaError(msg = "") {
  const lower = msg.toLowerCase();
  return (
    lower.includes("429") ||
    lower.includes("quota") ||
    lower.includes("rate limit") ||
    lower.includes("resource has been exhausted") ||
    lower.includes("too many requests")
  );
}

export function useScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError]           = useState(null);
  const [isQuota, setIsQuota]       = useState(false);
  const [result, setResult]         = useState(null);   // raw JSON string for "show raw" panel

  // Persisted across renders without triggering re-render
  const lastImageRef  = useRef(null);  // base64 of last captured image
  const lastParamsRef = useRef(null);  // { apiKey, scanFn, onSuccess }

  /**
   * Run the OCR pipeline.
   * @param {string}   base64    - image as data-URL or raw base64
   * @param {string}   apiKey    - Gemini API key
   * @param {Function} scanFn    - optional custom scan fn: (base64, apiKey) => parsedObj
   * @param {Function} onSuccess - called with the parsed result on success
   */
  const scan = useCallback(async (base64, apiKey, scanFn, onSuccess) => {
    if (!apiKey) return;

    // Persist inputs so retry() can replay without UI interaction
    lastImageRef.current  = base64;
    lastParamsRef.current = { apiKey, scanFn, onSuccess };

    // Reset all state before each attempt
    setIsScanning(true);
    setError(null);
    setIsQuota(false);
    setResult(null);

    try {
      let parsed;
      if (scanFn) {
        parsed = await scanFn(base64, apiKey);
      } else {
        const raw = await scanDispatchTag(base64, apiKey);
        parsed = parseOCRResponse(raw);
      }
      setResult(JSON.stringify(parsed, null, 2));
      onSuccess?.(parsed);
    } catch (err) {
      const msg = err.message || "OCR failed. Please try again.";
      setIsQuota(isQuotaError(msg));
      setError(msg);
    } finally {
      setIsScanning(false);
    }
  }, []);

  /**
   * Retry the last scan with the same image — no re-upload required.
   * Clears previous error state first to prevent duplicate feedback.
   */
  const retry = useCallback(() => {
    const img    = lastImageRef.current;
    const params = lastParamsRef.current;
    if (!img || !params) return;
    scan(img, params.apiKey, params.scanFn, params.onSuccess);
  }, [scan]);

  /** Full reset — called when the user clears the image */
  const clearScanner = useCallback(() => {
    setError(null);
    setIsQuota(false);
    setResult(null);
    lastImageRef.current  = null;
    lastParamsRef.current = null;
  }, []);

  return {
    isScanning,
    error,
    isQuota,      // true when failure is quota/rate-limit — shows "wait and retry" message
    result,       // raw JSON string for debug panel
    hasLastImage: !!lastImageRef.current,  // true when retry is possible
    scan,
    retry,
    clearScanner,
  };
}
