import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  ClipboardList,
  Clock3,
  LoaderCircle,
  RefreshCw,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getDashboard } from "../../api";
import StatCard from "../../components/common/StatCard";
import { LoadingPage } from "../../components/common/Loading";
import ErrorState from "../../components/common/ErrorState";
import { formatLabel } from "../../components/common/Badge";

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      const response = await getDashboard();
      setData(response.data?.data || response.data || {});
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <LoadingPage text="Loading dashboard..." />;

  if (error) {
    return <ErrorState message={error} onRetry={load} />;
  }

  const dashboard = data || {};
  const categories =
    dashboard.categories ||
    dashboard.categoryCounts ||
    dashboard.byCategory ||
    [];

  const categoryRows = Array.isArray(categories)
    ? categories
    : Object.entries(categories).map(([category, count]) => ({
        category,
        count,
      }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-bold tracking-[0.18em] text-slate-600">
            OVERVIEW
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">
            Campus complaints
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Monitor workload and move complaints through the resolution
            workflow.
          </p>
        </div>

        <button
          onClick={load}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total complaints"
          value={dashboard.totalComplaints ?? dashboard.total}
          icon={ClipboardList}
          iconClass="bg-blue-500/10 text-blue-300"
        />
        <StatCard
          label="Pending"
          value={dashboard.pendingComplaints ?? dashboard.pending}
          icon={Clock3}
          iconClass="bg-amber-500/10 text-amber-300"
        />
        <StatCard
          label="In progress"
          value={
            dashboard.inProgressComplaints ??
            dashboard.in_progress ??
            dashboard.inProgress
          }
          icon={LoaderCircle}
          iconClass="bg-violet-500/10 text-violet-300"
        />
        <StatCard
          label="Resolved"
          value={dashboard.resolvedComplaints ?? dashboard.resolved}
          icon={CheckCircle2}
          iconClass="bg-emerald-500/10 text-emerald-300"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between border-b border-slate-800 p-5">
            <div>
              <h2 className="text-sm font-bold text-white">
                Complaints by category
              </h2>
              <p className="mt-1 text-xs text-slate-600">
                Current administrator summary.
              </p>
            </div>

            <Link
              to="/complaints"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
            >
              View queue
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="p-5">
            {categoryRows.length ? (
              <div className="divide-y divide-slate-800">
                {categoryRows.map((item, index) => (
                  <div
                    key={item.category || index}
                    className="flex items-center justify-between py-3 text-xs"
                  >
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                      {formatLabel(item.category)}
                    </div>
                    <strong className="text-slate-200">
                      {item.count ?? item.total ?? 0}
                    </strong>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-10 text-center text-xs text-slate-600">
                No category summary was returned by the API.
              </p>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
          <div className="border-b border-slate-800 p-5">
            <h2 className="text-sm font-bold text-white">Admin workflow</h2>
            <p className="mt-1 text-xs text-slate-600">
              Actions available from the current backend.
            </p>
          </div>

          <div className="divide-y divide-slate-800 p-5">
            <Workflow
              icon={ClipboardList}
              title="Review queue"
              text="Filter complaints by status, category and department."
            />
            <Workflow
              icon={UserRound}
              title="Assign"
              text="Assign a complaint to a responsible user."
            />
            <Workflow
              icon={CheckCircle2}
              title="Update status"
              text="Move complaints through the resolution workflow."
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function Workflow({ icon: Icon, title, text }) {
  return (
    <div className="flex gap-3 py-3">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-800 text-indigo-300">
        <Icon size={16} />
      </div>

      <div>
        <p className="text-xs font-bold text-slate-200">{title}</p>
        <p className="mt-1 text-[11px] leading-5 text-slate-600">{text}</p>
      </div>
    </div>
  );
}
