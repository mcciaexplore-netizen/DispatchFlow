const SHEETS_API_URL = "https://sheets.googleapis.com/v4/spreadsheets";

export async function appendSlipToSheet(slipData, config) {
  const { sheetsId, apiKey } = config;

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

  const response = await fetch(
    `${SHEETS_API_URL}/${sheetsId}/values/Sheet1!A:R:append?valueInputOption=USER_ENTERED&key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ values: [row] }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to save to Google Sheets");
  }

  return response.json();
}

export async function fetchSlipHistory(config) {
  const { sheetsId, apiKey } = config;

  const response = await fetch(
    `${SHEETS_API_URL}/${sheetsId}/values/Sheet1!A:R?key=${apiKey}`
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
