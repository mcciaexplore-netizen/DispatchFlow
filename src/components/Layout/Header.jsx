import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const location = useLocation();

  const isActive = (path) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);

  const navItems = [
    { path: "/", label: "Dashboard", exact: true },
    { path: "/create", label: "New Slip" },
    { path: "/invoices", label: "Invoices" },
    { path: "/history", label: "Slip History" },
    { path: "/settings", label: "⚙" },
  ];

  return (
    <header className="bg-[#1C1C1E] border-b border-[#2C2C2E] sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="6" fill="#F59E0B"/>
            <path d="M6 10h20M6 16h14M6 22h10" stroke="#1C1C1E" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
          <span className="font-bold text-gray-100 tracking-tight hidden sm:inline">DispatchFlow</span>
        </Link>
        <nav className="flex items-center gap-0.5 overflow-x-auto">
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
                    : "text-gray-400 hover:text-gray-100 hover:bg-[#2C2C2E]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
