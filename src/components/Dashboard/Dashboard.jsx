import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { getTodayCount } from "../../services/slipGenerator";
import { formatDate } from "../../utils/formatters";
import { useSettings } from "../../context/SettingsContext";

export default function Dashboard() {
  const [slips] = useLocalStorage("dispatchflow_slips", []);
  const navigate = useNavigate();
  const todayCount = getTodayCount();
  const { merged } = useSettings();

  const hasGeminiKey = !!merged.geminiApiKey;
  const hasSheetsConfig = merged.sheets.enabled;

  return (
    <div className="space-y-6">
      {/* Setup banners */}
      {!hasGeminiKey && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
          <span className="text-2xl">⚙️</span>
          <div>
            <p className="font-semibold text-amber-400 text-sm">Configure Gemini API Key</p>
            <p className="text-xs text-gray-400 mt-1">
              Go to{" "}
              <button onClick={() => navigate("/settings")} className="text-amber-400 hover:underline">
                Settings
              </button>{" "}
              and add your Gemini API key to enable OCR tag scanning. App works in manual-entry mode until then.
            </p>
          </div>
        </div>
      )}
      {!hasSheetsConfig && (
        <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl p-4 flex items-start gap-3">
          <span className="text-xl">💡</span>
          <p className="text-xs text-gray-500">
            Tip: Connect Google Sheets for cloud backup — go to{" "}
            <button onClick={() => navigate("/settings")} className="text-amber-500 hover:underline">
              Settings
            </button>{" "}
            and enter your Sheet URL and API key.
          </p>
        </div>
      )}

      {/* Hero CTA */}
      <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/5 border border-amber-500/30 rounded-2xl p-6 text-center space-y-4">
        <div className="text-5xl">🚚</div>
        <h1 className="text-2xl font-bold">DispatchFlow</h1>
        <p className="text-gray-400 text-sm max-w-sm mx-auto">
          Scan dispatch tags with AI and generate professional dispatch slips instantly.
        </p>
        <button
          onClick={() => navigate("/create")}
          className="btn-primary text-base px-8 py-3 rounded-xl"
        >
          + Create New Dispatch Slip
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card text-center">
          <div className="text-3xl font-bold text-amber-400 font-mono">{todayCount}</div>
          <div className="text-xs text-gray-500 mt-1">Today's Dispatches</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-gray-300 font-mono">{slips.length}</div>
          <div className="text-xs text-gray-500 mt-1">Total Slips</div>
        </div>
      </div>

      {/* Recent slips */}
      {slips.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="section-header">Recent Slips</p>
            <button onClick={() => navigate("/history")} className="text-xs text-amber-500 hover:text-amber-400">
              View all →
            </button>
          </div>
          <div className="space-y-2">
            {slips.slice(0, 5).map((slip) => (
              <div
                key={slip.slipNumber}
                onClick={() => navigate(`/history/${slip.slipNumber}`)}
                className="card hover:border-[#4A4A4C] cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <span className="slip-number text-sm">{slip.slipNumber}</span>
                  <div className="text-sm text-gray-400 truncate">{slip.customerName}</div>
                </div>
                <div className="text-xs text-gray-600 flex-shrink-0">{formatDate(slip.createdAt)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
