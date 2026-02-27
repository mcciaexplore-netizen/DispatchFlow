import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ScanZone from "../components/Scanner/ScanZone";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useSettings } from "../context/SettingsContext";
import { scanInvoice, parseInvoiceOCR } from "../services/invoiceOCR";
import { appendInvoiceToSheet } from "../services/invoiceSheets";
import { generateInvoiceId } from "../services/invoiceIdGenerator";
import { formatDate, formatDateTime } from "../utils/formatters";

const EMPTY = {
  invoiceNumber: "", invoiceDate: "", dueDate: "", paymentTerms: "",
  vendorName: "", vendorAddress: "", vendorGstin: "", vendorPhone: "", vendorEmail: "",
  buyerName: "", buyerAddress: "", buyerGstin: "",
  placeOfSupply: "", reverseCharge: "", hsnCodes: "",
  lineItems: "",
  subtotal: "", cgst: "", sgst: "", igst: "", totalTax: "", totalAmount: "", totalInWords: "",
  bankName: "", accountNumber: "", ifscCode: "", upiId: "",
  notes: "",
};

function Field({ label, value, onChange, textarea, mono, placeholder, half }) {
  const cls = `input-field text-sm${mono ? " font-mono" : ""}`;
  return (
    <div className={`flex flex-col gap-1${half ? "" : ""}`}>
      <label className="text-xs font-medium text-gray-400">{label}</label>
      {textarea ? (
        <textarea
          className={`${cls} resize-none`}
          rows={3}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className={cls}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="card space-y-3">
      <p className="section-header">{title}</p>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function FullRow({ children }) {
  return <div className="sm:col-span-2">{children}</div>;
}

// Read-only invoice preview card (shown before saving)
function InvoicePreview({ invoice, onBack, onSave, saving }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="btn-secondary text-sm">← Back to Edit</button>
        <div className="flex gap-2">
          <button onClick={onSave} disabled={saving} className="btn-primary text-sm">
            {saving ? "Saving..." : "✓ Save Invoice"}
          </button>
        </div>
      </div>

      <div className="bg-white text-gray-900 rounded-xl p-5 shadow-xl text-sm space-y-4">
        {/* Header row */}
        <div className="flex justify-between items-start border-b-2 border-gray-900 pb-3">
          <div>
            <div className="font-bold text-base">{invoice.vendorName || "—"}</div>
            <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">
              {invoice.vendorAddress}
              {invoice.vendorGstin && <><br />GSTIN: {invoice.vendorGstin}</>}
              {invoice.vendorPhone && <> | {invoice.vendorPhone}</>}
            </div>
          </div>
          <div className="text-right">
            <span className="bg-gray-900 text-white text-[10px] font-bold px-3 py-1 rounded tracking-widest">TAX INVOICE</span>
            <div className="font-mono text-amber-600 font-bold text-base mt-1">{invoice.invoiceNumber || invoice.invoiceId}</div>
            <div className="text-xs text-gray-500 mt-0.5">Date: {invoice.invoiceDate || formatDate(invoice.createdAt)}</div>
          </div>
        </div>

        {/* Buyer box */}
        <div className="border border-gray-200 rounded p-3">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Bill To</div>
          <div className="font-semibold">{invoice.buyerName || "—"}</div>
          {invoice.buyerAddress && <div className="text-xs text-gray-500 mt-0.5">{invoice.buyerAddress}</div>}
          {invoice.buyerGstin && <div className="text-xs text-gray-500">GSTIN: {invoice.buyerGstin}</div>}
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
          {invoice.placeOfSupply && <span><strong className="text-gray-700">Place of Supply:</strong> {invoice.placeOfSupply}</span>}
          {invoice.dueDate && <span><strong className="text-gray-700">Due:</strong> {invoice.dueDate}</span>}
          {invoice.paymentTerms && <span><strong className="text-gray-700">Terms:</strong> {invoice.paymentTerms}</span>}
          {invoice.reverseCharge && <span><strong className="text-gray-700">Reverse Charge:</strong> {invoice.reverseCharge}</span>}
        </div>

        {/* Line items */}
        {invoice.lineItems && (
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Line Items</div>
            <div className="border border-gray-200 rounded p-2 text-xs text-gray-700 whitespace-pre-line font-mono bg-gray-50">
              {invoice.lineItems}
            </div>
          </div>
        )}

        {/* Totals */}
        <div className="ml-auto max-w-xs space-y-1 text-xs">
          {invoice.subtotal && <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>₹{invoice.subtotal}</span></div>}
          {invoice.cgst && <div className="flex justify-between"><span className="text-gray-500">CGST</span><span>₹{invoice.cgst}</span></div>}
          {invoice.sgst && <div className="flex justify-between"><span className="text-gray-500">SGST</span><span>₹{invoice.sgst}</span></div>}
          {invoice.igst && <div className="flex justify-between"><span className="text-gray-500">IGST</span><span>₹{invoice.igst}</span></div>}
          {invoice.totalTax && <div className="flex justify-between"><span className="text-gray-500">Total Tax</span><span>₹{invoice.totalTax}</span></div>}
          <div className="flex justify-between border-t border-gray-900 pt-1 font-bold">
            <span>Total Amount</span>
            <span>₹{invoice.totalAmount || "—"}</span>
          </div>
          {invoice.totalInWords && <div className="text-gray-500 italic">{invoice.totalInWords}</div>}
        </div>

        {/* Bank details */}
        {(invoice.bankName || invoice.accountNumber) && (
          <div className="border-t border-gray-200 pt-3 text-xs">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Bank Details</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-gray-600">
              {invoice.bankName && <span><strong>Bank:</strong> {invoice.bankName}</span>}
              {invoice.accountNumber && <span><strong>Account:</strong> {invoice.accountNumber}</span>}
              {invoice.ifscCode && <span><strong>IFSC:</strong> {invoice.ifscCode}</span>}
              {invoice.upiId && <span><strong>UPI:</strong> {invoice.upiId}</span>}
            </div>
          </div>
        )}

        {invoice.notes && (
          <div className="border-t border-gray-200 pt-3 text-xs text-gray-500">
            <strong>Notes:</strong> {invoice.notes}
          </div>
        )}

        <div className="border-t border-gray-200 pt-2 text-[10px] text-gray-400 text-center">
          System-generated record | Invoice ID: {invoice.invoiceId} | Recorded on {formatDateTime(invoice.createdAt)}
        </div>
      </div>
    </div>
  );
}

export default function InvoicePage() {
  const [step, setStep] = useState("form"); // "form" | "preview"
  const [formData, setFormData] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);
  const [pendingInvoice, setPendingInvoice] = useState(null);
  const [invoices, setInvoices] = useLocalStorage("dispatchflow_invoices", []);
  const navigate = useNavigate();
  const { merged } = useSettings();

  const setField = (key, val) => setFormData((f) => ({ ...f, [key]: val }));

  const handleOCRSuccess = useCallback((parsed) => {
    setFormData((prev) => ({
      ...prev,
      ...Object.fromEntries(Object.entries(parsed).filter(([, v]) => v !== "")),
    }));
  }, []);

  // Custom scan function for invoices passed to ScanZone
  const invoiceScanFn = useCallback(async (base64, apiKey) => {
    const raw = await scanInvoice(base64, apiKey);
    return parseInvoiceOCR(raw);
  }, []);

  const handlePreview = () => {
    const inv = {
      ...formData,
      invoiceId: generateInvoiceId("INV"),
      createdAt: new Date().toISOString(),
      status: "received",
    };
    setPendingInvoice(inv);
    setStep("preview");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async () => {
    if (!pendingInvoice) return;
    setSaving(true);
    setSaveMsg(null);

    setInvoices((prev) => [pendingInvoice, ...prev]);

    if (merged.invoiceStorage.enabled) {
      try {
        await appendInvoiceToSheet(pendingInvoice, merged.invoiceStorage);
        setSaveMsg({ type: "success", text: "Invoice saved and synced to Google Sheets." });
      } catch {
        setSaveMsg({ type: "warning", text: "Saved locally. Cloud sync failed." });
      }
    } else {
      setSaveMsg({ type: "success", text: "Invoice saved successfully!" });
    }

    setSaving(false);
    setTimeout(() => navigate("/invoices/history"), 1200);
  };

  const handleReset = () => {
    setFormData({ ...EMPTY });
    setStep("form");
    setSaveMsg(null);
  };

  if (step === "preview") {
    return (
      <div className="space-y-4">
        {saveMsg && (
          <div className={`rounded-lg p-3 text-sm ${saveMsg.type === "success" ? "bg-green-500/10 border border-green-500/30 text-green-400" : "bg-amber-500/10 border border-amber-500/30 text-amber-400"}`}>
            {saveMsg.text}
          </div>
        )}
        <InvoicePreview invoice={pendingInvoice} onBack={() => setStep("form")} onSave={handleSave} saving={saving} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-xl font-bold">Scan & Digitize Invoice</h1>
        <span className="text-xs bg-[#2C2C2E] text-gray-400 px-2 py-1 rounded">Step 1 of 2</span>
      </div>

      {!merged.geminiApiKey && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-sm text-amber-400">
          No Gemini API key configured — add one in{" "}
          <button onClick={() => navigate("/settings")} className="underline">Settings</button>{" "}
          to enable OCR. You can still fill all fields manually.
        </div>
      )}

      <ScanZone
        onOCRSuccess={handleOCRSuccess}
        apiKey={merged.geminiApiKey}
        scanFn={invoiceScanFn}
        label="Scan Invoice"
      />

      {/* Invoice Info */}
      <Section title="Invoice Details">
        <Field label="Invoice Number" value={formData.invoiceNumber} onChange={(v) => setField("invoiceNumber", v)} placeholder="INV-2024-0123" mono />
        <Field label="Invoice Date" value={formData.invoiceDate} onChange={(v) => setField("invoiceDate", v)} placeholder="DD/MM/YYYY" />
        <Field label="Due Date" value={formData.dueDate} onChange={(v) => setField("dueDate", v)} placeholder="DD/MM/YYYY" />
        <Field label="Payment Terms" value={formData.paymentTerms} onChange={(v) => setField("paymentTerms", v)} placeholder="Net 30, Immediate…" />
      </Section>

      {/* Vendor */}
      <Section title="Vendor (Seller)">
        <FullRow><Field label="Vendor Name" value={formData.vendorName} onChange={(v) => setField("vendorName", v)} placeholder="ABC Suppliers Pvt Ltd" /></FullRow>
        <FullRow><Field label="Vendor Address" value={formData.vendorAddress} onChange={(v) => setField("vendorAddress", v)} placeholder="Full address" textarea /></FullRow>
        <Field label="Vendor GSTIN" value={formData.vendorGstin} onChange={(v) => setField("vendorGstin", v.toUpperCase())} placeholder="27XXXXX1234X1ZX" mono />
        <Field label="Phone" value={formData.vendorPhone} onChange={(v) => setField("vendorPhone", v)} placeholder="+91 98765 43210" />
        <Field label="Email" value={formData.vendorEmail} onChange={(v) => setField("vendorEmail", v)} placeholder="billing@vendor.com" />
      </Section>

      {/* Buyer */}
      <Section title="Buyer (Bill To)">
        <FullRow><Field label="Buyer Name" value={formData.buyerName} onChange={(v) => setField("buyerName", v)} placeholder="XYZ Industries Pvt Ltd" /></FullRow>
        <FullRow><Field label="Buyer Address" value={formData.buyerAddress} onChange={(v) => setField("buyerAddress", v)} placeholder="Full address" textarea /></FullRow>
        <Field label="Buyer GSTIN" value={formData.buyerGstin} onChange={(v) => setField("buyerGstin", v.toUpperCase())} placeholder="27XXXXX5678X1ZX" mono />
      </Section>

      {/* GST Details */}
      <Section title="GST Details">
        <Field label="Place of Supply" value={formData.placeOfSupply} onChange={(v) => setField("placeOfSupply", v)} placeholder="Maharashtra / MH / 27" />
        <Field label="Reverse Charge" value={formData.reverseCharge} onChange={(v) => setField("reverseCharge", v)} placeholder="Yes / No" />
        <FullRow><Field label="HSN / SAC Codes" value={formData.hsnCodes} onChange={(v) => setField("hsnCodes", v)} placeholder="7214, 7216, 8431 (comma-separated)" /></FullRow>
      </Section>

      {/* Line Items */}
      <div className="card space-y-3">
        <p className="section-header">Line Items</p>
        <Field
          label="Items (one per line or AI-formatted)"
          value={formData.lineItems}
          onChange={(v) => setField("lineItems", v)}
          placeholder={"1. MS Round Bar IS2062 | 50 pcs | ₹500/pc | ₹25,000\n2. MS Plate 6mm | 10 sheets | ₹2,000/sheet | ₹20,000"}
          textarea
        />
      </div>

      {/* Amounts */}
      <Section title="Amounts">
        <Field label="Subtotal (₹)" value={formData.subtotal} onChange={(v) => setField("subtotal", v)} placeholder="45000" />
        <Field label="CGST (₹)" value={formData.cgst} onChange={(v) => setField("cgst", v)} placeholder="4050" />
        <Field label="SGST (₹)" value={formData.sgst} onChange={(v) => setField("sgst", v)} placeholder="4050" />
        <Field label="IGST (₹)" value={formData.igst} onChange={(v) => setField("igst", v)} placeholder="0" />
        <Field label="Total Tax (₹)" value={formData.totalTax} onChange={(v) => setField("totalTax", v)} placeholder="8100" />
        <Field label="Total Amount (₹)" value={formData.totalAmount} onChange={(v) => setField("totalAmount", v)} placeholder="53100" />
        <FullRow><Field label="Total in Words" value={formData.totalInWords} onChange={(v) => setField("totalInWords", v)} placeholder="Fifty Three Thousand One Hundred Only" /></FullRow>
      </Section>

      {/* Bank Details */}
      <Section title="Bank / Payment Details">
        <Field label="Bank Name" value={formData.bankName} onChange={(v) => setField("bankName", v)} placeholder="HDFC Bank" />
        <Field label="Account Number" value={formData.accountNumber} onChange={(v) => setField("accountNumber", v)} placeholder="XXXXXXXXXXXX" mono />
        <Field label="IFSC Code" value={formData.ifscCode} onChange={(v) => setField("ifscCode", v.toUpperCase())} placeholder="HDFC0001234" mono />
        <Field label="UPI ID" value={formData.upiId} onChange={(v) => setField("upiId", v)} placeholder="vendor@upi" mono />
      </Section>

      {/* Notes */}
      <div className="card space-y-3">
        <p className="section-header">Notes &amp; Terms</p>
        <Field label="Additional Notes" value={formData.notes} onChange={(v) => setField("notes", v)} placeholder="Any terms, conditions, or notes…" textarea />
      </div>

      <div className="flex gap-3 justify-end">
        <button onClick={handleReset} className="btn-secondary text-sm">Reset</button>
        <button onClick={handlePreview} className="btn-primary px-6">Preview &amp; Save →</button>
      </div>
    </div>
  );
}
