import { formatDate, formatDateTime } from "../../utils/formatters";

export function printSlip(slipData, company) {
  const win = window.open("", "_blank", "width=800,height=600");
  if (!win) return;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Dispatch Slip ${slipData.slipNumber}</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet"/>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Sans', Arial, sans-serif; font-size: 12px; color: #000; background: #fff; padding: 20px; }
    @page { size: A4; margin: 15mm; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 12px; }
    .company-name { font-size: 20px; font-weight: 700; }
    .company-info { font-size: 11px; color: #444; margin-top: 4px; line-height: 1.6; }
    .badge { background: #000; color: #fff; padding: 4px 14px; border-radius: 4px; font-size: 13px; font-weight: 700; letter-spacing: 1px; }
    .slip-number { font-family: 'JetBrains Mono', monospace; font-size: 18px; font-weight: 600; color: #B45309; margin-top: 6px; }
    .meta-row { display: flex; gap: 20px; font-size: 11px; color: #555; margin-bottom: 12px; }
    .customer-box { border: 1.5px solid #000; border-radius: 4px; padding: 10px 14px; margin-bottom: 12px; }
    .customer-box label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #666; }
    .customer-box p { font-size: 13px; font-weight: 600; margin-top: 2px; }
    .customer-box small { font-size: 11px; color: #444; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
    th { background: #000; color: #fff; padding: 6px 8px; text-align: left; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    td { padding: 7px 8px; border-bottom: 1px solid #ddd; font-size: 11px; vertical-align: top; }
    tr:nth-child(even) td { background: #f9f9f9; }
    .transport-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 12px; border: 1px solid #ddd; border-radius: 4px; padding: 10px; }
    .transport-row label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #666; font-weight: 600; }
    .transport-row p { font-size: 11px; margin-top: 2px; font-weight: 500; }
    .remarks { border: 1px solid #ddd; border-radius: 4px; padding: 8px 12px; margin-bottom: 12px; font-size: 11px; color: #444; }
    .signature-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 24px; }
    .signature-box { border-top: 1.5px solid #000; padding-top: 6px; text-align: center; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .footer-note { border-top: 1px solid #ddd; padding-top: 8px; margin-top: 16px; font-size: 10px; color: #888; text-align: center; }
    @media print {
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      ${company.logo ? `<img src="${company.logo}" alt="Logo" style="height:48px;margin-bottom:6px;"/>` : ""}
      <div class="company-name">${company.name}</div>
      <div class="company-info">
        ${company.address}<br/>
        GSTIN: ${company.gstin} &nbsp;|&nbsp; ${company.phone} &nbsp;|&nbsp; ${company.email}
      </div>
    </div>
    <div style="text-align:right;">
      <div class="badge">DISPATCH SLIP</div>
      <div class="slip-number">${slipData.slipNumber}</div>
    </div>
  </div>

  <div class="meta-row">
    <span><strong>Date:</strong> ${formatDate(slipData.createdAt)}</span>
    <span><strong>Time:</strong> ${new Date(slipData.createdAt).toLocaleTimeString("en-IN", {hour:"2-digit",minute:"2-digit"})}</span>
    ${slipData.poNumber ? `<span><strong>PO No:</strong> ${slipData.poNumber}</span>` : ""}
    ${slipData.invoiceNumber ? `<span><strong>Invoice:</strong> ${slipData.invoiceNumber}</span>` : ""}
  </div>

  <div class="customer-box">
    <label>Customer &amp; Destination</label>
    <p>${slipData.customerName || "—"}</p>
    ${slipData.destination ? `<small>${slipData.destination}</small>` : ""}
  </div>

  <table>
    <thead>
      <tr>
        <th>Item Description</th>
        <th>Batch / Lot #</th>
        <th>Grade</th>
        <th>Qty</th>
        <th>Unit</th>
        <th>Weight</th>
        ${slipData.hsnCode ? "<th>HSN</th>" : ""}
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${slipData.itemDescription || "—"}</td>
        <td style="font-family:'JetBrains Mono',monospace">${slipData.batchLotNumber || "—"}</td>
        <td>${slipData.grade || "—"}</td>
        <td><strong>${slipData.quantity || "—"}</strong></td>
        <td>${slipData.unit || "—"}</td>
        <td>${slipData.weight || "—"}</td>
        ${slipData.hsnCode ? `<td>${slipData.hsnCode}</td>` : ""}
      </tr>
    </tbody>
  </table>

  <div class="transport-row">
    <div>
      <label>Vehicle No.</label>
      <p>${slipData.vehicleNumber || "—"}</p>
    </div>
    <div>
      <label>Driver</label>
      <p>${slipData.driverName || "—"}</p>
    </div>
    <div>
      <label>Transporter</label>
      <p>${slipData.transporter || "—"}</p>
    </div>
  </div>

  ${slipData.remarks ? `<div class="remarks"><strong>Remarks:</strong> ${slipData.remarks}</div>` : ""}

  <div class="signature-row">
    <div class="signature-box">Prepared By</div>
    <div class="signature-box">Checked By</div>
    <div class="signature-box">Received By</div>
  </div>

  <div class="footer-note">
    This is a system-generated dispatch slip &nbsp;|&nbsp; ${company.name} &nbsp;|&nbsp; Generated on ${formatDateTime(slipData.createdAt)}
  </div>

  <script>window.onload = function(){ window.print(); };</script>
</body>
</html>`;

  win.document.write(html);
  win.document.close();
}
