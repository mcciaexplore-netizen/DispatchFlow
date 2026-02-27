export default function ImagePreview({ src, onClear }) {
  if (!src) return null;
  return (
    <div className="relative rounded-xl overflow-hidden border border-[#3A3A3C]">
      <img src={src} alt="Scanned tag" className="w-full max-h-64 object-contain bg-[#141416]" />
      <button
        onClick={onClear}
        className="absolute top-2 right-2 bg-[#1C1C1E]/80 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg transition-colors"
        title="Clear image"
      >
        ×
      </button>
    </div>
  );
}
