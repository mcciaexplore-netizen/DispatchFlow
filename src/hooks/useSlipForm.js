import { useState } from "react";

const EMPTY_FORM = {
  itemDescription: "",
  batchLotNumber: "",
  grade: "",
  quantity: "",
  unit: "pcs",
  weight: "",
  poNumber: "",
  customerName: "",
  destination: "",
  vehicleNumber: "",
  driverName: "",
  transporter: "",
  hsnCode: "",
  invoiceNumber: "",
  remarks: "",
};

export function useSlipForm(initialData = {}) {
  const [formData, setFormData] = useState({ ...EMPTY_FORM, ...initialData });
  const [errors, setErrors] = useState({});

  const setField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const fillFromOCR = (ocrData) => {
    setFormData((prev) => ({
      ...prev,
      ...Object.fromEntries(
        Object.entries(ocrData).filter(([, v]) => v !== "")
      ),
    }));
    setErrors({});
  };

  const reset = () => {
    setFormData({ ...EMPTY_FORM });
    setErrors({});
  };

  return { formData, errors, setErrors, setField, fillFromOCR, reset };
}
