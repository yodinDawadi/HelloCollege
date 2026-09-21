import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  ChevronLeft,
  LoaderCircle,
  MapPin,
  Save,
  Tag,
  UserRound,
  Users,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import {
  assignComplaint,
  getComplaint,
  updateComplaintStatus,
} from "../../api";
import { LoadingPage } from "../../components/common/Loading";
import ErrorState from "../../components/common/ErrorState";
import { PriorityBadge, StatusBadge, formatLabel } from "../../components/common/Badge";
import { formatDate } from "../../utils/formatters";

const STATUS = ["pending", "in_progress", "resolved", "rejected"];

export default function ComplaintDetailsPage() {
  const { id } = useParams();

  const [complaint, setComplaint] = useState(null);
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingAssignment, setSavingAssignment] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      const response = await getComplaint(id);

      const item =
        response.data?.data?.complaint ||
        response.data?.data ||
        response.data?.complaint ||
        response.data;

      setComplaint(item);
      setStatus(item?.status || "pending");

      setAssignedTo(
        typeof item?.assignedTo === "object"
          ? item.assignedTo?._id || item.assignedTo?.id || ""
          : item?.assignedTo || ""
      );
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
  }, [id]);

  async function handleStatusUpdate() {
    setSavingStatus(true);
    setError("");
    setSuccess("");

    try {
      await updateComplaintStatus(id, {
        status,
        note,
      });

      setNote("");
      setSuccess("Complaint status updated successfully.");
      await load();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message
      );
    } finally {
      setSavingStatus(false);
    }
  }

  async function handleAssignment() {
    if (!assignedTo.trim()) return;

    setSavingAssignment(true);
    setError("");
    setSuccess("");

    try {
      await assignComplaint(id, {
        assignedTo: assignedTo.trim(),
      });

      setSuccess("Complaint assignment updated successfully.");
      await load();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message
      );
    } finally {
      setSavingAssignment(false);
    }
  }

  if (loading) {
    return <LoadingPage text="Loading complaint..." />;
  }

  if (error && !complaint) {
    return <ErrorState message={error} onRetry={load} />;
  }

  const history =
    complaint?.statusHistory ||
    complaint?.history ||
    [];

  return (
    <div className="space-y-5">
      <Link
        to="/complaints"
        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
      >
        <ChevronLeft size={16} />
        Back to complaints
      </Link>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-bold tracking-[0.18em] text-slate-600">
            {complaint?.complaintNumber || id}
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">
            {formatLabel(complaint?.category)} complaint
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {formatDate(complaint?.createdAt)} ·{" "}
            {complaint?.department || "Unassigned department"}
          </p>
        </div>

        <StatusBadge value={complaint?.status} />
      </div>

      {success && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-300">
          {success}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between border-b border-slate-800 p-5">
            <h2 className="text-sm font-bold text-white">
              Complaint details
            </h2>

            <PriorityBadge value={complaint?.priority} />
          </div>

          <div className="p-5">
            <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
              {complaint?.description || "No description provided."}
            </p>
          </div>

          <div className="grid gap-2 p-5 pt-0 sm:grid-cols-2">
            <Meta
              icon={MapPin}
              label="Location"
              value={complaint?.location || "—"}
            />
            <Meta
              icon={Tag}
              label="Category"
              value={formatLabel(complaint?.category)}
            />
            <Meta
              icon={Users}
              label="Department"
              value={complaint?.department || "—"}
            />
            <Meta
              icon={UserRound}
              label="Assigned to"
              value={
                typeof complaint?.assignedTo === "object"
                  ? complaint.assignedTo?.name ||
                    complaint.assignedTo?.email ||
                    "Assigned"
                  : complaint?.assignedTo || "Unassigned"
              }
            />
          </div>

          {complaint?.attachmentUrl && (
            <a
              href={complaint.attachmentUrl}
              target="_blank"
              rel="noreferrer"
              className="mx-5 mb-5 inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
            >
              Open attachment
              <ArrowUpRight size={14} />
            </a>
          )}
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/60">
          <div className="border-b border-slate-800 p-5">
            <h2 className="text-sm font-bold text-white">
              Administrator actions
            </h2>
          </div>

          <div className="space-y-4 p-5">
            <label className="block text-xs font-semibold text-slate-400">
              Status
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs text-slate-300 outline-none focus:border-indigo-500"
              >
                {STATUS.map((item) => (
                  <option key={item} value={item}>
                    {formatLabel(item)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-xs font-semibold text-slate-400">
              Administrative note
              <textarea
                rows={4}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional note for the status change"
                className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs text-slate-300 outline-none placeholder:text-slate-700 focus:border-indigo-500"
              />
            </label>

            <button
              disabled={savingStatus || status === complaint?.status}
              onClick={handleStatusUpdate}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {savingStatus ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Update status
            </button>

            <div className="h-px bg-slate-800" />

            <label className="block text-xs font-semibold text-slate-400">
              Assign to user
              <input
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="User ID"
                className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs text-slate-300 outline-none placeholder:text-slate-700 focus:border-indigo-500"
              />
            </label>

            <button
              disabled={savingAssignment || !assignedTo.trim()}
              onClick={handleAssignment}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {savingAssignment ? "Saving..." : "Save assignment"}
            </button>
          </div>
        </section>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
        <div className="border-b border-slate-800 p-5">
          <h2 className="text-sm font-bold text-white">Status history</h2>
          <p className="mt-1 text-xs text-slate-600">
            Timestamped records returned by the backend.
          </p>
        </div>

        {history.length ? (
          <div className="divide-y divide-slate-800 p-5">
            {history
              .slice()
              .reverse()
              .map((item, index) => (
                <div key={index} className="flex gap-3 py-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-400 shadow-[0_0_0_4px_rgba(129,140,248,0.08)]" />

                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <strong className="text-xs text-slate-200">
                        {formatLabel(item.status || item.newStatus)}
                      </strong>
                      <span className="text-[10px] text-slate-600">
                        {formatDate(
                          item.createdAt ||
                            item.timestamp ||
                            item.date
                        )}
                      </span>
                    </div>

                    <p className="mt-1 text-[11px] text-slate-600">
                      {item.note || "No administrative note."}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <p className="p-10 text-center text-xs text-slate-600">
            No status history was returned.
          </p>
        )}
      </section>
    </div>
  );
}

function Meta({ icon: Icon, label, value }) {
  return (
    <div className="flex gap-2 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
      <Icon size={16} className="mt-0.5 shrink-0 text-slate-600" />

      <div className="min-w-0">
        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-700">
          {label}
        </p>
        <p className="mt-1 break-words text-[11px] font-semibold text-slate-300">
          {value}
        </p>
      </div>
    </div>
  );
}
