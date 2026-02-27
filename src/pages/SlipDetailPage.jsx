import { useParams, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { LS_KEYS } from "../utils/constants";
import SlipPreview from "../components/SlipPreview/SlipPreview";

export default function SlipDetailPage() {
  const { slipNumber } = useParams();
  const [slips] = useLocalStorage(LS_KEYS.SLIPS, []);
  const navigate = useNavigate();

  const slip = slips.find((s) => s.slipNumber === slipNumber);

  if (!slip) {
    return (
      <div className="card text-center py-12">
        <div className="flex justify-center mb-3">
          <Search className="w-10 h-10 text-slate-300 dark:text-gray-600" />
        </div>
        <p className="text-gray-400">Slip not found.</p>
        <button onClick={() => navigate("/history")} className="btn-secondary mt-4 text-sm">
          Back to History
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SlipPreview
        slipData={slip}
        onBack={() => navigate("/history")}
        onSave={null}
        saving={false}
      />
    </div>
  );
}
