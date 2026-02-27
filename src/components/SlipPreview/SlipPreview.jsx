import { formatDate, formatDateTime } from "../../utils/formatters";
import { printSlip } from "./PrintHandler";
import { useSettings } from "../../context/SettingsContext";
import { Printer, CheckCircle, Loader2 } from "lucide-react";

export default function SlipPreview({ slipData, onBack, onSave, saving }) {
  const { merged } = useSettings();
  const company = merged.company;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="btn-secondary text-sm flex items-center gap-2">
          ← Back to Edit
        </button>
        <div className="flex gap-2">
          <button onClick={() => printSlip(slipData, company)} className="btn-secondary text-sm flex items-center gap-1.5">
            <Printer className="w-4 h-4" /> Print
          </button>
          {onSave && (
            <button onClick={onSave} disabled={saving} className="btn-primary text-sm flex items-center gap-1.5">
              {saving
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                : <><CheckCircle className="w-4 h-4" /> Save &amp; Finalize</>}
            </button>
          )}
        </div>
      </div>

      {/* Slip Card Preview */}
      <div className="bg-white text-gray-900 rounded-xl p-6 shadow-xl space-y-4 text-sm">
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-gray-900 pb-4">
          <div>
            {company.logo && (
              <img src={company.logo} alt="Logo" className="h-12 mb-2 object-contain" />
            )}
            <div className="text-xl font-bold">{company.name}</div>
            <div className="text-xs text-gray-500 mt-1 leading-relaxed">
              {company.address}<br />
              GSTIN: {company.gstin} | {company.phone} | {company.email}
            </div>
          </div>
          <div className="text-right">
            <span className="bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded tracking-widest">
              DISPATCH SLIP
            </span>
            <div className="font-mono text-amber-600 font-bold text-lg mt-2">
              {slipData.slipNumber}
            </div>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
          <span><strong className="text-gray-700">Date:</strong> {formatDate(slipData.createdAt)}</span>
          <span><strong className="text-gray-700">Time:</strong> {new Date(slipData.createdAt).toLocaleTimeString("en-IN", {hour:"2-digit",minute:"2-digit"})}</span>
          {slipData.poNumber && <span><strong className="text-gray-700">PO No:</strong> {slipData.poNumber}</span>}
          {slipData.invoiceNumber && <span><strong className="text-gray-700">Invoice:</strong> {slipData.invoiceNumber}</span>}
        </div>

        {/* Customer box */}
        <div className="border-2 border-gray-900 rounded p-3">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Customer & Destination</div>
          <div className="font-semibold text-base">{slipData.customerName || "—"}</div>
          {slipData.destination && <div className="text-xs text-gray-500 mt-1">{slipData.destination}</div>}
        </div>

        {/* Item table */}
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-900 text-white">
              <th className="p-2 text-left font-semibold">Item Description</th>
              <th className="p-2 text-left font-semibold">Batch / Lot #</th>
              <th className="p-2 text-left font-semibold">Grade</th>
              <th className="p-2 text-center font-semibold">Qty</th>
              <th className="p-2 text-center font-semibold">Unit</th>
              <th className="p-2 text-left font-semibold">Weight</th>
              {slipData.hsnCode && <th className="p-2 text-left font-semibold">HSN</th>}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="p-2">{slipData.itemDescription || "—"}</td>
              <td className="p-2 font-mono text-xs">{slipData.batchLotNumber || "—"}</td>
              <td className="p-2">{slipData.grade || "—"}</td>
              <td className="p-2 text-center font-bold">{slipData.quantity || "—"}</td>
              <td className="p-2 text-center">{slipData.unit || "—"}</td>
              <td className="p-2">{slipData.weight || "—"}</td>
              {slipData.hsnCode && <td className="p-2 font-mono">{slipData.hsnCode}</td>}
            </tr>
          </tbody>
        </table>

        {/* Transport row */}
        <div className="grid grid-cols-3 gap-3 border border-gray-200 rounded p-3 text-xs">
          <div>
            <div className="text-gray-500 uppercase tracking-wider font-semibold text-[10px]">Vehicle No.</div>
            <div className="font-mono font-semibold mt-0.5">{slipData.vehicleNumber || "—"}</div>
          </div>
          <div>
            <div className="text-gray-500 uppercase tracking-wider font-semibold text-[10px]">Driver</div>
            <div className="font-semibold mt-0.5">{slipData.driverName || "—"}</div>
          </div>
          <div>
            <div className="text-gray-500 uppercase tracking-wider font-semibold text-[10px]">Transporter</div>
            <div className="font-semibold mt-0.5">{slipData.transporter || "—"}</div>
          </div>
        </div>

        {slipData.remarks && (
          <div className="border border-gray-200 rounded p-3 text-xs text-gray-600">
            <strong>Remarks:</strong> {slipData.remarks}
          </div>
        )}

        {/* Signatures */}
        <div className="grid grid-cols-3 gap-6 pt-6">
          {["Prepared By", "Checked By", "Received By"].map((label) => (
            <div key={label} className="border-t-2 border-gray-900 pt-2 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              {label}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-3 text-[10px] text-gray-400 text-center">
          This is a system-generated dispatch slip | {company.name} | Generated on {formatDateTime(slipData.createdAt)}
        </div>
      </div>
    </div>
  );
}
