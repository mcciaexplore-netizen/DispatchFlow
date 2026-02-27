import { getDateCode } from "../utils/formatters";

const STORAGE_KEY = "dispatchflow_inv_seq";

export function generateInvoiceId(prefix = "INV") {
  const todayKey = getDateCode();
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

  if (stored.date !== todayKey) {
    stored.date = todayKey;
    stored.seq = 0;
  }

  stored.seq = (stored.seq || 0) + 1;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

  const seq = String(stored.seq).padStart(4, "0");
  return `${prefix}-${todayKey}-${seq}`;
}
