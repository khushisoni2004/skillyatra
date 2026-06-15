import { useEffect, useMemo, useState } from "react";
import api from "../lib/api";

function StatCard({ label, value, sub, tone = "indigo" }) {
  const tones = {
    indigo: "from-indigo-600 to-violet-600",
    emerald: "from-emerald-500 to-teal-600",
    amber: "from-amber-500 to-orange-600",
    rose: "from-rose-500 to-pink-600",
    slate: "from-slate-700 to-slate-900"
  };

  return (
    <div className="rounded-[26px] bg-white p-5 shadow-lg shadow-indigo-50 ring-1 ring-indigo-100">
      <div className={`mb-4 h-2 w-16 rounded-full bg-gradient-to-r ${tones[tone]}`} />
      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <h3 className="mt-2 text-3xl font-black text-slate-900">{value}</h3>
      {sub && <p className="mt-1 text-sm font-semibold text-slate-500">{sub}</p>}
    </div>
  );
}

function ActivityBadge({ status }) {
  const s = String(status || "").toLowerCase();

  const style =
    s.includes("complete") || s.includes("done") || s.includes("submitted") || s.includes("passed")
      ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
      : s.includes("progress") || s.includes("started")
        ? "bg-amber-50 text-amber-700 ring-amber-100"
        : "bg-slate-50 text-slate-600 ring-slate-200";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${style}`}>
      {status || "saved"}
    </span>
  );
}

function formatTime(value) {
  if (!value) return "Just now";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return "Recently";
  }
}

export default function Progress() {
  const [summary, setSummary] = useState({});
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadProgress() {
    try {
      setError("");

      const [summaryRes, listRes] = await Promise.all([
        api.get("/progress/summary"),
        api.get("/progress")
      ]);

      setSummary(summaryRes.data || {});
      setItems(Array.isArray(listRes.data) ? listRes.data : []);
    } catch (err) {
      setError("Progress data not loaded. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProgress();

    const timer = setInterval(loadProgress, 5000);
    return () => clearInterval(timer);
  }, []);

  const sectionCounts = useMemo(() => {
    const counts = {};

    for (const item of items) {
      const key = item.section || item.itemType || "General";
      counts[key] = (counts[key] || 0) + 1;
    }

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [items]);

  const readiness = Number(summary.readiness || 0);

  return (
    <main className="practiceMcqThemePage min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-white p-6">
      <div className="practiceMcqShell mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-[34px] bg-gradient-to-r from-indigo-700 via-violet-700 to-slate-950 p-8 text-white shadow-xl shadow-indigo-200">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-indigo-200">
                Progress
              </p>
              <h1 className="mt-3 text-4xl font-black tracking-tight">
                Placement Progress Dashboard
              </h1>
              <p className="mt-3 max-w-3xl text-sm font-semibold text-indigo-100">
                Live progress from Today Plan, DSA Tracker, Practice MCQs, Resume Coach and Interview Coach.
              </p>
            </div>

            <div className="rounded-[28px] bg-white/10 p-5 ring-1 ring-white/20 backdrop-blur">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-100">
                Readiness
              </p>
              <h2 className="mt-2 text-5xl font-black">{readiness}%</h2>
              <div className="mt-4 h-3 w-56 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-white"
                  style={{ width: `${Math.min(100, readiness)}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-700 ring-1 ring-rose-100">
            {error}
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-4">
          <StatCard label="Total Activities" value={summary.totalActivities || 0} sub="All saved actions" tone="indigo" />
          <StatCard label="Completed" value={summary.completedTasks || 0} sub="Done/submitted tasks" tone="emerald" />
          <StatCard label="DSA Submitted" value={summary.submittedDsa || 0} sub="Tracked DSA work" tone="amber" />
          <StatCard label="MCQ Accuracy" value={`${summary.practiceAccuracy || 0}%`} sub={`${summary.practiceAttempted || 0} attempts`} tone="rose" />
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="practiceMcqSet rounded-[30px] bg-white p-6 shadow-lg shadow-indigo-50 ring-1 ring-indigo-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900">Section Progress</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Real count based on saved activity.
                </p>
              </div>

              <button
                onClick={loadProgress}
                className="rounded-2xl bg-slate-900 px-4 py-2 text-xs font-black text-white hover:bg-slate-800"
              >
                Refresh
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {sectionCounts.length === 0 && (
                <div className="rounded-2xl bg-slate-50 p-5 text-sm font-bold text-slate-500 ring-1 ring-slate-200">
                  No progress recorded yet. Complete real actions in DSA, MCQs, Resume Coach or Interview Coach.
                </div>
              )}

              {sectionCounts.map(([section, count]) => {
                const width = Math.min(100, (count / Math.max(items.length, 1)) * 100);

                return (
                  <div key={section}>
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-black text-slate-700">{section}</p>
                      <p className="text-sm font-black text-indigo-700">{count}</p>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-indigo-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-600"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[30px] bg-white p-6 shadow-lg shadow-indigo-50 ring-1 ring-indigo-100">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-900">Recent Activity</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Auto-refreshes every 5 seconds.
                </p>
              </div>

              {loading && (
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700 ring-1 ring-indigo-100">
                  Loading...
                </span>
              )}
            </div>

            <div className="mt-5 max-h-[520px] space-y-3 overflow-auto pr-1">
              {items.length === 0 && !loading && (
                <div className="rounded-2xl bg-slate-50 p-6 text-center ring-1 ring-slate-200">
                  <h3 className="text-lg font-black text-slate-900">No live activity yet</h3>
                  <p className="mt-2 text-sm font-semibold text-slate-500">
                    Start Today Plan, DSA Tracker, Practice MCQs, Resume Coach or Interview Coach to generate real progress.
                  </p>
                </div>
              )}

              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">
                        {item.section || item.itemType || "Activity"}
                      </p>
                      <h3 className="mt-1 text-base font-black text-slate-900">
                        {item.topic || "General Activity"}
                      </h3>
                    </div>

                    <ActivityBadge status={item.status} />
                  </div>

                  <div className="mt-3 grid gap-3 text-sm font-semibold text-slate-600 sm:grid-cols-3">
                    <p>Type: {item.itemType || "Activity"}</p>
                    <p>Score: {item.score || 0}</p>
                    <p>{formatTime(item.createdAt)}</p>
                  </div>

                  {(item.company || item.role || item.difficulty) && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.company && (
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-200">
                          {item.company}
                        </span>
                      )}

                      {item.role && (
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-200">
                          {item.role}
                        </span>
                      )}

                      {item.difficulty && (
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-200">
                          {item.difficulty}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
