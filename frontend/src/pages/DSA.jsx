import { useEffect, useMemo, useState } from "react";
import { API_BASE } from "../lib/config";

const STORAGE_KEY = "skillyatra_real_dsa_done_v1";

function readDone() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveDone(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data || {}));
  } catch {}
}

export default function DSA() {
  const [done, setDone] = useState(readDone);
  const [questions, setQuestions] = useState([]);
  const [topics, setTopics] = useState(["All"]);
  const [platforms, setPlatforms] = useState(["All"]);
  const [difficulties, setDifficulties] = useState(["All", "Easy", "Medium", "Hard"]);
  const [topicCounts, setTopicCounts] = useState({});
  const [topic, setTopic] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [platform, setPlatform] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalAll, setTotalAll] = useState(0);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pageSize = 20;

  async function loadQuestions(nextPage = 1) {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: String(nextPage),
        limit: String(pageSize),
        topic,
        platform,
        difficulty,
        search,
      });

      let data = null;
      let lastError = null;

      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const res = await fetch(`${API_BASE}/dsa/questions?${params.toString()}`, {
            method: "GET",
            headers: { Accept: "application/json" },
            cache: "no-store",
          });

          data = await res.json();

          if (!res.ok || !data.ok) {
            throw new Error(data.message || "DSA backend route failed");
          }

          break;
        } catch (err) {
          lastError = err;
          await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
        }
      }

      if (!data || !data.ok) {
        throw lastError || new Error("DSA backend route failed");
      }

      setQuestions(Array.isArray(data.questions) ? data.questions : []);
      setTopics(Array.isArray(data.topics) ? data.topics : ["All"]);
      setPlatforms(Array.isArray(data.platforms) ? data.platforms : ["All"]);
      setDifficulties(Array.isArray(data.difficulties) ? data.difficulties : ["All", "Easy", "Medium", "Hard"]);
      setTopicCounts(data.topicCounts || {});
      setTotalAll(Number(data.totalAll || 0));
      setTotal(Number(data.total || 0));
      setTotalPages(Number(data.totalPages || 1));
      setPage(Number(data.page || nextPage));
    } catch (err) {
      console.error("DSA load failed:", err);
      setQuestions([]);
      setTotal(0);
      setError("Backend data route not loading in frontend. Check deployed API URL.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQuestions(1);
  }, [topic, platform, difficulty]);

  function searchNow() {
    loadQuestions(1);
  }

  function refreshAll() {
    setTopic("All");
    setPlatform("All");
    setDifficulty("All");
    setSearch("");
    setTimeout(() => loadQuestions(1), 0);
  }

  function toggleDone(id) {
    const next = { ...done, [id]: !done[id] };
    if (!next[id]) delete next[id];
    setDone(next);
    saveDone(next);
  }

  const completed = useMemo(() => Object.values(done).filter(Boolean).length, [done]);
  const progress = totalAll ? Math.round((completed / totalAll) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-6 text-slate-900">
      <div className="mx-auto max-w-7xl">
        <section className="relative overflow-hidden rounded-[34px] bg-gradient-to-r from-slate-950 via-indigo-950 to-emerald-900 p-8 text-white shadow-2xl">
          <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="relative z-10">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-emerald-300">
              DSA Tracker
            </p>
            <h1 className="mt-3 text-4xl font-black md:text-5xl">
              Topic-Wise DSA Practice
            </h1>
            <p className="mt-3 max-w-3xl text-sm font-semibold text-slate-200">
              Real dataset loaded from backend. Practice coding questions by topic, platform, and difficulty.
            </p>
          </div>
        </section>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <StatCard label="Total Questions" value={loading && !totalAll ? "..." : totalAll} />
          <StatCard label="Completed" value={completed} />
          <StatCard label="Pending" value={Math.max(0, totalAll - completed)} />
          <StatCard label="Progress" value={`${progress}%`} />
        </div>

        <section className="mt-6 rounded-[30px] border border-white/70 bg-white/90 p-5 shadow-xl backdrop-blur">
          <div className="grid gap-3 lg:grid-cols-5">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchNow()}
              placeholder="Search question..."
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 lg:col-span-2"
            />

            <select value={topic} onChange={(e) => setTopic(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none">
              {topics.map((t) => <option key={t} value={t}>{t === "All" ? "All Topics" : t}</option>)}
            </select>

            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none">
              {difficulties.map((d) => <option key={d} value={d}>{d === "All" ? "All Difficulty" : d}</option>)}
            </select>

            <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none">
              {platforms.map((p) => <option key={p} value={p}>{p === "All" ? "All Platforms" : p}</option>)}
            </select>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={searchNow} className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-7 py-3 text-sm font-black text-white shadow-lg shadow-blue-500/25 transition hover:-translate-y-0.5 hover:shadow-xl">
              Search
            </button>

            <button onClick={refreshAll} className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-7 py-3 text-sm font-black text-white shadow-lg shadow-emerald-500/25 transition hover:-translate-y-0.5 hover:shadow-xl">
              Refresh
            </button>
          </div>
        </section>

        <div className="mt-5 flex flex-wrap gap-2">
          {topics.filter((t) => t !== "All").map((t) => (
            <button
              key={t}
              onClick={() => setTopic(t)}
              className={`rounded-full px-4 py-2 text-xs font-black transition hover:-translate-y-0.5 ${
                topic === t
                  ? "bg-gradient-to-r from-blue-600 to-emerald-500 text-white shadow-lg"
                  : "bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {t} <span className="opacity-75">{topicCounts[t] || 0}</span>
            </button>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="font-black text-slate-700">
            {loading ? "Loading coding questions..." : `Showing ${questions.length} of ${total} questions`}
          </p>

          {totalPages > 1 && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => loadQuestions(Math.max(1, page - 1))}
                disabled={page === 1 || loading}
                className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-700 shadow ring-1 ring-slate-200 transition hover:-translate-y-0.5 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white">
                Page {page} / {totalPages}
              </span>
              <button
                onClick={() => loadQuestions(Math.min(totalPages, page + 1))}
                disabled={page === totalPages || loading}
                className="rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 px-5 py-3 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 font-bold text-red-700">
            {error}
          </div>
        )}

        {!loading && questions.length === 0 && !error && (
          <div className="mt-8 rounded-[28px] bg-white p-8 text-center font-black text-slate-500 shadow">
            No coding questions found. Check backend dataset route.
          </div>
        )}

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {questions.map((q, index) => (
            <article
              key={q.id || index}
              className="group rounded-[30px] border border-white/80 bg-white p-6 shadow-xl transition hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-wide">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">{q.topic}</span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">Question {(page - 1) * pageSize + index + 1}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{q.platform}</span>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">{q.difficulty}</span>
              </div>

              <h3 className="mt-4 text-xl font-black leading-snug text-slate-950">
                {q.title}
              </h3>

              <p className="mt-3 text-sm font-bold text-slate-500">
                Status: {done[q.id] ? "Completed" : "Not Attempted"}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                {q.url && (
                  <a
                    href={q.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-500/25 transition hover:-translate-y-0.5"
                  >
                    Open Question ↗
                  </a>
                )}

                <button
                  onClick={() => toggleDone(q.id)}
                  className={`rounded-2xl px-5 py-3 text-sm font-black shadow-lg transition hover:-translate-y-0.5 ${
                    done[q.id]
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-500/25"
                      : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-emerald-50"
                  }`}
                >
                  {done[q.id] ? "Done" : "Mark Done"}
                </button>
              </div>
            </article>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-3 pb-8">
            <button
              onClick={() => loadQuestions(Math.max(1, page - 1))}
              disabled={page === 1 || loading}
              className="rounded-2xl bg-white px-6 py-3 text-sm font-black text-slate-700 shadow ring-1 ring-slate-200 transition hover:-translate-y-0.5 disabled:opacity-40"
            >
              Previous Page
            </button>
            <span className="rounded-2xl bg-slate-950 px-6 py-3 text-sm font-black text-white">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => loadQuestions(Math.min(totalPages, page + 1))}
              disabled={page === totalPages || loading}
              className="rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 px-6 py-3 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 disabled:opacity-40"
            >
              Next Page
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-[28px] border border-white/80 bg-white p-6 shadow-xl transition hover:-translate-y-1 hover:shadow-2xl">
      <p className="text-sm font-black text-slate-500">{label}</p>
      <h2 className="mt-3 text-4xl font-black text-slate-950">{value}</h2>
    </div>
  );
}
