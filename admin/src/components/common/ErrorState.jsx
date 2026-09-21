import { AlertTriangle } from "lucide-react";

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="flex min-h-60 flex-col items-center justify-center gap-3 text-center">
      <AlertTriangle className="text-red-400" size={28} />
      <h3 className="font-semibold text-slate-200">Could not load this view</h3>
      <p className="max-w-md text-xs text-slate-500">{message}</p>
      <button
        onClick={onRetry}
        className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
      >
        Try again
      </button>
    </div>
  );
}
