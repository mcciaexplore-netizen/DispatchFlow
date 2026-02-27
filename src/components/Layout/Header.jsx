import { Link, useLocation } from "react-router-dom";
import { Settings } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-[#2C2C2E]"
    >
      {theme === "dark" ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4"/>
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      )}
    </button>
  );
}

const navItems = [
  { path: "/",                 label: "Dashboard",      exact: true },
  { path: "/create",           label: "New Slip",        exact: true },
  { path: "/invoices",         label: "Scan Invoice",    exact: true },
  { path: "/invoices/history", label: "Invoice History", exact: true },
  { path: "/history",          label: "Slip History" },
];

export default function Header() {
  const location = useLocation();

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50 dark:bg-[#1C1C1E] dark:border-[#2C2C2E] dark:shadow-none transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* ── Logo (far left) ── */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
          <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="7" fill="#F59E0B"/>
            <path d="M6 10h20M6 16h14M6 22h10" stroke="#1C1C1E" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
          <span className="font-bold text-slate-900 tracking-tight dark:text-gray-100 text-[15px]">DispatchFlow</span>
        </Link>

        {/* ── Nav (centre) ── */}
        <nav className="flex-1 flex items-center justify-center gap-0.5 overflow-x-auto min-w-0">
          {navItems.map((item) => {
            const active = item.exact
              ? location.pathname === item.path
              : location.pathname === item.path || location.pathname.startsWith(item.path + "/");
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  active
                    ? "bg-amber-500 text-gray-900"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-[#2C2C2E]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* ── Utilities (far right) ── */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <Link
            to="/settings"
            title="Settings"
            className={`p-2 rounded-lg transition-colors ${
              location.pathname === "/settings"
                ? "bg-amber-500 text-gray-900"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-[#2C2C2E]"
            }`}
          >
            <Settings className="w-[18px] h-[18px]" />
          </Link>
          <ThemeToggle />
        </div>

      </div>
    </header>
  );
}
