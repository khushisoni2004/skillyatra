import { useEffect, useMemo, useState } from "react";
import api from "../lib/api";

const STORAGE_KEY = "skillyatra_dsa_dataset_done_v1";

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

function cleanTopic(q) {
  const subject = q.subject || "Practice";
  const topic = q.topic || subject;
  if (topic === "Placement / NQT") return subject;
  return topic;
}

function cleanPlatform(q) {
  const src = String(q.sourceDataset || "Dataset");
  if (src.toLowerCase().includes("manual")) return "Manual";
  if (src.toLowerCase().includes("leetcode")) return "LeetCode";
  if (src.toLowerCase().includes("geeksforgeeks") || src.toLowerCase().includes("gfg")) return "GeeksforGeeks";
  if (src.toLowerCase().includes("hackerrank")) return "HackerRank";
  if (src.toLowerCase().includes("interview")) return "Interview";
  return "Dataset";
}

function cleanDifficulty(q) {
  const text = `${q.question || ""} ${q.topic || ""}`.toLowerCase();

  if (
    text.includes("hard") ||
    text.includes("design") ||
    text.includes("optimize") ||
    text.includes("advanced") ||
    text.includes("scalable")
  ) {
    return "Hard";
  }

  if (
    text.includes("medium") ||
    text.includes("tree") ||
    text.includes("graph") ||
    text.includes("dynamic") ||
    text.includes("algorithm") ||
    text.includes("complexity")
  ) {
    return "Medium";
  }

  return "Easy";
}

function normalizeRows(raw = []) {
  return raw.map((q, index) => ({
    id: q.id || `dataset-${index + 1}`,
    title: q.question || "Untitled Question",
    topic: cleanTopic(q),
    subject: q.subject || "Practice",
    platform: cleanPlatform(q),
    difficulty: cleanDifficulty(q),
    sourceDataset: q.sourceDataset || "Dataset",
    url: `https://www.google.com/search?q=${encodeURIComponent((q.question || "DSA question") + " solution")}`
  }));
}

