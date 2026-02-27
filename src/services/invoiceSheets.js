const SHEETS_API_URL = "https://sheets.googleapis.com/v4/spreadsheets";

// Column order — must match the header row in the sheet
const INVOICE_COLUMNS = [
  "invoiceId",
  "createdAt",
  "invoiceNumber",
  "invoiceDate",
  "dueDate",
  "vendorName",
  "vendorGstin",
  "vendorPhone",
  "vendorEmail",
  "vendorAddress",
  "buyerName",
  "buyerGstin",
  "buyerAddress",
  "placeOfSupply",
  "reverseCharge",
  "hsnCodes",
  "lineItems",
  "subtotal",
  "cgst",
  "sgst",
  "igst",
  "totalTax",
  "totalAmount",
  "totalInWords",
  "paymentTerms",
  "bankName",
  "accountNumber",
  "ifscCode",
  "upiId",
  "notes",
  "status",
];

export const INVOICE_SHEET_HEADERS = [
  "Invoice ID", "Created At", "Invoice No.", "Invoice Date", "Due Date",
  "Vendor Name", "Vendor GSTIN", "Vendor Phone", "Vendor Email", "Vendor Address",
  "Buyer Name", "Buyer GSTIN", "Buyer Address",
  "Place of Supply", "Reverse Charge", "HSN Codes",
  "Line Items",
  "Subtotal", "CGST", "SGST", "IGST", "Total Tax", "Total Amount", "Total in Words",
  "Payment Terms", "Bank Name", "Account No.", "IFSC", "UPI ID",
  "Notes", "Status",
];

export async function appendInvoiceToSheet(invoiceData, storageConfig) {
  const { sheetsId, apiKey, tabName = "Invoices" } = storageConfig;

  const row = INVOICE_COLUMNS.map((col) => invoiceData[col] ?? "");

  const response = await fetch(
    `${SHEETS_API_URL}/${sheetsId}/values/${encodeURIComponent(tabName)}!A:AE:append?valueInputOption=USER_ENTERED&key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ values: [row] }),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || "Failed to save invoice to Google Sheets");
  }

  return response.json();
}

export async function fetchInvoiceHistory(storageConfig) {
  const { sheetsId, apiKey, tabName = "Invoices" } = storageConfig;

  const response = await fetch(
    `${SHEETS_API_URL}/${sheetsId}/values/${encodeURIComponent(tabName)}!A:AE?key=${apiKey}`
  );

  if (!response.ok) return [];

  const data = await response.json();
  const rows = data.values || [];

  return rows
    .slice(1) // skip header row
    .map((row) =>
      Object.fromEntries(INVOICE_COLUMNS.map((col, i) => [col, row[i] ?? ""]))
    )
    .reverse();
}
