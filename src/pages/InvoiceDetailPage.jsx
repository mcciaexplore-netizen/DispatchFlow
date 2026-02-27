import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle, Clock, AlertCircle, Search } from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { LS_KEYS } from "../utils/constants";
import { formatDate, formatDateTime } from "../utils/formatters";

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
  paid:    { label: "Paid",    cls: "bg-green-500/15 text-green-600 border-green-500/30",  Icon: CheckCircle },
  pending: { label: "Pending", cls: "bg-amber-500/15 text-amber-600 border-amber-500/30",  Icon: Clock },
  overdue: { label: "Overdue", cls: "bg-red-500/15   text-red-600   border-red-500/30",    Icon: AlertCircle },
};

export default function InvoiceDetailPage() {
  const { invoiceId } = useParams();
  const [invoices, setInvoices] = useLocalStorage(LS_KEYS.INVOICES, []);
  const navigate = useNavigate();

  const inv = invoices.find((i) => i.invoiceId === invoiceId);

  const handleMarkPaid = () =>
    setInvoices((p) => p.map((i) => i.invoiceId === invoiceId ? { ...i, paymentStatus: "paid" } : i));

  if (!inv) {
    return (
      <div className="card text-center py-12">
        <div className="flex justify-center mb-3">
          <Search className="w-10 h-10 text-slate-300 dark:text-gray-600" />
        </div>
        <p className="text-slate-500">Invoice not found.</p>
        <button onClick={() => navigate("/invoices/history")} className="btn-secondary mt-4 text-sm">
          Back to Invoice Records
        </button>
      </div>
    );
  }

  const status = getPaymentStatus(inv);
  const statusCfg = STATUS_CONFIG[status];

  const Row = ({ label, value }) =>
    value ? (
      <div className="flex gap-2 text-xs">
        <span className="text-gray-500 w-32 flex-shrink-0">{label}</span>
        <span className="text-slate-800 dark:text-gray-200">{value}</span>
      </div>
    ) : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => navigate("/invoices/history")} className="btn-secondary text-sm">
          ← Back
        </button>
        <h1 className="text-lg font-bold">Invoice Detail</h1>
        <span className="slip-number text-sm">{inv.invoiceId}</span>
        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium ${statusCfg.cls}`}>
          <statusCfg.Icon className="w-3.5 h-3.5" />
          {statusCfg.label}
        </span>
        {status !== "paid" && (
          <button
            onClick={handleMarkPaid}
            className="ml-auto text-xs px-3 py-1.5 rounded-lg border border-green-500/40 text-green-600 dark:text-green-400 hover:bg-green-500/10 transition-colors font-medium"
          >
            <CheckCircle className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
            Mark as Paid
          </button>
        )}
      </div>

      <div className="bg-white text-gray-900 rounded-xl p-5 shadow-xl text-sm space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-gray-900 pb-3">
          <div>
            <div className="font-bold text-base">{inv.vendorName || "—"}</div>
            <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">
              {inv.vendorAddress}
              {inv.vendorGstin && <><br />GSTIN: {inv.vendorGstin}</>}
              {inv.vendorPhone && <> | {inv.vendorPhone}</>}
            </div>
          </div>
          <div className="text-right">
            <span className="bg-gray-900 text-white text-[10px] font-bold px-3 py-1 rounded tracking-widest">TAX INVOICE</span>
            <div className="font-mono text-amber-600 font-bold text-base mt-1">{inv.invoiceNumber || inv.invoiceId}</div>
            <div className="text-xs text-gray-500 mt-0.5">Date: {inv.invoiceDate || formatDate(inv.createdAt)}</div>
          </div>
        </div>

        {/* Buyer */}
        <div className="border border-gray-200 rounded p-3">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Bill To</div>
          <div className="font-semibold">{inv.buyerName || "—"}</div>
          {inv.buyerAddress && <div className="text-xs text-gray-500 mt-0.5">{inv.buyerAddress}</div>}
          {inv.buyerGstin && <div className="text-xs text-gray-500">GSTIN: {inv.buyerGstin}</div>}
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
          {inv.placeOfSupply && <span><strong className="text-gray-700">Place of Supply:</strong> {inv.placeOfSupply}</span>}
          {inv.dueDate && <span><strong className="text-gray-700">Due:</strong> {inv.dueDate}</span>}
          {inv.paymentTerms && <span><strong className="text-gray-700">Terms:</strong> {inv.paymentTerms}</span>}
          {inv.reverseCharge && <span><strong className="text-gray-700">Reverse Charge:</strong> {inv.reverseCharge}</span>}
          {inv.hsnCodes && <span><strong className="text-gray-700">HSN:</strong> {inv.hsnCodes}</span>}
        </div>

        {/* Line items */}
        {inv.lineItems && (
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Line Items</div>
            <div className="border border-gray-200 rounded p-2 text-xs text-gray-700 whitespace-pre-line font-mono bg-gray-50">
              {inv.lineItems}
            </div>
          </div>
        )}

        {/* Totals */}
        <div className="ml-auto max-w-xs space-y-1 text-xs">
          {inv.subtotal && <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>₹{inv.subtotal}</span></div>}
          {inv.cgst && <div className="flex justify-between"><span className="text-gray-500">CGST</span><span>₹{inv.cgst}</span></div>}
          {inv.sgst && <div className="flex justify-between"><span className="text-gray-500">SGST</span><span>₹{inv.sgst}</span></div>}
          {inv.igst && <div className="flex justify-between"><span className="text-gray-500">IGST</span><span>₹{inv.igst}</span></div>}
          {inv.totalTax && <div className="flex justify-between"><span className="text-gray-500">Total Tax</span><span>₹{inv.totalTax}</span></div>}
          <div className="flex justify-between border-t border-gray-900 pt-1 font-bold">
            <span>Total Amount</span>
            <span>₹{inv.totalAmount || "—"}</span>
          </div>
          {inv.totalInWords && <div className="text-gray-500 italic text-[11px]">{inv.totalInWords}</div>}
        </div>

        {/* Bank */}
        {(inv.bankName || inv.accountNumber || inv.ifscCode || inv.upiId) && (
          <div className="border-t border-gray-200 pt-3 text-xs">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Bank / Payment Details</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-gray-600">
              {inv.bankName && <span><strong>Bank:</strong> {inv.bankName}</span>}
              {inv.accountNumber && <span><strong>Account:</strong> {inv.accountNumber}</span>}
              {inv.ifscCode && <span><strong>IFSC:</strong> {inv.ifscCode}</span>}
              {inv.upiId && <span><strong>UPI:</strong> {inv.upiId}</span>}
            </div>
          </div>
        )}

        {inv.notes && (
          <div className="border-t border-gray-200 pt-3 text-xs text-gray-500">
            <strong>Notes:</strong> {inv.notes}
          </div>
        )}

        <div className="border-t border-gray-200 pt-2 text-[10px] text-gray-400 text-center">
          Invoice ID: {inv.invoiceId} | Recorded on {formatDateTime(inv.createdAt)}
        </div>
      </div>
    </div>
  );
}
