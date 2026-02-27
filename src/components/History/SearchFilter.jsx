export default function SearchFilter({ search, onSearch, dateFrom, dateTo, onDateFrom, onDateTo, onClear }) {
  return (
    <div className="card space-y-3">
      <div className="flex gap-3 flex-wrap">
        <input
          className="input-field flex-1 min-w-[180px] text-sm"
          placeholder="Search by slip no, customer, batch..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
        <input
          type="date"
          className="input-field text-sm w-36"
          value={dateFrom}
          onChange={(e) => onDateFrom(e.target.value)}
        />
        <input
          type="date"
          className="input-field text-sm w-36"
          value={dateTo}
          onChange={(e) => onDateTo(e.target.value)}
        />
        {(search || dateFrom || dateTo) && (
          <button onClick={onClear} className="btn-secondary text-sm">
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
