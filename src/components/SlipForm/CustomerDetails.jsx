import FormField from "./FormField";

export default function CustomerDetails({ formData, errors, setField }) {
  return (
    <div className="card space-y-4">
      <p className="section-header">Customer &amp; Destination</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Customer Name" required error={errors.customerName}>
          <input
            className="input-field"
            placeholder="e.g., Tata Steel Limited"
            value={formData.customerName}
            onChange={(e) => setField("customerName", e.target.value)}
          />
        </FormField>
        <div className="sm:col-span-2">
          <FormField label="Destination Address">
            <textarea
              className="input-field resize-none"
              rows={2}
              placeholder="Full delivery address"
              value={formData.destination}
              onChange={(e) => setField("destination", e.target.value)}
            />
          </FormField>
        </div>
      </div>
    </div>
  );
}
