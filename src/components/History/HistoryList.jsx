import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import SearchFilter from "./SearchFilter";
import HistoryCard from "./HistoryCard";

export default function HistoryList() {
  const [slips, setSlips] = useLocalStorage("dispatchflow_slips", []);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const navigate = useNavigate();

  const filtered = slips.filter((slip) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      slip.slipNumber?.toLowerCase().includes(q) ||
      slip.customerName?.toLowerCase().includes(q) ||
      slip.batchLotNumber?.toLowerCase().includes(q) ||
      slip.itemDescription?.toLowerCase().includes(q);

    const slipDate = new Date(slip.createdAt).toISOString().slice(0, 10);
    const matchFrom = !dateFrom || slipDate >= dateFrom;
    const matchTo = !dateTo || slipDate <= dateTo;

    return matchSearch && matchFrom && matchTo;
  });

  const handleDelete = (slipNumber) => {
    if (window.confirm(`Delete slip ${slipNumber}?`)) {
      setSlips((prev) => prev.filter((s) => s.slipNumber !== slipNumber));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Dispatch History</h2>
        <span className="text-sm text-gray-500">{filtered.length} slip{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      <SearchFilter
        search={search}
        onSearch={setSearch}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFrom={setDateFrom}
        onDateTo={setDateTo}
        onClear={() => { setSearch(""); setDateFrom(""); setDateTo(""); }}
      />

      {filtered.length === 0 ? (
        <div className="card text-center py-12 text-gray-500">
          {slips.length === 0 ? (
            <>
              <div className="text-4xl mb-3">📋</div>
              <p>No dispatch slips yet.</p>
              <button onClick={() => navigate("/create")} className="btn-primary mt-4 text-sm">
                Create your first slip
              </button>
            </>
          ) : (
            <p>No slips match your search.</p>
          )}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((slip) => (
            <HistoryCard
              key={slip.slipNumber}
              slip={slip}
              onView={() => navigate(`/history/${slip.slipNumber}`)}
              onDelete={() => handleDelete(slip.slipNumber)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
