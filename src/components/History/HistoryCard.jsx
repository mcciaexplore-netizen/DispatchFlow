import { X } from "lucide-react";
import { formatDate } from "../../utils/formatters";

export default function HistoryCard({ slip, onView, onDelete }) {
  const statusColors = {
    dispatched: "bg-green-50 text-green-700 ring-1 ring-green-200 dark:bg-green-500/20 dark:text-green-400 dark:ring-0",
    pending:    "bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:ring-0",
    cancelled:  "bg-red-50   text-red-700   ring-1 ring-red-200   dark:bg-red-500/20   dark:text-red-400   dark:ring-0",
  };

  return (
    <div className="card hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-[#4A4A4C] transition-all duration-200 cursor-pointer" onClick={onView}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="slip-number text-sm">{slip.slipNumber}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[slip.status] || statusColors.dispatched}`}>
              {slip.status || "dispatched"}
            </span>
          </div>
          <div className="font-medium text-slate-800 dark:text-gray-200 truncate">{slip.customerName || "—"}</div>
          <div className="text-sm text-slate-500 dark:text-gray-500 truncate">{slip.itemDescription || "—"}</div>
          <div className="text-xs text-slate-400 dark:text-gray-600 mt-1">{formatDate(slip.createdAt)}</div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="text-slate-400 dark:text-gray-600 hover:text-red-500 transition-colors flex-shrink-0 p-0.5 rounded"
          title="Delete"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
