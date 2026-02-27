import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { formatDate } from "../utils/formatters";

export default function InvoiceHistoryPage() {
  const [invoices, setInvoices] = useLocalStorage("dispatchflow_invoices", []);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filtered = invoices.filter((inv) => {
    const q = search.toLowerCase();
    return (
      !q ||
      inv.invoiceId?.toLowerCase().includes(q) ||
      inv.invoiceNumber?.toLowerCase().includes(q) ||
      inv.vendorName?.toLowerCase().includes(q) ||
      inv.buyerName?.toLowerCase().includes(q)
    );
  });

  const handleDelete = (invoiceId) => {
    if (window.confirm(`Delete invoice record ${invoiceId}?`)) {
      setInvoices((prev) => prev.filter((i) => i.invoiceId !== invoiceId));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Invoice Records</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{filtered.length} record{filtered.length !== 1 ? "s" : ""}</span>
          <button onClick={() => navigate("/invoices")} className="btn-primary text-sm">
            + Scan Invoice
          </button>
        </div>
      </div>

      <input
        className="input-field text-sm"
        placeholder="Search by invoice no., vendor, buyer…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filtered.length === 0 ? (
        <div className="card text-center py-12 text-gray-500">
          {invoices.length === 0 ? (
            <>
              <div className="text-4xl mb-3">🧾</div>
              <p>No invoice records yet.</p>
              <button onClick={() => navigate("/invoices")} className="btn-primary mt-4 text-sm">
                Scan your first invoice
              </button>
            </>
          ) : (
            <p>No records match your search.</p>
          )}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((inv) => (
            <div
              key={inv.invoiceId}
              onClick={() => navigate(`/invoices/history/${inv.invoiceId}`)}
              className="card hover:border-[#4A4A4C] transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="slip-number text-xs">{inv.invoiceId}</span>
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-medium">
                      {inv.status || "received"}
                    </span>
                  </div>
                  <div className="font-medium text-gray-200 truncate">{inv.vendorName || "—"}</div>
                  <div className="text-xs text-gray-500 truncate">
                    {inv.invoiceNumber ? `Invoice: ${inv.invoiceNumber}` : "No invoice no."}
                    {inv.totalAmount ? ` · ₹${inv.totalAmount}` : ""}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">{formatDate(inv.createdAt)}</div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(inv.invoiceId); }}
                  className="text-gray-600 hover:text-red-400 transition-colors text-lg flex-shrink-0"
                  title="Delete"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
