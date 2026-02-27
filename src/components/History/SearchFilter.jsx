import { Search } from "lucide-react";

export default function SearchFilter({ search, onSearch, dateFrom, dateTo, onDateFrom, onDateTo, onClear, placeholder }) {
  const hasFilters = search || dateFrom || dateTo;
  return (
    <div className="flex gap-2.5 flex-wrap items-center">
      {/* Search with icon */}
      <div className="relative flex-1 min-w-[220px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-500 pointer-events-none" />
        <input
          className="input-field pl-9 text-sm h-10"
          placeholder={placeholder ?? "Search by slip no, customer, batch…"}
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      {/* Date from */}
      <input
        type="date"
        className="input-field text-sm w-36 h-10"
        value={dateFrom}
        onChange={(e) => onDateFrom(e.target.value)}
      />

      {/* Date to */}
      <input
        type="date"
        className="input-field text-sm w-36 h-10"
        value={dateTo}
        onChange={(e) => onDateTo(e.target.value)}
      />

      {hasFilters && (
        <button onClick={onClear} className="btn-secondary text-sm h-10 px-4">
          Clear
        </button>
      )}
    </div>
  );
}
