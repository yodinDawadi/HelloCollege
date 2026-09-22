import { useEffect, useState } from "react";
import { Filter, RefreshCw, Search } from "lucide-react";
import { Link } from "react-router-dom";

import { getCategories, getComplaints } from "../../api";
import { LoadingInline } from "../../components/common/Loading";
import EmptyState from "../../components/common/EmptyState";
import ErrorState from "../../components/common/ErrorState";
import {
  PriorityBadge,
  StatusBadge,
  formatLabel,
} from "../../components/common/Badge";
import { formatDate, getId, truncate } from "../../utils/formatters";

const STATUS = ["pending", "in_progress", "resolved", "rejected"];

export default function ComplaintsPage() {
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    department: "",
    page: 1,
    pageSize: 10,
  });

  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pageSize: 10,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load(nextFilters = filters) {
    setLoading(true);
    setError("");

    try {
      const response = await getComplaints(nextFilters);

      const data = response.data?.data || response.data || {};

      const items =
        data.complaints ||
        data.items ||
        data.results ||
        (Array.isArray(data) ? data : []);

      const meta = data.pagination || {};

      setComplaints(Array.isArray(items) ? items : []);

      setPagination({
        total: meta.total ?? data.total ?? items.length,
        page: meta.page ?? nextFilters.page,
        pageSize: meta.pageSize ?? meta.limit ?? nextFilters.pageSize,
      });
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

  async function loadCategories() {
    try {
      const response = await getCategories();

      /*
       * Handle possible backend response formats:
       *
       * ["electricity", "internet", "hostel"]
       *
       * { categories: ["electricity", "internet"] }
       *
       * { data: ["electricity", "internet"] }
       *
       * { data: { categories: [...] } }
       */

      let data = response.data;

      if (data?.data !== undefined) {
        data = data.data;
      }

      if (data?.categories !== undefined) {
        data = data.categories;
      }

      if (!Array.isArray(data)) {
        data = [];
      }

      setCategories(data);
    } catch (err) {
      console.error("Failed to load categories:", err);
      setCategories([]);
    }
  }

  useEffect(() => {
    load();
    loadCategories();
  }, []);

  function changeFilter(name, value) {
    const next = {
      ...filters,
      [name]: value,
      page: 1,
    };

    setFilters(next);
    load(next);
  }

  function changePage(page) {
    const next = {
      ...filters,
      page,
    };

    setFilters(next);
    load(next);
  }

  const totalPages = Math.max(
    1,
    Math.ceil(pagination.total / pagination.pageSize)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-bold tracking-[0.18em] text-slate-600">
            OPERATIONS
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">
            Complaint queue
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Review, assign and resolve complaints submitted by students.
          </p>
        </div>

        <button
          onClick={() => load()}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <section className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-3 md:grid-cols-[auto_1fr_1fr_1fr]">
        <div className="flex items-center gap-2 px-2 text-xs font-bold text-slate-400">
          <Filter size={16} />
          Filters
        </div>

        <select
          value={filters.status}
          onChange={(e) => changeFilter("status", e.target.value)}
          className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs text-slate-300 outline-none focus:border-indigo-500"
        >
          <option value="">All statuses</option>

          {STATUS.map((status) => (
            <option key={status} value={status}>
              {formatLabel(status)}
            </option>
          ))}
        </select>

        <select
          value={filters.category}
          onChange={(e) => changeFilter("category", e.target.value)}
          className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs text-slate-300 outline-none focus:border-indigo-500"
        >
          <option value="">All categories</option>

          {categories.map((category, index) => {
            /*
             * Support both strings and category objects.
             */

            let value;

            if (typeof category === "string") {
              value = category;
            } else if (category && typeof category === "object") {
              value =
                category.value ??
                category.key ??
                category.slug ??
                category.name ??
                category.category ??
                category.id;
            }

            if (!value) {
              return null;
            }

            return (
              <option key={`${value}-${index}`} value={value}>
                {formatLabel(value)}
              </option>
            );
          })}
        </select>

        <input
          value={filters.department}
          onChange={(e) => changeFilter("department", e.target.value)}
          placeholder="Department"
          className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs text-slate-300 outline-none placeholder:text-slate-700 focus:border-indigo-500"
        />
      </section>

      {error ? (
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60">
          <ErrorState message={error} onRetry={() => load()} />
        </section>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between border-b border-slate-800 p-5">
            <div>
              <h2 className="text-sm font-bold text-white">
                All complaints
              </h2>

              <p className="mt-1 text-xs text-slate-600">
                {pagination.total} record
                {pagination.total === 1 ? "" : "s"}
              </p>
            </div>

            <span className="hidden items-center gap-1.5 text-[10px] text-slate-600 sm:flex">
              <Search size={13} />
              Server-side filtering
            </span>
          </div>

          {loading ? (
            <LoadingInline />
          ) : complaints.length ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse">
                  <thead>
                    <tr className="bg-slate-950/60 text-left text-[10px] uppercase tracking-wider text-slate-600">
                      <th className="px-5 py-3">Complaint</th>
                      <th className="px-5 py-3">Category</th>
                      <th className="px-5 py-3">Priority</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Department</th>
                      <th className="px-5 py-3">Created</th>
                      <th className="px-5 py-3" />
                    </tr>
                  </thead>

                  <tbody>
                    {complaints.map((complaint) => {
                      const id = getId(complaint);

                      return (
                        <tr
                          key={id || complaint.complaintNumber}
                          className="border-t border-slate-800 hover:bg-slate-900"
                        >
                          <td className="px-5 py-4">
                            <div className="min-w-56">
                              <p className="text-xs font-bold text-slate-200">
                                {complaint.complaintNumber ||
                                  id ||
                                  "Unknown"}
                              </p>

                              <p className="mt-1 text-[10px] text-slate-600">
                                {truncate(complaint.description)}
                              </p>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-xs text-slate-400">
                            {formatLabel(complaint.category)}
                          </td>

                          <td className="px-5 py-4">
                            <PriorityBadge value={complaint.priority} />
                          </td>

                          <td className="px-5 py-4">
                            <StatusBadge value={complaint.status} />
                          </td>

                          <td className="px-5 py-4 text-xs text-slate-400">
                            {complaint.department || "—"}
                          </td>

                          <td className="px-5 py-4 text-xs text-slate-500">
                            {formatDate(complaint.createdAt)}
                          </td>

                          <td className="px-5 py-4">
                            <Link
                              to={`/complaints/${id}`}
                              className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 px-2.5 py-1.5 text-[10px] font-bold text-indigo-300 hover:bg-indigo-500/10"
                            >
                              Open
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between border-t border-slate-800 px-5 py-3 text-[11px] text-slate-600">
                <span>
                  Page {pagination.page} of {totalPages}
                </span>

                <div className="flex gap-1.5">
                  <button
                    disabled={pagination.page <= 1}
                    onClick={() => changePage(pagination.page - 1)}
                    className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 disabled:opacity-30"
                  >
                    Previous
                  </button>

                  <button
                    disabled={pagination.page >= totalPages}
                    onClick={() => changePage(pagination.page + 1)}
                    className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 disabled:opacity-30"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          ) : (
            <EmptyState message="No complaints match the current filters." />
          )}
        </section>
      )}
    </div>
  );
}