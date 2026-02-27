import { getDateCode } from "../utils/formatters";

const STORAGE_KEY = "dispatchflow_seq";

function getTodayKey() {
  return getDateCode();
}

export function generateSlipNumber(prefix = "DS") {
  const todayKey = getTodayKey();
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

  // Reset sequence if it's a new day
  if (stored.date !== todayKey) {
    stored.date = todayKey;
    stored.seq = 0;
  }

  stored.seq = (stored.seq || 0) + 1;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

  const seq = String(stored.seq).padStart(4, "0");
  return `${prefix}-${todayKey}-${seq}`;
}

export function getTodayCount() {
  const todayKey = getTodayKey();
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  if (stored.date !== todayKey) return 0;
  return stored.seq || 0;
}
