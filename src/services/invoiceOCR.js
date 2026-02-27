import { GEMINI_MAX_TOKENS_INVOICE, GEMINI_TEMPERATURE, callGeminiWithFallback } from "../utils/geminiUtils";

export async function scanInvoice(imageBase64, apiKey) {
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

  const requestBody = {
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Data,
            },
          },
          {
            text: `You are an expert invoice reader for Indian business documents.

Carefully examine this invoice image and extract ALL visible information.

Return ONLY a valid JSON object with these exact fields (use empty string "" if a field is not visible):

{
  "invoiceNumber": "Invoice number or bill number",
  "invoiceDate": "Invoice date (DD/MM/YYYY format)",
  "dueDate": "Due date or payment due date if visible",
  "paymentTerms": "Payment terms (e.g., Net 30, Immediate, 15 days)",

  "vendorName": "Seller / supplier company name",
  "vendorAddress": "Seller full address",
  "vendorGstin": "Seller GSTIN (15-character alphanumeric)",
  "vendorPhone": "Seller phone number",
  "vendorEmail": "Seller email address",

  "buyerName": "Buyer / bill-to company name",
  "buyerAddress": "Buyer full address",
  "buyerGstin": "Buyer GSTIN if visible",

  "placeOfSupply": "Place of supply (state name or code)",
  "reverseCharge": "Yes or No — whether reverse charge applies",
  "hsnCodes": "Comma-separated list of HSN/SAC codes from line items",

  "lineItems": "Formatted as: '1. [description] | [qty] [unit] | [rate] | [amount]; 2. ...' — include ALL line items",

  "subtotal": "Subtotal before tax (numeric, no currency symbol)",
  "cgst": "CGST amount (numeric)",
  "sgst": "SGST amount (numeric)",
  "igst": "IGST amount (numeric)",
  "totalTax": "Total tax amount (numeric)",
  "totalAmount": "Final invoice total including tax (numeric)",
  "totalInWords": "Total amount in words if printed on invoice",

  "bankName": "Bank name for payment",
  "accountNumber": "Bank account number",
  "ifscCode": "IFSC code",
  "upiId": "UPI ID if visible",

  "notes": "Any additional notes, terms, or conditions printed on the invoice"
}

IMPORTANT:
- For Indian GST invoices, look carefully for: GSTIN, SAC/HSN codes, CGST/SGST/IGST split
- Vendor = the one issuing the invoice (FROM); Buyer = the one receiving (TO/BILL TO)
- Line items: capture ALL rows in the items table, numbered sequentially
- If amounts use commas as thousand separators (e.g., 1,25,000), keep them as-is
- Return ONLY the JSON object, no markdown, no backticks, no explanation`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: GEMINI_TEMPERATURE,
      maxOutputTokens: GEMINI_MAX_TOKENS_INVOICE,
    },
  };

  return callGeminiWithFallback(requestBody, apiKey);
}

// Sanitize the raw Gemini response into clean field strings
export function parseInvoiceOCR(raw) {
  if (!raw || typeof raw !== "object") return {};
  const fields = [
    "invoiceNumber", "invoiceDate", "dueDate", "paymentTerms",
    "vendorName", "vendorAddress", "vendorGstin", "vendorPhone", "vendorEmail",
    "buyerName", "buyerAddress", "buyerGstin",
    "placeOfSupply", "reverseCharge", "hsnCodes",
    "lineItems",
    "subtotal", "cgst", "sgst", "igst", "totalTax", "totalAmount", "totalInWords",
    "bankName", "accountNumber", "ifscCode", "upiId",
    "notes",
  ];
  const out = {};
  fields.forEach((f) => {
    const v = raw[f];
    out[f] = v && typeof v === "string" ? v.trim() : "";
  });
  return out;
}
