const normalizeValue = (value) => {
  if (value === null || value === undefined) {
    return "Unknown";
  }

  if (typeof value === "object") {
    return value.level || value.name || value.label || "Unknown";
  }

  return String(value);
};

export const formatLabel = (value) => {
  const label = normalizeValue(value);

  return label
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const statusStyles = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "in progress": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  resolved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
};

const priorityStyles = {
  low: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  high: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  critical: "bg-red-500/10 text-red-400 border-red-500/20",
};

export function StatusBadge({ value }) {
  const label = normalizeValue(value);
  const key = label.toLowerCase();

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${
        statusStyles[key] ||
        "bg-slate-500/10 text-slate-400 border-slate-500/20"
      }`}
    >
      {formatLabel(label)}
    </span>
  );
}

export function PriorityBadge({ value }) {
  const label = normalizeValue(value);
  const key = label.toLowerCase();

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${
        priorityStyles[key] ||
        "bg-slate-500/10 text-slate-400 border-slate-500/20"
      }`}
    >
      {formatLabel(label)}
    </span>
  );
}