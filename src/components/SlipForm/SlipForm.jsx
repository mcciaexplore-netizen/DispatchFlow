import ItemDetails from "./ItemDetails";
import CustomerDetails from "./CustomerDetails";
import TransportDetails from "./TransportDetails";

export default function SlipForm({ formData, errors, setField }) {
  return (
    <div className="space-y-4">
      <ItemDetails formData={formData} errors={errors} setField={setField} />
      <CustomerDetails formData={formData} errors={errors} setField={setField} />
      <TransportDetails formData={formData} setField={setField} />
    </div>
  );
}
