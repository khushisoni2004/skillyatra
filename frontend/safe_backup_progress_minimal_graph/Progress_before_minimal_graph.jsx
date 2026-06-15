import { useEffect, useMemo, useState } from "react";
import api from "../lib/api";

function StatCard({ label, value, sub, tone = "sky" }) {
  const tones = {
    sky: "from-sky-500 to-cyan-500",
    emerald: "from-emerald-400 to-teal-500",
    amber: "from-amber-400 to-orange-500",
    rose: "from-rose-400 to-pink-500",
    slate: "from-slate-700 to-slate-900"
  };

  return (
    <div className="rounded-[28px] bg-white p-5 shadow-lg shadow-sky-50 ring-1 ring-sky-100">
      <div className={`mb-4 h-2 w-16 rounded-full bg-gradient-to-r ${tones[tone]}`} />
      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{label}</p>
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
        : "bg-sky-50 text-sky-700 ring-sky-100";

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

function isSameDay(dateValue, target = new Date()) {
  if (!dateValue) return false;

  const d = new Date(dateValue);

  return (
    d.getFullYear() === target.getFullYear() &&
    d.getMonth() === target.getMonth() &&
    d.getDate() === target.getDate()
  );
}

function isWithinDays(dateValue, days) {
  if (!dateValue) return false;

  const d = new Date(dateValue);
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  return diff >= 0 && diff <= days * 24 * 60 * 60 * 1000;
}

function getScoreAverage(list) {
  const scores = list
    .map((item) => Number(item.score || 0))
    .filter((score) => Number.isFinite(score) && score > 0);

  if (!scores.length) return 0;

  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
}

function isCompleted(item) {
  const status = String(item.status || "").toLowerCase();

  return (
    status.includes("complete") ||
    status.includes("done") ||
    status.includes("submitted") ||
    status.includes("passed")
  );
}

function getDayLabel(offset) {
  const d = new Date();
  d.setDate(d.getDate() - offset);

  return {
    day: d.toLocaleDateString(undefined, { weekday: "short" }),
    date: d.toLocaleDateString(undefined, { day: "2-digit", month: "short" })
  };
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
    } catch {
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

  const todayItems = useMemo(() => {
    return items.filter((item) => isSameDay(item.createdAt));
  }, [items]);

  const weekItems = useMemo(() => {
    return items.filter((item) => isWithinDays(item.createdAt, 7));
  }, [items]);

  const todayCompleted = useMemo(() => {
    return todayItems.filter(isCompleted);
  }, [todayItems]);

  const todayScoreAverage = useMemo(() => {
    return getScoreAverage(todayItems);
  }, [todayItems]);

  const completionRate = useMemo(() => {
    if (!todayItems.length) return 0;
    return Math.round((todayCompleted.length / todayItems.length) * 100);
  }, [todayItems, todayCompleted]);

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

  const todaySectionCounts = useMemo(() => {
    const counts = {};

    for (const item of todayItems) {
      const key = item.section || item.itemType || "General";
      counts[key] = (counts[key] || 0) + 1;
    }

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [todayItems]);

  const dailyGraphBars = useMemo(() => {
    return Array.from({ length: 14 }, (_, index) => {
      const offset = 13 - index;
      const target = new Date();
      target.setDate(target.getDate() - offset);

      const dayItems = items.filter((item) => isSameDay(item.createdAt, target));
      const completedItems = dayItems.filter(isCompleted);
      const label = getDayLabel(offset);

      return {
        ...label,
        count: dayItems.length,
        completed: completedItems.length,
        averageScore: getScoreAverage(dayItems)
      };
    });
  }, [items]);

  const bestSection = todaySectionCounts[0]?.[0] || "No activity yet";
  const maxDailyGraph = Math.max(...dailyGraphBars.map((d) => d.count), 1);

  return (
    <main className="progressThemePage min-h-screen bg-gradient-to-br from-sky-50 via-white to-cyan-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="progressHero overflow-hidden rounded-[34px] bg-gradient-to-r from-sky-600 via-cyan-500 to-sky-400 p-8 text-white shadow-xl shadow-sky-200">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <h1 className="mt-3 text-4xl font-black tracking-tight">
                Progress Dashboard
              </h1>
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-700 ring-1 ring-rose-100">
            {error}
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-4">
          <StatCard label="Today Activities" value={todayItems.length} sub="Real actions today" tone="sky" />
          <StatCard label="Today Completed" value={todayCompleted.length} sub={`${completionRate}% completion rate`} tone="emerald" />
          <StatCard label="Today Avg Score" value={`${todayScoreAverage}%`} sub="Based on saved scores" tone="amber" />
          <StatCard label="This Week" value={weekItems.length} sub="Last 7 days actions" tone="rose" />
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[30px] bg-white p-6 shadow-lg shadow-sky-50 ring-1 ring-sky-100">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">Daily Progress</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Live count based on today’s saved activity.
                </p>
              </div>

              <button
                onClick={loadProgress}
                className="progressActionBtn rounded-2xl px-4 py-2 text-xs font-black text-white"
              >
                Refresh Live
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-sky-50 p-4 ring-1 ring-sky-100">
                <p className="text-xs font-black text-sky-700">Best Section Today</p>
                <h3 className="mt-2 text-lg font-black text-slate-900">{bestSection}</h3>
              </div>

              <div className="rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
                <p className="text-xs font-black text-emerald-700">Completed Today</p>
                <h3 className="mt-2 text-2xl font-black text-emerald-700">{todayCompleted.length}</h3>
              </div>

              <div className="rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-100">
                <p className="text-xs font-black text-amber-700">Pending / Saved</p>
                <h3 className="mt-2 text-2xl font-black text-amber-700">
                  {Math.max(0, todayItems.length - todayCompleted.length)}
                </h3>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {todaySectionCounts.length === 0 && (
                <div className="rounded-2xl bg-slate-50 p-5 text-sm font-bold text-slate-500 ring-1 ring-slate-200">
                  No activity saved today. Start DSA, MCQs, Resume Coach or Interview Coach.
                </div>
              )}

              {todaySectionCounts.map(([section, count]) => {
                const width = Math.min(100, (count / Math.max(todayItems.length, 1)) * 100);

                return (
                  <div key={section}>
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-black text-slate-700">{section}</p>
                      <p className="text-sm font-black text-sky-700">{count}</p>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-sky-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-400"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[30px] bg-white p-6 shadow-lg shadow-sky-50 ring-1 ring-sky-100">
            <div>
              <h2 className="text-xl font-black text-slate-900">Date & Day Wise Progress</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                Last 14 days real activity graph from backend progress data.
              </p>
            </div>

            <div className="mt-6 overflow-x-auto pb-2">
              <div className="min-w-[860px]">
                <div className="grid grid-cols-14 gap-3">
                  {dailyGraphBars.map((day, index) => {
                    const height = Math.max(14, Math.round((day.count / maxDailyGraph) * 150));
                    const completedHeight = Math.max(0, Math.round((day.completed / maxDailyGraph) * 150));

                    return (
                      <div key={`${day.day}-${day.date}-${index}`} className="flex flex-col items-center justify-end gap-2">
                        <div className="flex h-44 items-end gap-1">
                          <div
                            className="w-7 rounded-t-2xl bg-gradient-to-t from-sky-500 to-cyan-300 shadow-md shadow-sky-100"
                            style={{ height }}
                            title={`${day.count} total activities`}
                          />
                          <div
                            className="w-3 rounded-t-2xl bg-gradient-to-t from-emerald-500 to-emerald-300 shadow-md shadow-emerald-100"
                            style={{ height: completedHeight }}
                            title={`${day.completed} completed`}
                          />
                        </div>

                        <p className="text-xs font-black text-slate-700">{day.day}</p>
                        <p className="text-[11px] font-black text-slate-400">{day.date}</p>
                        <p className="text-xs font-black text-sky-700">{day.count}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-4 rounded-2xl bg-sky-50 p-4 ring-1 ring-sky-100">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-7 rounded-full bg-sky-500" />
                    <p className="text-xs font-black text-slate-600">Total Activities</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="h-3 w-7 rounded-full bg-emerald-500" />
                    <p className="text-xs font-black text-slate-600">Completed</p>
                  </div>

                  <p className="text-xs font-bold text-slate-500">
                    Auto-refresh every 5 seconds. New saved activity appears automatically.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-[30px] bg-white p-6 shadow-lg shadow-sky-50 ring-1 ring-sky-100">
            <div>
              <h2 className="text-xl font-black text-slate-900">Overall Section Progress</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                All-time real count based on saved activity.
              </p>
            </div>

            <div className="mt-6 space-y-4">
              {sectionCounts.length === 0 && (
                <div className="rounded-2xl bg-slate-50 p-5 text-sm font-bold text-slate-500 ring-1 ring-slate-200">
                  No progress recorded yet.
                </div>
              )}

              {sectionCounts.map(([section, count]) => {
                const width = Math.min(100, (count / Math.max(items.length, 1)) * 100);

                return (
                  <div key={section}>
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-black text-slate-700">{section}</p>
                      <p className="text-sm font-black text-sky-700">{count}</p>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-sky-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[30px] bg-white p-6 shadow-lg shadow-sky-50 ring-1 ring-sky-100">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-900">Recent Activity</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Latest real actions from your backend progress collection.
                </p>
              </div>

              {loading && (
                <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-black text-sky-700 ring-1 ring-sky-100">
                  Loading...
                </span>
              )}
            </div>

            <div className="mt-5 max-h-[520px] space-y-3 overflow-auto pr-1">
              {items.length === 0 && !loading && (
                <div className="rounded-2xl bg-slate-50 p-6 text-center ring-1 ring-slate-200">
                  <h3 className="text-lg font-black text-slate-900">No live activity yet</h3>
                  <p className="mt-2 text-sm font-semibold text-slate-500">
                    Start Today Plan, DSA Tracker, Practice MCQs, Resume Coach or Interview Coach.
                  </p>
                </div>
              )}

              {items.map((item) => (
                <div
                  key={item.id || item._id || `${item.topic}-${item.createdAt}`}
                  className="rounded-[22px] border border-sky-100 bg-sky-50/45 p-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-sky-700">
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
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 ring-1 ring-sky-100">
                          {item.company}
                        </span>
                      )}

                      {item.role && (
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 ring-1 ring-sky-100">
                          {item.role}
                        </span>
                      )}

                      {item.difficulty && (
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 ring-1 ring-sky-100">
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
