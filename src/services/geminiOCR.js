const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export async function scanDispatchTag(imageBase64, apiKey) {
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
            text: `You are a dispatch tag/label reader for a manufacturing/warehouse environment.

Carefully examine this image of a dispatch tag or label and extract ALL visible information.

Return ONLY a valid JSON object with these fields (use empty string "" if a field is not visible or not applicable):

{
  "itemDescription": "Full item/product name and specification",
  "batchLotNumber": "Batch number, lot number, or production batch ID",
  "grade": "Material grade, quality grade, or specification grade (e.g., SS304, IS2062, Grade A)",
  "quantity": "Numeric quantity only (no units)",
  "unit": "Unit of measurement (pcs, kg, tons, ltrs, boxes, rolls, bags, drums, sets, nos, meters)",
  "weight": "Total weight with unit (e.g., 186.5 kg)",
  "poNumber": "Purchase order number or sales order number",
  "customerName": "Customer or buyer company name",
  "destination": "Delivery address or destination",
  "vehicleNumber": "Vehicle registration number if visible",
  "driverName": "Driver name if visible",
  "transporter": "Transport company name if visible",
  "hsnCode": "HSN/SAC code if visible",
  "invoiceNumber": "Invoice number if visible",
  "remarks": "Any other relevant notes, handling instructions, or special markings"
}

IMPORTANT:
- Read carefully, industrial tags can be smudged or partially printed
- If text is unclear, make your best interpretation and note uncertainty in remarks
- For Indian dispatch tags, look for: challan numbers, GSTIN, lorry receipt numbers
- Return ONLY the JSON object, no markdown, no backticks, no explanation`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 1024,
    },
  };

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Gemini API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) throw new Error("No response from Gemini");

  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned);
}
