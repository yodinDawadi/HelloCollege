import { LoaderCircle } from "lucide-react";

export function LoadingPage({ text = "Loading..." }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center gap-3 text-sm text-slate-500">
      <LoaderCircle size={21} className="animate-spin" />
      {text}
    </div>
  );
}

export function LoadingInline() {
  return (
    <div className="flex min-h-40 items-center justify-center gap-2 text-xs text-slate-500">
      <LoaderCircle size={18} className="animate-spin" />
      Loading...
    </div>
  );
}
