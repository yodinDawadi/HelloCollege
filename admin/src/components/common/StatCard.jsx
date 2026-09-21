export default function StatCard({ label, value, icon: Icon, iconClass }) {
  return (
    <div className="flex min-h-28 items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${iconClass}`}>
        <Icon size={20} />
      </div>

      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-bold tracking-tight text-white">
          {value ?? "—"}
        </p>
      </div>
    </div>
  );
}
