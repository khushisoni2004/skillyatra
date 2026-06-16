import { useEffect, useMemo, useRef, useState } from "react";
import api from "../lib/api";

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

function isCompleted(item) {
  const status = String(item.status || "").toLowerCase();

  return (
    status.includes("complete") ||
    status.includes("done") ||
    status.includes("submitted") ||
    status.includes("passed")
  );
}

function getDayInfo(offset) {
  const d = new Date();
  d.setDate(d.getDate() - offset);

  return {
    dateObject: d,
    day: d.toLocaleDateString(undefined, { weekday: "short" }),
    date: d.toLocaleDateString(undefined, { day: "2-digit", month: "short" })
  };
}


const PROGRESS_CACHE_KEY = "skillyatra_progress_realtime_cache_v1";

function readProgressCache() {
  try {
    const raw = localStorage.getItem(PROGRESS_CACHE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.items) ? parsed.items : [];
  } catch {
    return [];
  }
}

function writeProgressCache(items) {
  try {
    localStorage.setItem(
      PROGRESS_CACHE_KEY,
      JSON.stringify({
        updatedAt: Date.now(),
        items: Array.isArray(items) ? items : []
      })
    );
  } catch {}
}

export default function Progress() {
  const [items, setItems] = useState(readProgressCache);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const requestRunningRef = useRef(false);

  async function loadProgress({ showError = false } = {}) {
    if (requestRunningRef.current) return;

    requestRunningRef.current = true;

    try {
      const { data } = await api.get("/progress", {
        params: {
          _t: Date.now()
        },
        headers: {
          "Cache-Control": "no-cache"
        }
      });

      const freshItems = Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.progress)
            ? data.progress
            : [];

      setItems(freshItems);
      writeProgressCache(freshItems);
      setError("");
    } catch {
      if (showError && items.length === 0) {
        setError("Progress data not loaded. Make sure backend is running.");
      }
    } finally {
      requestRunningRef.current = false;
      setLoading(false);
    }
  }

  useEffect(() => {
    // Cached real progress appears instantly.
    // Latest backend data replaces it silently in background.
    loadProgress({ showError: items.length === 0 });

    const timer = setInterval(() => {
      loadProgress({ showError: false });
    }, 2000);

    const syncNow = () => {
      loadProgress({ showError: false });
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        syncNow();
      }
    };

    const handleStorage = (event) => {
      if (event.key === PROGRESS_CACHE_KEY) {
        setItems(readProgressCache());
      }

      // Any SkillYatra progress activity in another tab triggers refresh.
      if (
        event.key &&
        (
          event.key.includes("progress") ||
          event.key.includes("dsa") ||
          event.key.includes("practice") ||
          event.key.includes("roadmap")
        )
      ) {
        syncNow();
      }
    };

    window.addEventListener("focus", syncNow);
    window.addEventListener("storage", handleStorage);
    window.addEventListener("skillyatra-progress-updated", syncNow);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", syncNow);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("skillyatra-progress-updated", syncNow);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const last14DaysItems = useMemo(() => {
    return items.filter((item) => isWithinDays(item.createdAt, 14));
  }, [items]);

  const sectionPercentages = useMemo(() => {
    const counts = {};

    for (const item of last14DaysItems) {
      const key = item.section || item.itemType || "General";
      counts[key] = (counts[key] || 0) + 1;
    }

    const total = last14DaysItems.length || 1;

    return Object.entries(counts)
      .map(([section, count]) => ({
        section,
        count,
        percentage: Math.round((count / total) * 100)
      }))
      .sort((a, b) => b.percentage - a.percentage);
  }, [last14DaysItems]);

  const dailyGraph = useMemo(() => {
    return Array.from({ length: 14 }, (_, index) => {
      const offset = 13 - index;
      const info = getDayInfo(offset);

      const dayItems = items.filter((item) => isSameDay(item.createdAt, info.dateObject));
      const completed = dayItems.filter(isCompleted).length;

      return {
        ...info,
        total: dayItems.length,
        completed
      };
    });
  }, [items]);

  const maxDayCount = Math.max(...dailyGraph.map((day) => day.total), 1);

  return (
    <main className="progressThemePage min-h-screen bg-gradient-to-br from-sky-50 via-white to-cyan-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="progressHero overflow-hidden rounded-[34px] bg-gradient-to-r from-sky-600 via-cyan-500 to-sky-400 p-8 text-white shadow-xl shadow-sky-200">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white">
              Progress Dashboard
            </h1>
          </div>
        </section>

        {error && (
          <div className="rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-700 ring-1 ring-rose-100">
            {error}
          </div>
        )}

        <section className="rounded-[30px] bg-white p-6 shadow-lg shadow-sky-50 ring-1 ring-sky-100">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Section-wise Progress Percentage
              </h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                Based on your real saved activity from the last 14 days.
              </p>
            </div>

            {false && loading && (
              <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-black text-sky-700 ring-1 ring-sky-100">
                Loading...
              </span>
            )}
          </div>

          <div className="mt-6 space-y-4">
            {sectionPercentages.length === 0 && !loading && (
              <div className="rounded-2xl bg-slate-50 p-5 text-sm font-bold text-slate-500 ring-1 ring-slate-200">
                No progress data found yet.
              </div>
            )}

            {sectionPercentages.map((item) => (
              <div key={item.section} className="rounded-2xl bg-sky-50/50 p-4 ring-1 ring-sky-100">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-slate-800">{item.section}</p>
                    <p className="text-xs font-bold text-slate-500">{item.count} activities</p>
                  </div>

                  <p className="text-2xl font-black text-sky-700">{item.percentage}%</p>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-white ring-1 ring-sky-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[30px] bg-white p-6 shadow-lg shadow-sky-50 ring-1 ring-sky-100">
          <div>
            <h2 className="text-xl font-black text-slate-900">
              Date & Day Wise Progress Graph
            </h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Last 14 days graphical progress from real backend data.
            </p>
          </div>

          <div className="mt-7 overflow-x-auto pb-2">
            <div className="min-w-[900px]">
              <div
                className="grid gap-4"
                style={{ gridTemplateColumns: "repeat(14, minmax(48px, 1fr))" }}
              >
                {dailyGraph.map((day, index) => {
                  const totalHeight = Math.max(10, Math.round((day.total / maxDayCount) * 170));
                  const completedHeight = Math.max(0, Math.round((day.completed / maxDayCount) * 170));

                  return (
                    <div key={`${day.day}-${day.date}-${index}`} className="flex flex-col items-center gap-2">
                      <div className="flex h-48 items-end gap-1">
                        <div
                          className="w-8 rounded-t-2xl bg-gradient-to-t from-sky-500 to-cyan-300 shadow-md shadow-sky-100"
                          style={{ height: totalHeight }}
                          title={`${day.total} total activities`}
                        />
                        <div
                          className="w-3 rounded-t-2xl bg-gradient-to-t from-emerald-500 to-emerald-300 shadow-md shadow-emerald-100"
                          style={{ height: completedHeight }}
                          title={`${day.completed} completed`}
                        />
                      </div>

                      <p className="text-xs font-black text-slate-700">{day.day}</p>
                      <p className="text-[11px] font-black text-slate-400">{day.date}</p>
                      <p className="text-xs font-black text-sky-700">{day.total}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-4 rounded-2xl bg-sky-50 p-4 ring-1 ring-sky-100">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-7 rounded-full bg-sky-500" />
                  <p className="text-xs font-black text-slate-600">Total activities</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-3 w-7 rounded-full bg-emerald-500" />
                  <p className="text-xs font-black text-slate-600">Completed</p>
                </div>

                <p className="text-xs font-bold text-slate-500">
                  Updates automatically from real progress data.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
