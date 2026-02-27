import { SHEETS_API_BASE, DEFAULT_SLIP_TAB, SLIP_SHEET_RANGE, DEFAULT_RETRY_COUNT } from "../utils/constants";
import { fetchWithRetry } from "../utils/retry";

const SHEETS_API_URL = SHEETS_API_BASE;

export async function appendSlipToSheet(slipData, config) {
  const { sheetsId, tabName = DEFAULT_SLIP_TAB, scriptUrl } = config;

  if (!scriptUrl) {
    throw new Error("Apps Script URL not configured. Add it in Settings → Data Storage.");
  }

  const row = [
    slipData.slipNumber,
    slipData.createdAt,
    slipData.itemDescription,
    slipData.batchLotNumber,
    slipData.grade,
    slipData.quantity,
    slipData.unit,
    slipData.weight,
    slipData.poNumber,
    slipData.customerName,
    slipData.destination,
    slipData.vehicleNumber,
    slipData.driverName,
    slipData.transporter,
    slipData.hsnCode || "",
    slipData.invoiceNumber || "",
    slipData.remarks || "",
    slipData.status || "dispatched",
  ];

  // text/plain avoids CORS preflight; Apps Script still receives the JSON body
  const response = await fetchWithRetry(scriptUrl, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ sheetId: sheetsId, tabName, row }),
    redirect: "follow",
  }, DEFAULT_RETRY_COUNT);

  return response.json();
}

export async function fetchSlipHistory(config) {
  const { sheetsId, apiKey, tabName = DEFAULT_SLIP_TAB } = config;

  const response = await fetch(
    `${SHEETS_API_URL}/${sheetsId}/values/${encodeURIComponent(tabName)}!${SLIP_SHEET_RANGE}?key=${apiKey}`
  );

  if (!response.ok) return [];

  const data = await response.json();
  const rows = data.values || [];

  return rows.slice(1).map((row) => ({
    slipNumber: row[0],
    createdAt: row[1],
    itemDescription: row[2],
    batchLotNumber: row[3],
    grade: row[4],
    quantity: row[5],
    unit: row[6],
    weight: row[7],
    poNumber: row[8],
    customerName: row[9],
    destination: row[10],
    vehicleNumber: row[11],
    driverName: row[12],
    transporter: row[13],
    hsnCode: row[14],
    invoiceNumber: row[15],
    remarks: row[16],
    status: row[17],
  })).reverse();
}
