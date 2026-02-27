import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SettingsProvider } from "./context/SettingsContext";
import { ThemeProvider } from "./context/ThemeContext";
import Header from "./components/Layout/Header";
import Footer from "./components/Layout/Footer";
import Dashboard from "./components/Dashboard/Dashboard";
import CreateSlipPage from "./pages/CreateSlipPage";
import HistoryPage from "./pages/HistoryPage";
import SlipDetailPage from "./pages/SlipDetailPage";
import SettingsPage from "./pages/SettingsPage";
import InvoicePage from "./pages/InvoicePage";
import InvoiceHistoryPage from "./pages/InvoiceHistoryPage";
import InvoiceDetailPage from "./pages/InvoiceDetailPage";

export default function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#141416] transition-colors duration-200">
          <Header />
          <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/create" element={<CreateSlipPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/history/:slipNumber" element={<SlipDetailPage />} />
              <Route path="/invoices" element={<InvoicePage />} />
              <Route path="/invoices/history" element={<InvoiceHistoryPage />} />
              <Route path="/invoices/history/:invoiceId" element={<InvoiceDetailPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
      </SettingsProvider>
    </ThemeProvider>
  );
}
