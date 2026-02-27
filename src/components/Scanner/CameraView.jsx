export default function CameraView({ videoRef, onCapture, onClose }) {
  return (
    <div className="relative rounded-xl overflow-hidden border-2 border-amber-500 bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full max-h-72 object-cover"
      />
      {/* Viewfinder corners */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-amber-400 rounded-tl" />
        <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-amber-400 rounded-tr" />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-amber-400 rounded-bl" />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-amber-400 rounded-br" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-3 flex gap-2 bg-gradient-to-t from-black/80">
        <button onClick={onCapture} className="flex-1 btn-primary py-2 text-sm">
          Capture &amp; Scan
        </button>
        <button onClick={onClose} className="btn-secondary px-3 py-2 text-sm">
          Cancel
        </button>
      </div>
    </div>
  );
}
