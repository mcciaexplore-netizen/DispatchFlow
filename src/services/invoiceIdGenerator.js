import { getDateCode } from "../utils/formatters";
import { LS_KEYS, ID_SEQ_PADDING, DEFAULT_INV_PREFIX } from "../utils/constants";

const STORAGE_KEY = LS_KEYS.INV_SEQ;

export function generateInvoiceId(prefix = DEFAULT_INV_PREFIX) {
  const todayKey = getDateCode();
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

  if (stored.date !== todayKey) {
    stored.date = todayKey;
    stored.seq = 0;
  }

  stored.seq = (stored.seq || 0) + 1;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

  const seq = String(stored.seq).padStart(ID_SEQ_PADDING, "0");
  return `${prefix}-${todayKey}-${seq}`;
}
