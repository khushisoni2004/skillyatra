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

  const pageSize = 100;

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

      const res = await fetch(`${API_BASE}/dsa/questions?${params.toString()}`);
      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.message || "DSA API failed");
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
    <div className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mb-8">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-indigo-600">DSA Tracker</p>
        <h1 className="mt-2 text-4xl font-black">Topic-Wise DSA Practice</h1>
        <p className="mt-2 text-sm font-bold text-slate-500">
          Real dataset from backend: {API_BASE}/dsa/questions
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl bg-white p-5 shadow">
          <p className="text-sm font-bold text-slate-500">Total Questions</p>
          <h2 className="mt-2 text-3xl font-black">{loading ? "..." : totalAll}</h2>
        </div>
        <div className="rounded-3xl bg-white p-5 shadow">
          <p className="text-sm font-bold text-slate-500">Completed</p>
          <h2 className="mt-2 text-3xl font-black">{completed}</h2>
        </div>
        <div className="rounded-3xl bg-white p-5 shadow">
          <p className="text-sm font-bold text-slate-500">Pending</p>
          <h2 className="mt-2 text-3xl font-black">{Math.max(0, totalAll - completed)}</h2>
        </div>
        <div className="rounded-3xl bg-white p-5 shadow">
          <p className="text-sm font-bold text-slate-500">Progress</p>
          <h2 className="mt-2 text-3xl font-black">{progress}%</h2>
        </div>
      </div>

      <div className="mt-6 grid gap-3 rounded-3xl bg-white p-5 shadow md:grid-cols-5">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && searchNow()}
          placeholder="Search question..."
          className="rounded-2xl border px-4 py-3 text-sm font-bold outline-none md:col-span-2"
        />

        <select value={topic} onChange={(e) => setTopic(e.target.value)} className="rounded-2xl border px-4 py-3 text-sm font-bold">
          {topics.map((t) => <option key={t} value={t}>{t === "All" ? "All Topics" : t}</option>)}
        </select>

        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="rounded-2xl border px-4 py-3 text-sm font-bold">
          {difficulties.map((d) => <option key={d} value={d}>{d === "All" ? "All Difficulty" : d}</option>)}
        </select>

        <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="rounded-2xl border px-4 py-3 text-sm font-bold">
          {platforms.map((p) => <option key={p} value={p}>{p === "All" ? "All Platforms" : p}</option>)}
        </select>

        <button onClick={searchNow} className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-black text-white">
          Search
        </button>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {topics.filter((t) => t !== "All").map((t) => (
          <button
            key={t}
            onClick={() => setTopic(t)}
            className={`rounded-xl px-4 py-2 text-sm font-black ${
              topic === t ? "bg-indigo-600 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200"
            }`}
          >
            {t} {topicCounts[t] || 0}
          </button>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="font-black text-slate-700">
          {loading ? "Loading coding questions..." : `Showing ${questions.length} of ${total} questions`}
        </p>
        <button onClick={refreshAll} className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white">
          Refresh
        </button>
      </div>

      {error && <div className="mt-4 rounded-2xl bg-red-50 p-4 font-bold text-red-700">{error}</div>}

      {!loading && questions.length === 0 && !error && (
        <div className="mt-8 rounded-3xl bg-white p-8 text-center shadow">
          No coding questions found. Check backend dataset route.
        </div>
      )}

      <div className="mt-6 grid gap-4">
        {questions.map((q, index) => (
          <div key={q.id || index} className="rounded-3xl bg-white p-5 shadow">
            <div className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-wide text-indigo-600">
              <span>{q.topic}</span>
              <span>Question {(page - 1) * pageSize + index + 1}</span>
            </div>

            <h3 className="mt-3 text-xl font-black text-slate-900">{q.title}</h3>

            <div className="mt-3 flex flex-wrap gap-2 text-sm font-bold text-slate-600">
              <span>{q.platform}</span>
              <span>{q.difficulty}</span>
              <span>{done[q.id] ? "Completed" : "Not Attempted"}</span>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              {q.url && (
                <a href={q.url} target="_blank" rel="noreferrer" className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-black text-white">
                  Open Question ↗
                </a>
              )}
              <button
                onClick={() => toggleDone(q.id)}
                className={`rounded-2xl px-5 py-3 text-sm font-black ${
                  done[q.id] ? "bg-emerald-600 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200"
                }`}
              >
                {done[q.id] ? "Done" : "Mark Done"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={() => loadQuestions(Math.max(1, page - 1))}
            disabled={page === 1}
            className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-700 ring-1 ring-slate-200 disabled:opacity-40"
          >
            Previous Page
          </button>
          <span className="font-black">Page {page} of {totalPages}</span>
          <button
            onClick={() => loadQuestions(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white disabled:opacity-40"
          >
            Next Page
          </button>
        </div>
      )}
    </div>
  );
}
