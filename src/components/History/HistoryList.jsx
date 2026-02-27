import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList } from "lucide-react";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { useSearchFilter } from "../../hooks/useSearchFilter";
import { LS_KEYS } from "../../utils/constants";
import { CardGridSkeleton } from "../ui/Skeleton";
import SearchFilter from "./SearchFilter";
import HistoryCard from "./HistoryCard";

export default function HistoryList() {
  const [slips, setSlips] = useLocalStorage(LS_KEYS.SLIPS, []);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(t);
  }, []);
  const navigate = useNavigate();

  const { search, setSearch, dateFrom, setDateFrom, dateTo, setDateTo, filtered, clear } =
    useSearchFilter(slips, (slip, q) =>
      slip.slipNumber?.toLowerCase().includes(q) ||
      slip.customerName?.toLowerCase().includes(q) ||
      slip.batchLotNumber?.toLowerCase().includes(q) ||
      slip.itemDescription?.toLowerCase().includes(q)
    );

  const handleDelete = (slipNumber) => {
    if (window.confirm(`Delete slip ${slipNumber}?`)) {
      setSlips((prev) => prev.filter((s) => s.slipNumber !== slipNumber));
    }
  };

  if (isLoading) return <CardGridSkeleton count={6} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dispatch History</h1>
        <span className="text-sm text-slate-500 font-medium">{filtered.length} slip{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      <SearchFilter
        search={search}
        onSearch={setSearch}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFrom={setDateFrom}
        onDateTo={setDateTo}
        onClear={clear}
      />

      {filtered.length === 0 ? (
        <div className="card text-center py-12 text-gray-500">
          {slips.length === 0 ? (
            <>
              <div className="flex justify-center mb-3">
                <ClipboardList className="w-10 h-10 text-slate-300 dark:text-gray-600" />
              </div>
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
