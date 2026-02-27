import { getDateCode } from "../utils/formatters";
import { LS_KEYS, ID_SEQ_PADDING, DEFAULT_SLIP_PREFIX } from "../utils/constants";

const STORAGE_KEY = LS_KEYS.SLIP_SEQ;

function getTodayKey() {
  return getDateCode();
}

export function generateSlipNumber(prefix = DEFAULT_SLIP_PREFIX) {
  const todayKey = getTodayKey();
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

  // Reset sequence if it's a new day
  if (stored.date !== todayKey) {
    stored.date = todayKey;
    stored.seq = 0;
  }

  stored.seq = (stored.seq || 0) + 1;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

  const seq = String(stored.seq).padStart(ID_SEQ_PADDING, "0");
  return `${prefix}-${todayKey}-${seq}`;
}

export function getTodayCount() {
  const todayKey = getTodayKey();
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  if (stored.date !== todayKey) return 0;
  return stored.seq || 0;
}
