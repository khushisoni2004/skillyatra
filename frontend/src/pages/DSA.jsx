import { useEffect, useMemo, useState } from "react";
import api from "../lib/api";

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
  const [topicCounts, setTopicCounts] = useState({});
  const [topic, setTopic] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [platform, setPlatform] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalAll, setTotalAll] = useState(0);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const pageSize = 100;

  async function loadQuestions(nextPage = page) {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: String(nextPage),
        limit: String(pageSize),
        topic,
        platform,
        difficulty,
        search
      });

      const res = await api.get(`/dsa/questions?${params.toString()}`);

      if (!res.data?.ok) {
        setQuestions([]);
        return;
      }

      setQuestions(res.data.questions || []);
      setTopics(res.data.topics || ["All"]);
      setPlatforms(res.data.platforms || ["All"]);
      setTopicCounts(res.data.topicCounts || {});
      setTotalAll(res.data.totalAll || 0);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
      setPage(res.data.page || nextPage);
    } catch {
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQuestions(1);
  }, [topic, platform, difficulty]);

  function searchNow() {
    setPage(1);
    loadQuestions(1);
  }

  function refreshAll() {
    setTopic("All");
    setPlatform("All");
    setDifficulty("All");
    setSearch("");
    setPage(1);
    loadQuestions(1);
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
    <main className="dsaThemePage min-h-screen bg-gradient-to-br from-slate-100 via-blue-100 to-indigo-100 p-6">
      <div className="dsaThemeShell mx-auto max-w-7xl space-y-6">
        <section className="dsaHero rounded-[34px] bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 p-8 text-white shadow-xl shadow-indigo-200">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-indigo-100">
            DSA Tracker
          </p>
          <h1 className="mt-3 text-4xl font-black">Topic-Wise DSA Practice</h1>
</section>

        <section className="dsaStatsGrid grid gap-4 md:grid-cols-4">
          <div className="rounded-[26px] bg-white p-5 shadow-lg ring-1 ring-slate-200">
            <p className="text-sm font-black text-slate-500">Total Questions</p>
            <h2 className="mt-2 text-3xl font-black text-slate-900">{loading ? "..." : totalAll}</h2>
          </div>

          <div className="rounded-[26px] bg-white p-5 shadow-lg ring-1 ring-slate-200">
            <p className="text-sm font-black text-slate-500">Completed</p>
            <h2 className="mt-2 text-3xl font-black text-emerald-600">{completed}</h2>
          </div>

          <div className="rounded-[26px] bg-white p-5 shadow-lg ring-1 ring-slate-200">
            <p className="text-sm font-black text-slate-500">Pending</p>
            <h2 className="mt-2 text-3xl font-black text-rose-600">{Math.max(0, totalAll - completed)}</h2>
          </div>

          <div className="rounded-[26px] bg-white p-5 shadow-lg ring-1 ring-slate-200">
            <p className="text-sm font-black text-slate-500">Progress</p>
            <h2 className="mt-2 text-3xl font-black text-indigo-600">{progress}%</h2>
          </div>
        </section>

        <section className="dsaFilterPanel rounded-[30px] bg-white p-5 shadow-xl ring-1 ring-slate-200">
          <div className="grid gap-3 md:grid-cols-[1fr_240px_240px_220px_auto]">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") searchNow();
              }}
              placeholder="Search question..."
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

            <button
              onClick={searchNow}
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white hover:bg-slate-800"
            >
              Search
            </button>
          </div>

          <div className="dsaTopicChips mt-4 flex flex-wrap gap-2">
            {topics.filter((t) => t !== "All").map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTopic(t);
                  setPage(1);
                }}
                className={`rounded-xl px-4 py-2 text-sm font-black ring-1 ${
                  topic === t
                    ? "bg-indigo-600 text-white ring-indigo-600"
                    : "bg-white text-slate-700 ring-slate-200 hover:bg-indigo-50"
                }`}
              >
                {t} <span className="ml-1 text-xs opacity-80">{topicCounts[t] || 0}</span>
              </button>
            ))}
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm font-black text-slate-700">
            {loading ? "Loading coding questions..." : `Showing ${questions.length} of ${total} questions`}
          </p>

          <button
            onClick={refreshAll}
            className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-700 shadow ring-1 ring-slate-200 hover:bg-indigo-50"
          >
            Refresh
          </button>
        </div>

        <section className="dsaQuestionGrid space-y-5">
          {!loading && questions.length === 0 && (
            <div className="rounded-[28px] bg-white p-8 text-center text-sm font-black text-slate-500 shadow ring-1 ring-slate-200">
              No coding questions found. Check backend dataset route.
            </div>
          )}

          {questions.map((q, index) => (
            <div key={q.id} className="dsaQuestionCard rounded-[28px] bg-white p-6 shadow-lg ring-1 ring-slate-200">
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div className="min-w-0 flex-1">
                  <span className="inline-flex rounded-full bg-indigo-600 px-5 py-2 text-sm font-black text-white">
                    {q.topic}
                  </span>

                  <p className="mt-4 text-xs font-black uppercase tracking-wide text-slate-400">
                    Question {(page - 1) * pageSize + index + 1}
                  </p>

                  <h3 className="mt-2 text-2xl font-black capitalize text-slate-950">
                    {q.title}
                  </h3>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700 ring-1 ring-indigo-100">
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

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">
                      {done[q.id] ? "Completed" : "Not Attempted"}
                    </span>
                  </div>
                </div>

                <div className="flex min-w-[170px] flex-col gap-3">
                  <a
                    href={q.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl bg-indigo-600 px-5 py-3 text-center text-sm font-black text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700"
                  >
                    ↗ Open
                  </a>

                  <button
                    onClick={() => toggleDone(q.id)}
                    className={`rounded-2xl px-5 py-3 text-sm font-black shadow ${
                      done[q.id]
                        ? "bg-emerald-600 text-white"
                        : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    ⊙ {done[q.id] ? "Done" : "Mark Done"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>

        {totalPages > 1 && (
          <div className="dsaPagination flex flex-wrap items-center justify-between gap-4 rounded-[24px] bg-white p-4 shadow ring-1 ring-slate-200">
            <button
              onClick={() => {
                const next = Math.max(1, page - 1);
                setPage(next);
                loadQuestions(next);
              }}
              disabled={page === 1}
              className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-700 ring-1 ring-slate-200 hover:bg-indigo-50 disabled:opacity-40"
            >
              Previous Page
            </button>

            <span className="rounded-2xl bg-slate-50 px-5 py-3 text-sm font-black text-slate-700 ring-1 ring-slate-200">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => {
                const next = Math.min(totalPages, page + 1);
                setPage(next);
                loadQuestions(next);
              }}
              disabled={page === totalPages}
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white hover:bg-slate-800 disabled:opacity-40"
            >
              Next Page
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
