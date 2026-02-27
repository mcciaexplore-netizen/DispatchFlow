import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, CheckCircle } from "lucide-react";
import ScanZone from "../components/Scanner/ScanZone";
import SlipForm from "../components/SlipForm/SlipForm";
import SlipPreview from "../components/SlipPreview/SlipPreview";
import { useSlipForm } from "../hooks/useSlipForm";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { generateSlipNumber } from "../services/slipGenerator";
import { appendSlipToSheet } from "../services/googleSheets";
import { validateSlipForm, hasErrors } from "../utils/validators";
import { useSettings } from "../context/SettingsContext";
import { LS_KEYS } from "../utils/constants";

export default function CreateSlipPage() {
  const [step, setStep] = useState("form"); // "form" | "preview"
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);
  const [slips, setSlips] = useLocalStorage(LS_KEYS.SLIPS, []);
  const [pendingSlip, setPendingSlip] = useState(null);
  const navigate = useNavigate();
  const { merged } = useSettings();

  const { formData, errors, setErrors, setField, fillFromOCR, reset } = useSlipForm();

  const handleOCRSuccess = (parsed) => {
    fillFromOCR(parsed);
  };

  const handlePreview = () => {
    const errs = validateSlipForm(formData);
    if (hasErrors(errs)) {
      setErrors(errs);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const slip = {
      ...formData,
      slipNumber: generateSlipNumber(merged.slipPrefix),
      createdAt: new Date().toISOString(),
      status: "dispatched",
    };
    setPendingSlip(slip);
    setStep("preview");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async () => {
    if (!pendingSlip) return;
    setSaving(true);
    setSaveMsg(null);

    // Snapshot for rollback
    const prevSlips = slips;

    // Optimistic local save
    setSlips((prev) => [pendingSlip, ...prev]);

    // Try Google Sheets sync if configured
    if (merged.sheets.enabled) {
      try {
        await appendSlipToSheet(pendingSlip, merged.sheets);
        setSaveMsg({ type: "success", text: "Saved locally and synced to Google Sheets." });
      } catch (err) {
        // Rollback the local optimistic save
        setSlips(prevSlips);
        setSaving(false);
        setSaveMsg({
          type: "error",
          text: `Could not save slip. Cloud sync failed: ${err?.message || "unknown error"}. Please try again.`,
        });
        return;
      }
    } else {
      setSaveMsg({ type: "success", text: "Dispatch slip saved successfully!" });
    }

    setSaving(false);
    setTimeout(() => navigate("/history"), 1200);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-xl font-bold">New Dispatch Slip</h1>
        {step === "form" && (
          <span className="text-xs bg-slate-200 dark:bg-[#2C2C2E] text-slate-500 dark:text-gray-400 px-2 py-1 rounded">Step 1 of 2</span>
        )}
        {step === "preview" && (
          <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded">Step 2 of 2 — Preview</span>
        )}
      </div>

      {saveMsg && (
        <div className={`rounded-lg p-3 text-sm flex items-start gap-2 ${
          saveMsg.type === "success"
            ? "bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400"
            : saveMsg.type === "error"
            ? "bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400"
            : "bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400"
        }`}>
          {saveMsg.type === "success"
            ? <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            : <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
          {saveMsg.text}
        </div>
      )}

      {step === "form" ? (
        <>
          <ScanZone onOCRSuccess={handleOCRSuccess} apiKey={merged.geminiApiKey} />
          <SlipForm formData={formData} errors={errors} setField={setField} />
          <div className="flex gap-3 justify-end">
            <button onClick={reset} className="btn-secondary text-sm">
              Reset Form
            </button>
            <button onClick={handlePreview} className="btn-primary px-6">
              Preview Slip →
            </button>
          </div>
        </>
      ) : (
        <SlipPreview
          slipData={pendingSlip}
          onBack={() => setStep("form")}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </div>
  );
}
