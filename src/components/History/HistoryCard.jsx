import { formatDate } from "../../utils/formatters";

export default function HistoryCard({ slip, onView, onDelete }) {
  const statusColors = {
    dispatched: "bg-green-500/20 text-green-400",
    pending: "bg-amber-500/20 text-amber-400",
    cancelled: "bg-red-500/20 text-red-400",
  };

  return (
    <div className="card hover:border-[#4A4A4C] transition-colors cursor-pointer" onClick={onView}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="slip-number text-sm">{slip.slipNumber}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[slip.status] || statusColors.dispatched}`}>
              {slip.status || "dispatched"}
            </span>
          </div>
          <div className="font-medium text-gray-200 truncate">{slip.customerName || "—"}</div>
          <div className="text-sm text-gray-500 truncate">{slip.itemDescription || "—"}</div>
          <div className="text-xs text-gray-600 mt-1">{formatDate(slip.createdAt)}</div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="text-gray-600 hover:text-red-400 transition-colors text-lg flex-shrink-0"
          title="Delete"
        >
          ×
        </button>
      </div>
    </div>
  );
}
