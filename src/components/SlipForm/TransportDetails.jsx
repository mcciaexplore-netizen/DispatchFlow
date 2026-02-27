import FormField from "./FormField";

export default function TransportDetails({ formData, setField }) {
  return (
    <div className="card space-y-4">
      <p className="section-header">Vehicle &amp; Transport</p>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <FormField label="Vehicle Number">
          <input
            className="input-field font-mono uppercase"
            placeholder="e.g., MH 12 AB 1234"
            value={formData.vehicleNumber}
            onChange={(e) => setField("vehicleNumber", e.target.value.toUpperCase())}
          />
        </FormField>
        <FormField label="Driver Name">
          <input
            className="input-field"
            placeholder="Driver full name"
            value={formData.driverName}
            onChange={(e) => setField("driverName", e.target.value)}
          />
        </FormField>
        <FormField label="Transporter">
          <input
            className="input-field"
            placeholder="Transport company name"
            value={formData.transporter}
            onChange={(e) => setField("transporter", e.target.value)}
          />
        </FormField>
      </div>
      <FormField label="Remarks">
        <textarea
          className="input-field resize-none"
          rows={2}
          placeholder="Any special instructions, handling notes..."
          value={formData.remarks}
          onChange={(e) => setField("remarks", e.target.value)}
        />
      </FormField>
    </div>
  );
}
