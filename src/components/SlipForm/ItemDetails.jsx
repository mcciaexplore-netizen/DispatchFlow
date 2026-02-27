import FormField from "./FormField";
import { UNITS } from "../../utils/constants";

export default function ItemDetails({ formData, errors, setField }) {
  return (
    <div className="card space-y-4">
      <p className="section-header">Item Details</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FormField label="Item Description" required error={errors.itemDescription}>
            <textarea
              className="input-field resize-none"
              rows={2}
              placeholder="e.g., MS Round Bar IS2062 Grade E250"
              value={formData.itemDescription}
              onChange={(e) => setField("itemDescription", e.target.value)}
            />
          </FormField>
        </div>
        <FormField label="Batch / Lot Number">
          <input
            className="input-field font-mono"
            placeholder="e.g., BT-2024-001"
            value={formData.batchLotNumber}
            onChange={(e) => setField("batchLotNumber", e.target.value)}
          />
        </FormField>
        <FormField label="Grade / Specification">
          <input
            className="input-field"
            placeholder="e.g., IS2062, SS304, Grade A"
            value={formData.grade}
            onChange={(e) => setField("grade", e.target.value)}
          />
        </FormField>
        <FormField label="PO Number">
          <input
            className="input-field font-mono"
            placeholder="e.g., PO-2024-0456"
            value={formData.poNumber}
            onChange={(e) => setField("poNumber", e.target.value)}
          />
        </FormField>
        <FormField label="HSN Code">
          <input
            className="input-field font-mono"
            placeholder="e.g., 7214"
            value={formData.hsnCode}
            onChange={(e) => setField("hsnCode", e.target.value)}
          />
        </FormField>
        <FormField label="Quantity" error={errors.quantity}>
          <input
            className="input-field"
            type="number"
            min="0"
            placeholder="0"
            value={formData.quantity}
            onChange={(e) => setField("quantity", e.target.value)}
          />
        </FormField>
        <FormField label="Unit">
          <select
            className="input-field"
            value={formData.unit}
            onChange={(e) => setField("unit", e.target.value)}
          >
            {UNITS.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Total Weight">
          <input
            className="input-field"
            placeholder="e.g., 186.5 kg"
            value={formData.weight}
            onChange={(e) => setField("weight", e.target.value)}
          />
        </FormField>
        <FormField label="Invoice Number">
          <input
            className="input-field font-mono"
            placeholder="e.g., INV-2024-0123"
            value={formData.invoiceNumber}
            onChange={(e) => setField("invoiceNumber", e.target.value)}
          />
        </FormField>
      </div>
    </div>
  );
}
