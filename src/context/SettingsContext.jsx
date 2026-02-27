import { createContext, useContext, useState } from "react";
import config from "../config";

const SettingsContext = createContext(null);

const STORAGE_KEY = "dispatchflow_settings";

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Extract sheet ID from a full Google Sheets URL or return the value as-is
export function extractSheetId(urlOrId) {
  if (!urlOrId || !urlOrId.includes("/")) return urlOrId || "";
  const match = urlOrId.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : urlOrId;
}

function makeStorage(rawId, rawApiKey, tabName, envId, envApiKey, defaultTab) {
  const sheetsId = rawId ? extractSheetId(rawId) : extractSheetId(envId);
  const apiKey = rawApiKey ?? envApiKey;
  return {
    sheetsId,
    apiKey,
    tabName: tabName || defaultTab,
    get enabled() {
      return !!(this.sheetsId && this.apiKey);
    },
  };
}

export function SettingsProvider({ children }) {
  const [settings, setSettingsState] = useState(load);

  const setSettings = (next) => {
    const updated = typeof next === "function" ? next(settings) : next;
    setSettingsState(updated);
    save(updated);
  };

  // Merge: localStorage values override env-var defaults from config.js
  const merged = {
    geminiApiKey: settings.geminiApiKey ?? config.gemini.apiKey,
    slipPrefix: settings.slipPrefix ?? config.slip.prefix,
    company: {
      name: settings.companyName ?? config.company.name,
      address: settings.companyAddress ?? config.company.address,
      gstin: settings.companyGstin ?? config.company.gstin,
      phone: settings.companyPhone ?? config.company.phone,
      email: settings.companyEmail ?? config.company.email,
      logo: settings.companyLogo ?? config.company.logo,
    },
    // Dispatch slips storage — backward compat: old 'sheetsId'/'sheetsApiKey' keys still work
    dispatchStorage: makeStorage(
      settings.slipsSheetId ?? settings.sheetsId,
      settings.slipsSheetApiKey ?? settings.sheetsApiKey,
      settings.slipsTabName,
      config.sheets.sheetsId,
      config.sheets.apiKey,
      "Sheet1"
    ),
    // Invoice storage — separate config
    invoiceStorage: makeStorage(
      settings.invoicesSheetId,
      settings.invoicesSheetApiKey,
      settings.invoicesTabName,
      "",
      "",
      "Invoices"
    ),
    // Keep legacy 'sheets' alias so existing CreateSlipPage code keeps working
    get sheets() {
      return this.dispatchStorage;
    },
  };

  return (
    <SettingsContext.Provider value={{ settings, setSettings, merged }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside SettingsProvider");
  return ctx;
}
