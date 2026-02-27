import { useState, useRef, useCallback, useEffect } from "react";

export function useCamera() {
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const videoRef = useRef(null);

  // Assign the stream to the video element AFTER React has rendered it.
  // This fixes the race condition where srcObject was set before CameraView mounted.
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {}); // autoPlay may need an explicit play() call
    }
  }, [stream, isActive]); // re-runs once isActive flips and CameraView is in the DOM

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      setStream(mediaStream);
      setIsActive(true);
      // NOTE: srcObject assignment moved to the useEffect above
    } catch (err) {
      const msg =
        err.name === "NotAllowedError"
          ? "Camera permission denied. Please allow camera access and try again."
          : err.name === "NotFoundError"
          ? "No camera found on this device."
          : "Camera error: " + (err.message || "Unknown error");
      setError(msg);
      setIsActive(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsActive(false);
  }, [stream]);

  const captureFrame = useCallback(() => {
    if (!videoRef.current) return null;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 1280;
    canvas.height = videoRef.current.videoHeight || 720;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.9);
  }, []);

  return { stream, error, isActive, videoRef, startCamera, stopCamera, captureFrame };
}
