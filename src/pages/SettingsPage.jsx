import { useState, useRef } from "react";
import { useSettings, extractSheetId } from "../context/SettingsContext";
import { fetchSlipHistory } from "../services/googleSheets";
import { fetchInvoiceHistory } from "../services/invoiceSheets";

const GEMINI_TEST_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

async function testGeminiKey(apiKey) {
  const res = await fetch(`${GEMINI_TEST_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: "Reply with the single word: ok" }] }],
      generationConfig: { maxOutputTokens: 5 },
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || "Invalid API key");
  }
  return true;
}

function SecretField({ label, value, onChange, placeholder, hint }) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-400">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          className="input-field pr-16 font-mono text-sm"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-300 px-2 py-1"
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
      {hint && <p className="text-xs text-gray-600">{hint}</p>}
    </div>
  );
}

function StatusBadge({ status, error }) {
  if (!status) return null;
  const styles = {
    testing: "bg-amber-500/20 text-amber-400",
    ok: "bg-green-500/20 text-green-400",
    error: "bg-red-500/20 text-red-400",
  };
  const labels = { testing: "Testing...", ok: "✓ Connected", error: "✗ Failed" };
  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs px-2 py-1 rounded-full font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
      {status === "error" && error && (
        <span className="text-xs text-red-400">{error}</span>
      )}
    </div>
  );
}

// Reusable sheet storage config block
function SheetStorageSection({ title, description, fields, onTest, testStatus, testError, headerNote }) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-semibold text-gray-200">{title}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-400">Google Sheet URL or ID</label>
        <input
          className="input-field text-sm"
          placeholder="https://docs.google.com/spreadsheets/d/... or paste Sheet ID"
          value={fields.sheetUrl}
          onChange={(e) => fields.onSheetUrl(e.target.value)}
        />
        {fields.sheetUrl && extractSheetId(fields.sheetUrl) !== fields.sheetUrl && (
          <p className="text-xs text-green-400">
            Sheet ID extracted: <span className="font-mono">{extractSheetId(fields.sheetUrl)}</span>
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-400">Tab / Sheet Name</label>
        <input
          className="input-field text-sm w-48"
          placeholder={fields.tabPlaceholder || "Sheet1"}
          value={fields.tabName}
          onChange={(e) => fields.onTabName(e.target.value)}
        />
        <p className="text-xs text-gray-600">The name of the tab inside the spreadsheet</p>
      </div>
      <SecretField
        label="Sheets API Key"
        value={fields.apiKey}
        onChange={fields.onApiKey}
        placeholder="AIzaSy..."
      />
      {headerNote && (
        <div className="bg-[#141416] rounded-lg p-3 text-xs text-gray-500 font-mono leading-relaxed">
          <p className="text-gray-400 mb-1 font-sans">Required header row (copy into Row 1 of the tab):</p>
          {headerNote}
        </div>
      )}
      <div className="flex items-center gap-3">
        <button onClick={onTest} className="btn-secondary text-sm">
          Test Connection
        </button>
        <StatusBadge status={testStatus} error={testError} />
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { settings, setSettings, merged } = useSettings();

  const [form, setForm] = useState({
    geminiApiKey: settings.geminiApiKey ?? "",
    // Dispatch slips storage
    slipsSheetId: settings.slipsSheetId ?? settings.sheetsId ?? "",
    slipsSheetApiKey: settings.slipsSheetApiKey ?? settings.sheetsApiKey ?? "",
    slipsTabName: settings.slipsTabName ?? "",
    // Invoices storage
    invoicesSheetId: settings.invoicesSheetId ?? "",
    invoicesSheetApiKey: settings.invoicesSheetApiKey ?? "",
    invoicesTabName: settings.invoicesTabName ?? "",
    invoicesSameApiKey: settings.invoicesSameApiKey ?? false,
    // Company
    companyName: settings.companyName ?? "",
    companyAddress: settings.companyAddress ?? "",
    companyGstin: settings.companyGstin ?? "",
    companyPhone: settings.companyPhone ?? "",
    companyEmail: settings.companyEmail ?? "",
    companyLogo: settings.companyLogo ?? "",
    // Slip
    slipPrefix: settings.slipPrefix ?? "",
  });

  const [geminiStatus, setGeminiStatus] = useState(null);
  const [geminiError, setGeminiError] = useState("");
  const [slipsTestStatus, setSlipsTestStatus] = useState(null);
  const [slipsTestError, setSlipsTestError] = useState("");
  const [invoicesTestStatus, setInvoicesTestStatus] = useState(null);
  const [invoicesTestError, setInvoicesTestError] = useState("");
  const [saved, setSaved] = useState(false);
  const [importError, setImportError] = useState("");
  const importRef = useRef(null);

  const setField = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setSaved(false);
  };

  const handleSave = () => {
    setSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dispatchflow-settings.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImportError("");
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target.result);
        if (typeof imported !== "object" || imported === null) throw new Error("Invalid file");
        setSettings(imported);
        setForm({
          geminiApiKey: imported.geminiApiKey ?? "",
          slipsSheetId: imported.slipsSheetId ?? imported.sheetsId ?? "",
          slipsSheetApiKey: imported.slipsSheetApiKey ?? imported.sheetsApiKey ?? "",
          slipsTabName: imported.slipsTabName ?? "",
          invoicesSheetId: imported.invoicesSheetId ?? "",
          invoicesSheetApiKey: imported.invoicesSheetApiKey ?? "",
          invoicesTabName: imported.invoicesTabName ?? "",
          invoicesSameApiKey: imported.invoicesSameApiKey ?? false,
          companyName: imported.companyName ?? "",
          companyAddress: imported.companyAddress ?? "",
          companyGstin: imported.companyGstin ?? "",
          companyPhone: imported.companyPhone ?? "",
          companyEmail: imported.companyEmail ?? "",
          companyLogo: imported.companyLogo ?? "",
          slipPrefix: imported.slipPrefix ?? "",
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } catch {
        setImportError("Invalid settings file. Please use a file exported from DispatchFlow.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleTestGemini = async () => {
    const key = form.geminiApiKey || merged.geminiApiKey;
    if (!key) { setGeminiError("Enter an API key first."); return; }
    setGeminiStatus("testing");
    setGeminiError("");
    try {
      await testGeminiKey(key);
      setGeminiStatus("ok");
    } catch (err) {
      setGeminiStatus("error");
      setGeminiError(err.message);
    }
  };

  const handleTestSlips = async () => {
    const sheetsId = extractSheetId(form.slipsSheetId);
    const apiKey = form.slipsSheetApiKey;
    const tabName = form.slipsTabName || "Sheet1";
    if (!sheetsId || !apiKey) { setSlipsTestError("Enter Sheet URL and API key first."); return; }
    setSlipsTestStatus("testing");
    setSlipsTestError("");
    try {
      await fetchSlipHistory({ sheetsId, apiKey });
      setSlipsTestStatus("ok");
    } catch (err) {
      setSlipsTestStatus("error");
      setSlipsTestError(err.message || "Could not connect.");
    }
  };

  const handleTestInvoices = async () => {
    const sheetsId = extractSheetId(form.invoicesSheetId);
    const apiKey = form.invoicesSameApiKey
      ? form.slipsSheetApiKey
      : form.invoicesSheetApiKey;
    const tabName = form.invoicesTabName || "Invoices";
    if (!sheetsId || !apiKey) { setInvoicesTestError("Enter Sheet URL and API key first."); return; }
    setInvoicesTestStatus("testing");
    setInvoicesTestError("");
    try {
      await fetchInvoiceHistory({ sheetsId, apiKey, tabName });
      setInvoicesTestStatus("ok");
    } catch (err) {
      setInvoicesTestStatus("error");
      setInvoicesTestError(err.message || "Could not connect.");
    }
  };

  const previewCompany = {
    name: form.companyName || merged.company.name,
    address: form.companyAddress || merged.company.address,
    gstin: form.companyGstin || merged.company.gstin,
    phone: form.companyPhone || merged.company.phone,
    email: form.companyEmail || merged.company.email,
  };

  const effectiveInvoicesApiKey = form.invoicesSameApiKey
    ? form.slipsSheetApiKey
    : form.invoicesSheetApiKey;

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-xl font-bold">Settings</h1>

      {/* ── Gemini OCR ── */}
      <div className="card space-y-4">
        <p className="section-header">AI / OCR Engine</p>
        <SecretField
          label="Gemini API Key"
          value={form.geminiApiKey}
          onChange={(v) => setField("geminiApiKey", v)}
          placeholder="AIzaSy..."
          hint={
            merged.geminiApiKey && !form.geminiApiKey
              ? "Currently using key from environment variable."
              : ""
          }
        />
        <div className="flex items-center gap-3">
          <button onClick={handleTestGemini} className="btn-secondary text-sm">
            Test Connection
          </button>
          <StatusBadge status={geminiStatus} error={geminiError} />
        </div>
        <p className="text-xs text-gray-600">
          This key is used for both dispatch tag scanning and invoice digitization.{" "}
          Get a free key at{" "}
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noreferrer"
            className="text-amber-500 hover:underline"
          >
            aistudio.google.com/apikey
          </a>
        </p>
      </div>

      {/* ── Data Storage ── */}
      <div className="card space-y-6">
        <div>
          <p className="section-header">Data Storage</p>
          <p className="text-xs text-gray-500">
            All records always save to your browser (localStorage). Google Sheets is an optional cloud backup.
            Each data type has its own sheet configuration — you can use one spreadsheet with different tabs, or separate spreadsheets entirely.
          </p>
        </div>

        <div className="border-t border-[#2C2C2E] pt-4">
          <SheetStorageSection
            title="Dispatch Slips"
            description="Where generated dispatch slips are synced"
            fields={{
              sheetUrl: form.slipsSheetId,
              onSheetUrl: (v) => setField("slipsSheetId", v),
              tabName: form.slipsTabName,
              onTabName: (v) => setField("slipsTabName", v),
              tabPlaceholder: "Sheet1",
              apiKey: form.slipsSheetApiKey,
              onApiKey: (v) => setField("slipsSheetApiKey", v),
            }}
            headerNote={
              <span>
                Slip No | Date | Item | Batch | Grade | Qty | Unit | Weight | PO | Customer | Destination | Vehicle | Driver | Transporter | HSN | Invoice | Remarks | Status
              </span>
            }
            onTest={handleTestSlips}
            testStatus={slipsTestStatus}
            testError={slipsTestError}
          />
        </div>

        <div className="border-t border-[#2C2C2E] pt-4">
          <SheetStorageSection
            title="Invoices"
            description="Where scanned and digitized invoices are stored"
            fields={{
              sheetUrl: form.invoicesSheetId,
              onSheetUrl: (v) => setField("invoicesSheetId", v),
              tabName: form.invoicesTabName,
              onTabName: (v) => setField("invoicesTabName", v),
              tabPlaceholder: "Invoices",
              apiKey: form.invoicesSameApiKey ? form.slipsSheetApiKey : form.invoicesSheetApiKey,
              onApiKey: (v) => setField("invoicesSheetApiKey", v),
            }}
            headerNote={
              <span>
                Invoice ID | Created At | Invoice No. | Invoice Date | Due Date | Vendor Name | Vendor GSTIN | Vendor Phone | Vendor Email | Vendor Address | Buyer Name | Buyer GSTIN | Buyer Address | Place of Supply | Reverse Charge | HSN Codes | Line Items | Subtotal | CGST | SGST | IGST | Total Tax | Total Amount | Total in Words | Payment Terms | Bank Name | Account No. | IFSC | UPI ID | Notes | Status
              </span>
            }
            onTest={handleTestInvoices}
            testStatus={invoicesTestStatus}
            testError={invoicesTestError}
          />
          <div className="mt-3 flex items-center gap-2">
            <input
              type="checkbox"
              id="sameApiKey"
              checked={form.invoicesSameApiKey}
              onChange={(e) => setField("invoicesSameApiKey", e.target.checked)}
              className="accent-amber-500"
            />
            <label htmlFor="sameApiKey" className="text-xs text-gray-400 cursor-pointer">
              Use same API key as Dispatch Slips
            </label>
          </div>
        </div>

        <div className="border-t border-[#2C2C2E] pt-3 text-xs text-gray-600 space-y-1">
          <p className="font-medium text-gray-500">How to set up Google Sheets:</p>
          <p>1. Create a Google Sheet (one spreadsheet can hold both tabs).</p>
          <p>2. Add two tabs: rename one to <span className="font-mono text-gray-400">Sheet1</span> (or your preferred name) and another to <span className="font-mono text-gray-400">Invoices</span>.</p>
          <p>3. Paste the header rows above into Row 1 of each tab.</p>
          <p>4. Share the spreadsheet → <strong>Anyone with link → Editor</strong>.</p>
          <p>
            5. Get an API key from{" "}
            <a
              href="https://console.cloud.google.com/"
              target="_blank"
              rel="noreferrer"
              className="text-amber-500 hover:underline"
            >
              Google Cloud Console
            </a>{" "}
            (enable Google Sheets API first).
          </p>
        </div>
      </div>

      {/* ── Company Details ── */}
      <div className="card space-y-4">
        <p className="section-header">Company Details</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2 flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-400">Company Name</label>
            <input
              className="input-field text-sm"
              placeholder="Mehta Engineering Pvt Ltd"
              value={form.companyName}
              onChange={(e) => setField("companyName", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2 flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-400">Address</label>
            <textarea
              className="input-field resize-none text-sm"
              rows={2}
              placeholder="Plot 45, MIDC Bhosari, Pune 411026"
              value={form.companyAddress}
              onChange={(e) => setField("companyAddress", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-400">GSTIN</label>
            <input
              className="input-field font-mono text-sm uppercase"
              placeholder="27AABCM1234F1Z5"
              value={form.companyGstin}
              onChange={(e) => setField("companyGstin", e.target.value.toUpperCase())}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-400">Phone</label>
            <input
              className="input-field text-sm"
              placeholder="+91 98765 43210"
              value={form.companyPhone}
              onChange={(e) => setField("companyPhone", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-400">Email</label>
            <input
              className="input-field text-sm"
              placeholder="dispatch@company.com"
              value={form.companyEmail}
              onChange={(e) => setField("companyEmail", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-400">Logo URL (optional)</label>
            <input
              className="input-field text-sm"
              placeholder="https://..."
              value={form.companyLogo}
              onChange={(e) => setField("companyLogo", e.target.value)}
            />
          </div>
        </div>

        {/* Live company header preview */}
        <div className="border border-[#3A3A3C] rounded-lg p-3 bg-[#141416]">
          <p className="text-xs text-gray-600 mb-2">Slip header preview</p>
          <div className="flex justify-between items-start">
            <div>
              <div className="font-bold text-sm text-white">{previewCompany.name}</div>
              <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                {previewCompany.address}<br />
                GSTIN: {previewCompany.gstin} | {previewCompany.phone} | {previewCompany.email}
              </div>
            </div>
            <span className="bg-white text-gray-900 text-[10px] font-bold px-2 py-0.5 rounded tracking-widest">
              DISPATCH SLIP
            </span>
          </div>
        </div>
      </div>

      {/* ── Slip Settings ── */}
      <div className="card space-y-4">
        <p className="section-header">Slip Settings</p>
        <div className="flex flex-col gap-1 max-w-xs">
          <label className="text-xs font-medium text-gray-400">Slip Number Prefix</label>
          <input
            className="input-field font-mono text-sm uppercase w-32"
            placeholder="DS"
            maxLength={6}
            value={form.slipPrefix}
            onChange={(e) => setField("slipPrefix", e.target.value.toUpperCase())}
          />
          <p className="text-xs text-gray-600">
            Slip numbers will look like:{" "}
            <span className="font-mono text-amber-400">
              {(form.slipPrefix || merged.slipPrefix || "DS")}-260226-0001
            </span>
          </p>
        </div>
      </div>

      {/* ── Backup & Restore ── */}
      <div className="card space-y-3">
        <p className="section-header">Backup & Restore</p>
        <p className="text-xs text-gray-500">
          Export your settings as a JSON file to back them up or move them to another device. Importing will overwrite all current settings.
        </p>
        <div className="flex gap-3 flex-wrap items-center">
          <button onClick={handleExport} className="btn-secondary text-sm">
            Export Settings
          </button>
          <button onClick={() => importRef.current?.click()} className="btn-secondary text-sm">
            Import Settings
          </button>
          <input
            ref={importRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleImport}
          />
        </div>
        {importError && (
          <p className="text-xs text-red-400">{importError}</p>
        )}
      </div>

      {/* ── Save ── */}
      <div className="flex items-center gap-4 pb-6">
        <button onClick={handleSave} className="btn-primary px-8 py-2.5">
          Save Settings
        </button>
        {saved && (
          <span className="text-sm text-green-400">✓ Settings saved</span>
        )}
      </div>
    </div>
  );
}
