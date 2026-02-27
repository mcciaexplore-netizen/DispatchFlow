import { X } from "lucide-react";

/**
 * GenericHistoryCard — a single card shell shared by:
 *   • HistoryCard (dispatch slips)
 *   • InvoiceCard (InvoiceHistoryPage)
 *
 * Props:
 *   id           {string}        — Mono ID shown in amber (slip no / invoice ID)
 *   badge        {ReactElement}  — Status badge element
 *   primaryText  {string}        — Bold primary line (customer name / vendor name)
 *   secondaryText{string}        — Smaller secondary line (item / buyer)
 *   tertiaryText {string}        — Date or extra info (bottom left)
 *   trailingText {string}        — Right-aligned text (₹ amount, etc.)
 *   action       {ReactElement}  — Optional full-width button row below the card body
 *   onView       {Function}      — Card click handler
 *   onDelete     {Function}      — X button click handler
 */
export default function GenericHistoryCard({
  id,
  badge,
  primaryText,
  secondaryText,
  tertiaryText,
  trailingText,
  action,
  onView,
  onDelete,
}) {
  return (
    <div
      className="card hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-[#4A4A4C] transition-all duration-200 cursor-pointer"
      onClick={onView}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left content */}
        <div className="flex-1 min-w-0">
          {/* ID + badge row */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-mono text-amber-500 dark:text-amber-400 font-semibold text-xs">
              {id}
            </span>
            {badge}
          </div>

          {primaryText && (
            <div className="font-medium text-slate-800 dark:text-gray-200 truncate text-sm">
              {primaryText}
            </div>
          )}
          {secondaryText && (
            <div className="text-xs text-slate-500 dark:text-gray-500 truncate">
              {secondaryText}
            </div>
          )}
          {tertiaryText && (
            <div className="text-xs text-slate-400 dark:text-gray-600 mt-1">
              {tertiaryText}
            </div>
          )}
        </div>

        {/* Right: trailing text + delete */}
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          {trailingText && (
            <span className="font-mono text-sm font-semibold text-slate-800 dark:text-gray-100">
              {trailingText}
            </span>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="text-slate-400 dark:text-gray-600 hover:text-red-500 transition-colors p-0.5 rounded"
            title="Delete"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Optional action row (e.g. "Mark as Paid") */}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
