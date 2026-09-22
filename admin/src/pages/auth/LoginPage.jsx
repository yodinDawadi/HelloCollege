import { useState } from "react";
import { LoaderCircle, ShieldCheck } from "lucide-react";
import logo from "/logo.svg"
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Unable to sign in."
      );
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_50%_0%,#1e293b,transparent_40%)] bg-slate-950 p-4">
      <section className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 p-7 shadow-2xl shadow-black/40 sm:p-9">
        <div className="mb-6 grid h-12 w-12 place-items-center rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-950">
          <img src="/logo.svg" alt="logo"/>
        </div>

        <p className="text-[10px] font-bold tracking-[0.18em] text-slate-600">
          CENTRAL CAMPUS OF TECHNOLOGY
        </p>

        <h1 className="mt-2 text-2xl font-bold text-white">
          Complaint Admin
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Manage campus complaints, assignments and resolution workflow.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <label className="block text-xs font-semibold text-slate-400">
            Email
            <input
              className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-700 focus:border-indigo-500"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@example.com"
              required
            />
          </label>

          <label className="block text-xs font-semibold text-slate-400">
            Password
            <input
              className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-700 focus:border-indigo-500"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              required
            />
          </label>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs text-red-300">
              {error}
            </div>
          )}

          <button
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <LoaderCircle size={17} className="animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <p className="mt-5 text-center text-[10px] text-slate-700">
          Authentication uses the backend JWT login endpoint.
        </p>
      </section>
    </main>
  );
}
