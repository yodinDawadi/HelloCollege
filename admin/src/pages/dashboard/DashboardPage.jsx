import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  ClipboardList,
  Clock3,
  LoaderCircle,
  RefreshCw,
  UserRound,
  TrendingUp,
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

      const result = response.data?.data || response.data || {};

      setData(result);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  /*
   * IMPORTANT:
   * All hooks are above the conditional returns.
   */

  if (loading) {
    return <LoadingPage text="Loading dashboard..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={load} />;
  }

  const dashboard = data || {};

  /*
   * ============================================================
   * BASIC STATISTICS
   * ============================================================
   */

  const total = Number(
    dashboard.totalComplaints ??
      dashboard.total ??
      0
  );

  const pending = Number(
    dashboard.pendingComplaints ??
      dashboard.pending ??
      0
  );

  const inProgress = Number(
    dashboard.inProgressComplaints ??
      dashboard.in_progress ??
      dashboard.inProgress ??
      0
  );

  const resolved = Number(
    dashboard.resolvedComplaints ??
      dashboard.resolved ??
      0
  );

  const rejected = Number(
    dashboard.rejectedComplaints ??
      dashboard.rejected ??
      0
  );

  const activeComplaints = pending + inProgress;

  /*
   * ============================================================
   * RATES
   * ============================================================
   */

  const resolutionRate =
    total > 0
      ? Math.round((resolved / total) * 100)
      : 0;

  const pendingRate =
    total > 0
      ? Math.round((pending / total) * 100)
      : 0;

  const inProgressRate =
    total > 0
      ? Math.round((inProgress / total) * 100)
      : 0;

  const rejectedRate =
    total > 0
      ? Math.round((rejected / total) * 100)
      : 0;

  /*
   * ============================================================
   * CATEGORY DATA
   * ============================================================
   */

  const categories =
    dashboard.categories ||
    dashboard.categoryCounts ||
    dashboard.byCategory ||
    [];

  let categoryRows = Array.isArray(categories)
    ? categories
    : Object.entries(categories).map(
        ([category, count]) => ({
          category,
          count,
        })
      );

  categoryRows = categoryRows
    .map((item) => {
      /*
       * Backend may return:
       *
       * "electricity"
       *
       * or:
       *
       * {
       *   category: "electricity",
       *   count: 5
       * }
       */

      if (typeof item === "string") {
        return {
          category: item,
          count: 0,
        };
      }

      return {
        category:
          item?.category ||
          item?.name ||
          item?.label ||
          item?.value ||
          "Unknown",

        count: Number(
          item?.count ??
            item?.total ??
            item?.valueCount ??
            0
        ),
      };
    })
    .filter(
      (item) =>
        item.category &&
        item.category !== "Unknown"
    )
    .sort((a, b) => b.count - a.count);

  const maxCategoryCount = Math.max(
    ...categoryRows.map((item) => item.count),
    1
  );

  /*
   * ============================================================
   * STATUS GRAPH CALCULATIONS
   * ============================================================
   */

  const statusTotal =
    pending +
    inProgress +
    resolved +
    rejected;

  const pendingPercent =
    statusTotal > 0
      ? (pending / statusTotal) * 100
      : 0;

  const inProgressPercent =
    statusTotal > 0
      ? (inProgress / statusTotal) * 100
      : 0;

  const resolvedPercent =
    statusTotal > 0
      ? (resolved / statusTotal) * 100
      : 0;

  const rejectedPercent =
    statusTotal > 0
      ? (rejected / statusTotal) * 100
      : 0;

  const pendingEnd = pendingPercent;

  const progressStart = pendingEnd;
  const progressEnd =
    progressStart + inProgressPercent;

  const resolvedStart = progressEnd;
  const resolvedEnd =
    resolvedStart + resolvedPercent;

  /*
   * ============================================================
   * DASHBOARD UI
   * ============================================================
   */

  return (
    <div className="space-y-6">

      {/* ======================================================
          HEADER
      ======================================================= */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-bold tracking-[0.18em] text-slate-600">
            OVERVIEW
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">
            Campus complaints
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Monitor complaint volume, workload,
            resolution progress, and category
            distribution.
          </p>
        </div>

        <button
          onClick={load}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-300 transition hover:bg-slate-800"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* ======================================================
          MAIN STAT CARDS
      ======================================================= */}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          label="Total complaints"
          value={total}
          icon={ClipboardList}
          iconClass="bg-blue-500/10 text-blue-300"
        />

        <StatCard
          label="Pending"
          value={pending}
          icon={Clock3}
          iconClass="bg-amber-500/10 text-amber-300"
        />

        <StatCard
          label="In progress"
          value={inProgress}
          icon={LoaderCircle}
          iconClass="bg-violet-500/10 text-violet-300"
        />

        <StatCard
          label="Resolved"
          value={resolved}
          icon={CheckCircle2}
          iconClass="bg-emerald-500/10 text-emerald-300"
        />

      </div>

      {/* ======================================================
          SECONDARY STATISTICS
      ======================================================= */}

      <div className="grid gap-3 sm:grid-cols-3">

        <MiniStat
          icon={TrendingUp}
          label="Resolution rate"
          value={`${resolutionRate}%`}
          text={`${resolved} of ${total} complaints resolved`}
        />

        <MiniStat
          icon={AlertCircle}
          label="Active workload"
          value={activeComplaints}
          text={`${pending} pending · ${inProgress} in progress`}
        />

        <MiniStat
          icon={ClipboardList}
          label="Pending rate"
          value={`${pendingRate}%`}
          text={`${pending} complaints awaiting action`}
        />

      </div>

      {/* ======================================================
          STATUS GRAPH + RESOLUTION
      ======================================================= */}

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">

        {/* STATUS GRAPH */}

        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">

          <div className="border-b border-slate-800 p-5">
            <h2 className="text-sm font-bold text-white">
              Complaint status
            </h2>

            <p className="mt-1 text-xs text-slate-600">
              Current distribution of complaints by
              status.
            </p>
          </div>

          <div className="grid gap-8 p-6 sm:grid-cols-[220px_1fr]">

            {/* DONUT GRAPH */}

            <div className="flex items-center justify-center">

              <div
                className="relative h-48 w-48 rounded-full"
                style={{
                  background:
                    statusTotal > 0
                      ? `conic-gradient(
                          #f59e0b 0% ${pendingEnd}%,
                          #8b5cf6 ${progressStart}% ${progressEnd}%,
                          #10b981 ${resolvedStart}% ${resolvedEnd}%,
                          #ef4444 ${resolvedEnd}% 100%
                        )`
                      : "#1e293b",
                }}
              >

                <div className="absolute inset-[18px] grid place-items-center rounded-full bg-slate-900">

                  <div className="text-center">

                    <p className="text-3xl font-bold text-white">
                      {total}
                    </p>

                    <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-600">
                      Total
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* GRAPH LEGEND */}

            <div className="flex flex-col justify-center gap-4">

              <StatusRow
                label="Pending"
                value={pending}
                percent={pendingRate}
                dotClass="bg-amber-400"
              />

              <StatusRow
                label="In progress"
                value={inProgress}
                percent={inProgressRate}
                dotClass="bg-violet-400"
              />

              <StatusRow
                label="Resolved"
                value={resolved}
                percent={resolutionRate}
                dotClass="bg-emerald-400"
              />

              {rejected > 0 && (
                <StatusRow
                  label="Rejected"
                  value={rejected}
                  percent={rejectedRate}
                  dotClass="bg-red-400"
                />
              )}

            </div>

          </div>

        </section>

        {/* RESOLUTION OVERVIEW */}

        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">

          <div className="border-b border-slate-800 p-5">

            <h2 className="text-sm font-bold text-white">
              Resolution overview
            </h2>

            <p className="mt-1 text-xs text-slate-600">
              Current progress of the complaint
              workflow.
            </p>

          </div>

          <div className="space-y-6 p-6">

            {/* PROGRESS */}

            <div>

              <div className="mb-2 flex items-center justify-between">

                <span className="text-xs font-semibold text-slate-400">
                  Resolution progress
                </span>

                <span className="text-xs font-bold text-emerald-400">
                  {resolutionRate}%
                </span>

              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-800">

                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{
                    width: `${resolutionRate}%`,
                  }}
                />

              </div>

            </div>

            {/* METRICS */}

            <div className="grid grid-cols-2 gap-3">

              <MetricBox
                label="Resolved"
                value={resolved}
                className="text-emerald-400"
              />

              <MetricBox
                label="Remaining"
                value={activeComplaints}
                className="text-amber-400"
              />

            </div>

            {/* WORKLOAD MESSAGE */}

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">

              <div className="flex gap-3">

                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-indigo-500/10 text-indigo-300">
                  <UserRound size={17} />
                </div>

                <div>

                  <p className="text-xs font-bold text-slate-200">
                    Administrator workload
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-slate-600">
                    {activeComplaints > 0
                      ? `${activeComplaints} complaints currently require administrative attention.`
                      : "There are currently no active complaints requiring attention."}
                  </p>

                </div>

              </div>

            </div>

            {/* QUEUE BUTTON */}

            <Link
              to="/complaints"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-500/20 bg-indigo-500/5 px-4 py-3 text-xs font-bold text-indigo-300 transition hover:bg-indigo-500/10"
            >
              Open complaint queue
              <ArrowUpRight size={14} />
            </Link>

          </div>

        </section>

      </div>

      {/* ======================================================
          CATEGORY GRAPH
      ======================================================= */}

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">

        <div className="flex items-center justify-between border-b border-slate-800 p-5">

          <div>

            <h2 className="text-sm font-bold text-white">
              Complaints by category
            </h2>

            <p className="mt-1 text-xs text-slate-600">
              Distribution of complaints across
              campus service categories.
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

          {categoryRows.length > 0 ? (
            <div className="space-y-5">

              {categoryRows.map(
                (item, index) => {

                  const percentage =
                    total > 0
                      ? Math.round(
                          (item.count / total) * 100
                        )
                      : 0;

                  const width =
                    maxCategoryCount > 0
                      ? (item.count /
                          maxCategoryCount) *
                        100
                      : 0;

                  return (
                    <div
                      key={`${item.category}-${index}`}
                    >

                      {/* LABEL */}

                      <div className="mb-2 flex items-center justify-between">

                        <div className="flex items-center gap-2">

                          <span className="h-2 w-2 rounded-full bg-indigo-400" />

                          <span className="text-xs font-medium text-slate-300">
                            {formatLabel(
                              item.category
                            )}
                          </span>

                        </div>

                        <div className="flex items-center gap-3">

                          <span className="text-[10px] text-slate-600">
                            {percentage}%
                          </span>

                          <span className="min-w-6 text-right text-xs font-bold text-slate-200">
                            {item.count}
                          </span>

                        </div>

                      </div>

                      {/* BAR */}

                      <div className="h-2 overflow-hidden rounded-full bg-slate-800">

                        <div
                          className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                          style={{
                            width: `${width}%`,
                          }}
                        />

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          ) : (
            <div className="py-12 text-center">

              <ClipboardList
                size={30}
                className="mx-auto text-slate-700"
              />

              <p className="mt-3 text-xs text-slate-600">
                No category summary was returned
                by the API.
              </p>

            </div>
          )}

        </div>

      </section>

      {/* ======================================================
          ADMIN WORKFLOW
      ======================================================= */}

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">

        <div className="border-b border-slate-800 p-5">

          <h2 className="text-sm font-bold text-white">
            Admin workflow
          </h2>

          <p className="mt-1 text-xs text-slate-600">
            Main operations available from the
            administrator panel.
          </p>

        </div>

        <div className="grid gap-0 divide-y divide-slate-800 sm:grid-cols-3 sm:divide-x sm:divide-y-0">

          <Workflow
            icon={ClipboardList}
            title="Review queue"
            text="Filter complaints by status, category and department."
          />

          <Workflow
            icon={UserRound}
            title="Assign"
            text="Assign complaints to the responsible administrator or department."
          />

          <Workflow
            icon={CheckCircle2}
            title="Update status"
            text="Move complaints through pending, in-progress and resolved states."
          />

        </div>

      </section>

    </div>
  );
}


/*
|--------------------------------------------------------------------------
| STATUS ROW
|--------------------------------------------------------------------------
*/

function StatusRow({
  label,
  value,
  percent,
  dotClass,
}) {
  return (
    <div className="flex items-center justify-between">

      <div className="flex items-center gap-3">

        <span
          className={`h-2.5 w-2.5 rounded-full ${dotClass}`}
        />

        <div>

          <p className="text-xs font-semibold text-slate-300">
            {label}
          </p>

          <p className="text-[10px] text-slate-600">
            {percent}% of complaints
          </p>

        </div>

      </div>

      <span className="text-sm font-bold text-slate-200">
        {value}
      </span>

    </div>
  );
}


/*
|--------------------------------------------------------------------------
| MINI STAT
|--------------------------------------------------------------------------
*/

function MiniStat({
  icon: Icon,
  label,
  value,
  text,
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold text-white">
            {value}
          </p>

        </div>

        <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-800 text-indigo-300">
          <Icon size={17} />
        </div>

      </div>

      <p className="mt-2 text-[11px] text-slate-600">
        {text}
      </p>

    </div>
  );
}


/*
|--------------------------------------------------------------------------
| METRIC BOX
|--------------------------------------------------------------------------
*/

function MetricBox({
  label,
  value,
  className,
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">

      <p className="text-[10px] uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p
        className={`mt-2 text-2xl font-bold ${className}`}
      >
        {value}
      </p>

    </div>
  );
}


/*
|--------------------------------------------------------------------------
| WORKFLOW
|--------------------------------------------------------------------------
*/

function Workflow({
  icon: Icon,
  title,
  text,
}) {
  return (
    <div className="flex gap-3 p-5">

      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-800 text-indigo-300">
        <Icon size={16} />
      </div>

      <div>

        <p className="text-xs font-bold text-slate-200">
          {title}
        </p>

        <p className="mt-1 text-[11px] leading-5 text-slate-600">
          {text}
        </p>

      </div>

    </div>
  );
}