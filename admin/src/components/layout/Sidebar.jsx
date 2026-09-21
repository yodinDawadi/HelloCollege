import { NavLink } from "react-router-dom";
import {
  ClipboardList,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const links = [
  {
    label: "Dashboard",
    to: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Complaints",
    to: "/complaints",
    icon: ClipboardList,
  },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();

  return (
    <aside
      className={[
        "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800",
        "bg-slate-950 transition-transform duration-200 lg:static lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full",
      ].join(" ")}
    >
      <div className="flex h-20 items-center gap-3 border-b border-slate-800 px-5">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-950">
          <ShieldCheck size={21} />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-white">Campus CMS</p>
          <p className="text-xs text-slate-500">Admin Panel</p>
        </div>

        <button
          onClick={onClose}
          className="ml-auto grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-900 hover:text-white lg:hidden"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {links.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            onClick={onClose}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                isActive
                  ? "bg-indigo-500/10 text-indigo-300 ring-1 ring-inset ring-indigo-500/20"
                  : "text-slate-400 hover:bg-slate-900 hover:text-white",
              ].join(" ")
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-800 p-3">
        <div className="mb-2 flex items-center gap-3 rounded-xl p-2">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-800 text-sm font-bold text-indigo-300">
            {(user?.name || "A").slice(0, 1).toUpperCase()}
          </div>

          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-slate-200">
              {user?.name || "Administrator"}
            </p>
            <p className="truncate text-[10px] text-slate-500">
              {user?.email || "Admin account"}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
