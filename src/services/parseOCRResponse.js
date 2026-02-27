// Parse and sanitize Gemini OCR response into structured fields
export function parseOCRResponse(rawData) {
  if (!rawData || typeof rawData !== "object") return {};

  const fields = [
    "itemDescription", "batchLotNumber", "grade", "quantity", "unit",
    "weight", "poNumber", "customerName", "destination", "vehicleNumber",
    "driverName", "transporter", "hsnCode", "invoiceNumber", "remarks"
  ];

  const parsed = {};
  fields.forEach((field) => {
    const val = rawData[field];
    parsed[field] = val && typeof val === "string" ? val.trim() : "";
  });

  return parsed;
}
