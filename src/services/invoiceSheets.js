import { SHEETS_API_BASE, DEFAULT_INV_TAB, INVOICE_SHEET_RANGE, DEFAULT_RETRY_COUNT } from "../utils/constants";
import { fetchWithRetry } from "../utils/retry";

const SHEETS_API_URL = SHEETS_API_BASE;

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
  const { sheetsId, tabName = DEFAULT_INV_TAB, scriptUrl } = storageConfig;

  if (!scriptUrl) {
    throw new Error("Apps Script URL not configured. Add it in Settings → Data Storage.");
  }

  const row = INVOICE_COLUMNS.map((col) => invoiceData[col] ?? "");

  // text/plain avoids CORS preflight; Apps Script still receives the JSON body
  const response = await fetchWithRetry(scriptUrl, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ sheetId: sheetsId, tabName, row }),
    redirect: "follow",
  }, DEFAULT_RETRY_COUNT);

  return response.json();
}

export async function fetchInvoiceHistory(storageConfig) {
  const { sheetsId, apiKey, tabName = DEFAULT_INV_TAB } = storageConfig;

  const response = await fetch(
    `${SHEETS_API_URL}/${sheetsId}/values/${encodeURIComponent(tabName)}!${INVOICE_SHEET_RANGE}?key=${apiKey}`
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
