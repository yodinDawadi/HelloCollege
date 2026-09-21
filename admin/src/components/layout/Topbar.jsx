import { Menu, ShieldCheck } from "lucide-react";
import { useLocation } from "react-router-dom";

export default function Topbar({ onMenu }) {
  const location = useLocation();

  const title =
    location.pathname === "/"
      ? "Dashboard"
      : location.pathname.startsWith("/complaints/")
        ? "Complaint Details"
        : "Complaint Management";

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-800 bg-slate-950/85 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenu}
          className="grid h-9 w-9 place-items-center rounded-lg border border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-white lg:hidden"
        >
          <Menu size={19} />
        </button>

        <div>
          <p className="text-[10px] font-bold tracking-[0.18em] text-slate-600">
            ADMINISTRATION
          </p>
          <h2 className="text-sm font-bold text-slate-100">{title}</h2>
        </div>
      </div>

      <div className="hidden items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-400 sm:flex">
        <ShieldCheck size={14} className="text-indigo-400" />
        Administrator
      </div>
    </header>
  );
}