export default function DSA() {
  const [done, setDone] = useState(readDone);
  const [questions, setQuestions] = useState([]);
  const [topic, setTopic] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [platform, setPlatform] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const pageSize = 25;

  async function loadDatasetQuestions() {
    try {
      setLoading(true);

      const res = await api.get("/practice/questions?group=All");

      const rows = normalizeRows(res.data?.questions || []);
      setQuestions(rows);
    } catch {
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDatasetQuestions();
  }, []);

  const topics = useMemo(() => {
    return ["All", ...Array.from(new Set(questions.map((q) => q.topic))).filter(Boolean).sort()];
  }, [questions]);

  const platforms = useMemo(() => {
    return ["All", ...Array.from(new Set(questions.map((q) => q.platform))).filter(Boolean).sort()];
  }, [questions]);

  const filtered = useMemo(() => {
    let rows = questions;

    if (topic !== "All") rows = rows.filter((q) => q.topic === topic);
    if (difficulty !== "All") rows = rows.filter((q) => q.difficulty === difficulty);
    if (platform !== "All") rows = rows.filter((q) => q.platform === platform);

    const s = search.trim().toLowerCase();
    if (s) {
      rows = rows.filter(
        (q) =>
          q.title.toLowerCase().includes(s) ||
          q.topic.toLowerCase().includes(s) ||
          q.subject.toLowerCase().includes(s) ||
          q.platform.toLowerCase().includes(s) ||
          q.difficulty.toLowerCase().includes(s)
      );
    }

    return rows;
  }, [questions, topic, difficulty, platform, search]);

  const total = questions.length;
  const completed = questions.filter((q) => done[q.id]).length;
  const progress = total ? Math.round((completed / total) * 100) : 0;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const currentRows = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage]);

  function toggleDone(id) {
    const next = { ...done, [id]: !done[id] };
    if (!next[id]) delete next[id];
    setDone(next);
    saveDone(next);
  }

  function resetFilters() {
    setTopic("All");
    setDifficulty("All");
    setPlatform("All");
    setSearch("");
    setPage(1);
    loadDatasetQuestions();
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-white p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[34px] bg-gradient-to-r from-indigo-700 via-violet-700 to-slate-950 p-8 text-white shadow-xl shadow-indigo-200">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-indigo-200">
            DSA Tracker
          </p>
          <h1 className="mt-3 text-4xl font-black">Topic-Wise DSA Practice</h1>
          <p className="mt-3 text-sm font-semibold text-indigo-100">
            Practice dataset questions topic-wise, filter by platform, difficulty, and track your completed problems.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-[26px] bg-white p-5 shadow-lg shadow-indigo-50 ring-1 ring-indigo-100">
            <p className="text-sm font-black text-slate-500">Total Questions</p>
            <h2 className="mt-2 text-3xl font-black text-slate-900">
              {loading ? "..." : total}
            </h2>
          </div>

          <div className="rounded-[26px] bg-white p-5 shadow-lg shadow-indigo-50 ring-1 ring-indigo-100">
            <p className="text-sm font-black text-slate-500">Completed</p>
            <h2 className="mt-2 text-3xl font-black text-emerald-600">{completed}</h2>
          </div>

          <div className="rounded-[26px] bg-white p-5 shadow-lg shadow-indigo-50 ring-1 ring-indigo-100">
            <p className="text-sm font-black text-slate-500">Pending</p>
            <h2 className="mt-2 text-3xl font-black text-rose-600">
              {Math.max(0, total - completed)}
            </h2>
          </div>

          <div className="rounded-[26px] bg-white p-5 shadow-lg shadow-indigo-50 ring-1 ring-indigo-100">
            <p className="text-sm font-black text-slate-500">Progress</p>
            <h2 className="mt-2 text-3xl font-black text-indigo-600">{progress}%</h2>
          </div>
        </section>

        <section className="rounded-[30px] bg-white p-5 shadow-lg shadow-indigo-50 ring-1 ring-indigo-100">
          <div className="grid gap-3 md:grid-cols-[1fr_200px_200px_180px_auto]">
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search DSA question..."
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-800 shadow-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />

            <select
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                setPage(1);
              }}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-800 shadow-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            >
              {topics.map((t) => (
                <option key={t} value={t}>
                  {t === "All" ? "All Topics" : t}
                </option>
              ))}
            </select>

            <select
              value={platform}
              onChange={(e) => {
                setPlatform(e.target.value);
                setPage(1);
              }}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-800 shadow-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            >
              {platforms.map((p) => (
                <option key={p} value={p}>
                  {p === "All" ? "All Platforms" : p}
                </option>
              ))}
            </select>

            <select
              value={difficulty}
              onChange={(e) => {
                setDifficulty(e.target.value);
                setPage(1);
              }}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-800 shadow-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            >
              <option value="All">All Difficulty</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            <button
              onClick={resetFilters}
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white hover:bg-slate-800"
            >
              Refresh
            </button>
          </div>
        </section>

        <section className="rounded-[30px] bg-white p-6 shadow-lg shadow-indigo-50 ring-1 ring-indigo-100">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">Practice List</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                {loading
                  ? "Loading dataset questions..."
                  : `${filtered.length} Questions Found • Page ${safePage}/${totalPages}`}
              </p>
            </div>
            <p className="text-sm font-black text-indigo-600">Keep solving daily</p>
          </div>

          <div className="mt-6 space-y-4">
            {!loading && currentRows.length === 0 && (
              <div className="rounded-2xl bg-slate-50 p-6 text-center text-sm font-bold text-slate-500 ring-1 ring-slate-200">
                No questions found. Try another filter.
              </div>
            )}

            {currentRows.map((q, index) => (
              <div
                key={q.id}
                className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 transition hover:border-indigo-200 hover:bg-indigo-50/40"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700 ring-1 ring-indigo-100">
                      QUESTION {(safePage - 1) * pageSize + index + 1}
                    </span>

                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-700 ring-1 ring-slate-200">
                      {q.topic}
                    </span>

                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-700 ring-1 ring-slate-200">
                      {q.platform}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${
                        q.difficulty === "Easy"
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                          : q.difficulty === "Medium"
                            ? "bg-amber-50 text-amber-700 ring-amber-100"
                            : "bg-rose-50 text-rose-700 ring-rose-100"
                      }`}
                    >
                      {q.difficulty}
                    </span>

                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-500 ring-1 ring-slate-200">
                      {done[q.id] ? "Completed" : "Not Attempted"}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={q.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-2xl bg-white px-4 py-2 text-xs font-black text-indigo-700 ring-1 ring-indigo-100 hover:bg-indigo-50"
                    >
                      Open
                    </a>

                    <button
                      onClick={() => toggleDone(q.id)}
                      className={`rounded-2xl px-4 py-2 text-xs font-black ${
                        done[q.id] ? "bg-emerald-600 text-white" : "bg-slate-900 text-white"
                      }`}
                    >
                      {done[q.id] ? "Done" : "Mark Done"}
                    </button>
                  </div>
                </div>

                <h3 className="mt-4 text-lg font-black text-slate-900">{q.title}</h3>
              </div>
            ))}
          </div>

          {filtered.length > pageSize && (
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-[24px] bg-slate-50 p-4 ring-1 ring-slate-200">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-700 ring-1 ring-slate-200 hover:bg-indigo-50 disabled:opacity-40"
              >
                Previous Page
              </button>

              <span className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-700 ring-1 ring-slate-200">
                Page {safePage} of {totalPages}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white hover:bg-slate-800 disabled:opacity-40"
              >
                Next Page
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
