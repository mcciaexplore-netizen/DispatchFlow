import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Receipt, CheckCircle, Clock, AlertCircle, X } from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { LS_KEYS } from "../utils/constants";
import { CardGridSkeleton } from "../components/ui/Skeleton";
import { formatDate } from "../utils/formatters";

// Payment status helpers
function getPaymentStatus(inv) {
  if (inv.paymentStatus === "paid") return "paid";
  if (inv.dueDate) {
    const due = new Date(inv.dueDate);
    due.setHours(23, 59, 59, 999);
    if (due < new Date()) return "overdue";
  }
  return "pending";
}

const STATUS_CONFIG = {
  paid:    { label: "Paid",    cls: "bg-green-500/15 text-green-600 dark:text-green-400",  Icon: CheckCircle },
  pending: { label: "Pending", cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400",  Icon: Clock },
  overdue: { label: "Overdue", cls: "bg-red-500/15   text-red-600   dark:text-red-400",    Icon: AlertCircle },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${cfg.cls}`}>
      <cfg.Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function InvoiceCard({ inv, onView, onDelete, onMarkPaid }) {
  const status = getPaymentStatus(inv);
  return (
    <div className="card hover:border-amber-500/40 transition-colors cursor-pointer" onClick={onView}>
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-amber-500 dark:text-amber-400 font-semibold text-xs">{inv.invoiceId}</span>
          <StatusBadge status={status} />
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="text-slate-400 dark:text-gray-600 hover:text-red-500 transition-colors flex-shrink-0 p-0.5 rounded"
          title="Delete"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Vendor */}
      <div className="font-medium text-slate-800 dark:text-gray-200 truncate text-sm">
        {inv.vendorName || "Unknown Vendor"}
      </div>
      {inv.buyerName && (
        <div className="text-xs text-slate-500 dark:text-gray-500 truncate">
          To: {inv.buyerName}{inv.buyerGstin ? ` · ${inv.buyerGstin}` : ""}
        </div>
      )}

      {/* Invoice no + amount */}
      <div className="mt-1.5 flex items-center justify-between gap-2">
        <span className="text-xs text-slate-500 dark:text-gray-500 truncate">
          {inv.invoiceNumber ? `Inv #${inv.invoiceNumber}` : "No invoice no."}
        </span>
        {inv.totalAmount && (
          <span className="font-mono text-sm font-semibold text-slate-800 dark:text-gray-100 flex-shrink-0">
            ₹{inv.totalAmount}
          </span>
        )}
      </div>

      {/* Dates */}
      <div className="mt-1 flex items-center justify-between gap-2 text-xs text-slate-400 dark:text-gray-600">
        <span>{inv.dueDate ? `Due: ${inv.dueDate}` : `Scanned: ${formatDate(inv.createdAt)}`}</span>
        {inv.dueDate && <span>{formatDate(inv.createdAt)}</span>}
      </div>

      {/* Mark as Paid */}
      {status !== "paid" && (
        <button
          onClick={(e) => { e.stopPropagation(); onMarkPaid(); }}
          className="mt-3 w-full text-xs py-1.5 rounded-lg border border-green-500/40 text-green-600 dark:text-green-400 hover:bg-green-500/10 transition-colors font-medium"
        >
          <CheckCircle className="w-3 h-3 inline mr-1 -mt-0.5" />
          Mark as Paid
        </button>
      )}
    </div>
  );
}

export default function InvoiceHistoryPage() {
  const [invoices, setInvoices] = useLocalStorage(LS_KEYS.INVOICES, []);
  const [search, setSearch]       = useState("");
  const [dateFrom, setDateFrom]   = useState("");
  const [dateTo, setDateTo]       = useState("");
  const [statusFilter, setStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const filtered = invoices.filter((inv) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      inv.invoiceId?.toLowerCase().includes(q) ||
      inv.invoiceNumber?.toLowerCase().includes(q) ||
      inv.vendorName?.toLowerCase().includes(q) ||
      inv.buyerName?.toLowerCase().includes(q) ||
      inv.vendorGstin?.toLowerCase().includes(q) ||
      inv.buyerGstin?.toLowerCase().includes(q);

    const invDate  = new Date(inv.createdAt).toISOString().slice(0, 10);
    const matchFrom = !dateFrom || invDate >= dateFrom;
    const matchTo   = !dateTo   || invDate <= dateTo;
    const matchSt   = statusFilter === "all" || getPaymentStatus(inv) === statusFilter;

    return matchSearch && matchFrom && matchTo && matchSt;
  });

  const handleDelete = (id) => {
    if (window.confirm(`Delete invoice record ${id}?`))
      setInvoices((p) => p.filter((i) => i.invoiceId !== id));
  };

  const handleMarkPaid = (id) =>
    setInvoices((p) => p.map((i) => i.invoiceId === id ? { ...i, paymentStatus: "paid" } : i));

  const hasFilters = search || dateFrom || dateTo || statusFilter !== "all";

  if (isLoading) return <CardGridSkeleton count={6} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Invoice History</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">{filtered.length} record{filtered.length !== 1 ? "s" : ""}</span>
          <button onClick={() => navigate("/invoices")} className="btn-primary text-sm">+ Scan Invoice</button>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex gap-2.5 flex-wrap items-center">
          <div className="relative flex-1 min-w-[220px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-500 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              className="input-field pl-9 text-sm h-10"
              placeholder="Search by invoice no., vendor, buyer, GSTIN…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <input type="date" className="input-field text-sm w-36 h-10" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          <input type="date" className="input-field text-sm w-36 h-10" value={dateTo}   onChange={(e) => setDateTo(e.target.value)} />
          {hasFilters && <button onClick={() => { setSearch(""); setDateFrom(""); setDateTo(""); setStatus("all"); }} className="btn-secondary text-sm h-10 px-4">Clear</button>}
        </div>
        {/* Status pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { key: "all",     label: "All",     activeCls: "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400" },
            { key: "pending", label: "Pending", activeCls: "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400" },
            { key: "paid",    label: "Paid",    activeCls: "border-green-500 bg-green-500/10 text-green-600 dark:text-green-400" },
            { key: "overdue", label: "Overdue", activeCls: "border-red-500   bg-red-500/10   text-red-600   dark:text-red-400"   },
          ].map(({ key, label, activeCls }) => (
            <button
              key={key}
              onClick={() => setStatus(key)}
              className={`text-xs px-3 py-1 rounded-full border font-medium transition-colors ${
                statusFilter === key
                  ? activeCls
                  : "border-slate-200 dark:border-[#3A3A3C] text-slate-500 dark:text-gray-500 hover:border-slate-400 dark:hover:border-[#4A4A4C]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="card text-center py-12 text-slate-500">
          {invoices.length === 0 ? (
            <>
              <div className="flex justify-center mb-3">
                <Receipt className="w-10 h-10 text-slate-300 dark:text-gray-600" />
              </div>
              <p>No invoice records yet.</p>
              <button onClick={() => navigate("/invoices")} className="btn-primary mt-4 text-sm">Scan your first invoice</button>
            </>
          ) : (
            <p>No records match your filters.</p>
          )}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((inv) => (
            <InvoiceCard
              key={inv.invoiceId}
              inv={inv}
              onView={() => navigate(`/invoices/history/${inv.invoiceId}`)}
              onDelete={() => handleDelete(inv.invoiceId)}
              onMarkPaid={() => handleMarkPaid(inv.invoiceId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
