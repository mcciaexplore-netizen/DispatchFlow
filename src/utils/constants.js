// ── LocalStorage keys ────────────────────────────────────────────────────────
// Single source of truth. Import LS_KEYS instead of inlining raw strings.
export const LS_KEYS = {
  SLIPS:    "dispatchflow_slips",
  INVOICES: "dispatchflow_invoices",
  SETTINGS: "dispatchflow_settings",
  SLIP_SEQ: "dispatchflow_seq",
  INV_SEQ:  "dispatchflow_inv_seq",
  THEME:    "dispatchflow_theme",
};

// ── Gemini ───────────────────────────────────────────────────────────────────
export const GEMINI_API_BASE           = "https://generativelanguage.googleapis.com/v1beta/models";
// Primary model — most capable, used first
export const GEMINI_MODEL              = "gemini-2.5-flash";
export const GEMINI_API_URL            = `${GEMINI_API_BASE}/${GEMINI_MODEL}:generateContent`;
// Fallback model — higher free quota, guarantees JSON via responseMimeType
export const GEMINI_MODEL_FALLBACK     = "gemini-1.5-flash";
export const GEMINI_API_URL_FALLBACK   = `${GEMINI_API_BASE}/${GEMINI_MODEL_FALLBACK}:generateContent`;
export const GEMINI_MAX_TOKENS         = 2048;
export const GEMINI_MAX_TOKENS_INVOICE = 4096;  // invoices have more text
export const GEMINI_TEMPERATURE        = 0.1;

// ── Retry / Loading ──────────────────────────────────────────────────────────
export const DEFAULT_RETRY_COUNT   = 3;
export const SKELETON_DELAY_MS     = 400;

// ── ID Generation ────────────────────────────────────────────────────────────
export const ID_SEQ_PADDING        = 4;     // e.g. 0001
export const DEFAULT_SLIP_PREFIX   = "DS";
export const DEFAULT_INV_PREFIX    = "INV";

// ── Google Sheets ────────────────────────────────────────────────────────────
export const DEFAULT_SLIP_TAB      = "Sheet1";
export const DEFAULT_INV_TAB       = "Invoices";
export const SLIP_SHEET_RANGE      = "A:R";
export const INVOICE_SHEET_RANGE   = "A:AE";
export const SHEETS_API_BASE       = "https://sheets.googleapis.com/v4/spreadsheets";

// ── Dispatch slip statuses ────────────────────────────────────────────────────
export const UNITS = [
  "pcs", "kg", "tons", "ltrs", "boxes", "rolls", "bags", "drums", "sets", "nos", "meters"
];

export const STATUS_OPTIONS = [
  { value: "dispatched", label: "Dispatched" },
  { value: "pending",    label: "Pending" },
  { value: "cancelled",  label: "Cancelled" },
];

export const FIELD_LABELS = {
  itemDescription: "Item Description",
  batchLotNumber:  "Batch / Lot Number",
  grade:           "Grade / Specification",
  quantity:        "Quantity",
  unit:            "Unit",
  weight:          "Total Weight",
  poNumber:        "PO Number",
  customerName:    "Customer Name",
  destination:     "Destination Address",
  vehicleNumber:   "Vehicle Number",
  driverName:      "Driver Name",
  transporter:     "Transporter",
  hsnCode:         "HSN Code",
  invoiceNumber:   "Invoice Number",
  remarks:         "Remarks",
};
