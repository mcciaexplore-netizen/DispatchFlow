import { useParams, useNavigate } from "react-router-dom";
import { useLocalStorage } from "../hooks/useLocalStorage";
import SlipPreview from "../components/SlipPreview/SlipPreview";

export default function SlipDetailPage() {
  const { slipNumber } = useParams();
  const [slips] = useLocalStorage("dispatchflow_slips", []);
  const navigate = useNavigate();

  const slip = slips.find((s) => s.slipNumber === slipNumber);

  if (!slip) {
    return (
      <div className="card text-center py-12">
        <div className="text-4xl mb-3">🔍</div>
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
