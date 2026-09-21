import { ClipboardList } from "lucide-react";

export default function EmptyState({ message }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-2 px-6 text-center text-xs text-slate-600">
      <ClipboardList size={27} />
      <p>{message}</p>
    </div>
  );
}
