import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import api from "../lib/api";
import "./DSA.css";

const STORAGE_KEY = "skillyatra_real_dsa_done_v1";
const CACHE_PREFIX = "skillyatra_dsa_page_cache_v2";
const PAGE_SIZE = 25;

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

function makeCacheKey({ page, topic, platform, difficulty, search }) {
  return `${CACHE_PREFIX}:${page}:${topic}:${platform}:${difficulty}:${search || ""}`;
}

function readCache(key) {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed?.time || !parsed?.data) return null;

    const age = Date.now() - parsed.time;
    const maxAge = 1000 * 60 * 20;

    if (age > maxAge) {
      sessionStorage.removeItem(key);
      return null;
    }

    return parsed.data;
  } catch {
    return null;
  }
}

function writeCache(key, data) {
  try {
    sessionStorage.setItem(
      key,
      JSON.stringify({
        time: Date.now(),
        data
      })
    );
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

  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const latestRequestRef = useRef(0);

  const applyData = useCallback((data, fallbackPage) => {
    if (!data?.ok) return;

    setQuestions(data.questions || []);
    setTopics(data.topics || ["All"]);
    setPlatforms(data.platforms || ["All"]);
    setTopicCounts(data.topicCounts || {});
    setTotalAll(data.totalAll || 0);
    setTotal(data.total || 0);
    setTotalPages(data.totalPages || 1);
    setPage(data.page || fallbackPage);
  }, []);

  const buildUrl = useCallback(
    (targetPage) => {
      const params = new URLSearchParams({
        page: String(targetPage),
        limit: String(PAGE_SIZE),
        topic,
        platform,
        difficulty,
        search
      });

      return `/dsa/questions?${params.toString()}`;
    },
    [topic, platform, difficulty, search]
  );

  const prefetchPage = useCallback(
    async (targetPage) => {
      if (targetPage < 1 || targetPage > totalPages) return;

      const cacheKey = makeCacheKey({
        page: targetPage,
        topic,
        platform,
        difficulty,
        search
      });

      if (readCache(cacheKey)) return;

      try {
        const res = await api.get(buildUrl(targetPage));
        if (res.data?.ok) {
          writeCache(cacheKey, res.data);
        }
      } catch {}
    },
    [buildUrl, difficulty, platform, search, topic, totalPages]
  );

  const loadQuestions = useCallback(
    async (targetPage = page, options = {}) => {
      const { force = false, silent = false } = options;

      const requestId = Date.now();
      latestRequestRef.current = requestId;

      const cacheKey = makeCacheKey({
        page: targetPage,
        topic,
        platform,
        difficulty,
        search
      });

      const cached = !force ? readCache(cacheKey) : null;

      if (cached) {
        applyData(cached, targetPage);
        setLoading(false);
        setUpdating(false);
      } else if (!silent) {
        setLoading(false);
        setUpdating(false);
      }

      try {
        const res = await api.get(buildUrl(targetPage));

        if (latestRequestRef.current !== requestId && !silent) return;

        if (res.data?.ok) {
          writeCache(cacheKey, res.data);

          if (!silent || !cached) {
            applyData(res.data, targetPage);
          }

          const freshTotalPages = res.data.totalPages || totalPages || 1;
          const currentPage = res.data.page || targetPage;

          for (let i = 1; i <= 5; i += 1) {
            if (currentPage + i <= freshTotalPages) {
              setTimeout(() => prefetchPage(currentPage + i), 120 * i);
            }
          }

          if (currentPage > 1) {
            setTimeout(() => prefetchPage(currentPage - 1), 220);
          }
        } else if (!cached && !silent) {
          setQuestions([]);
        }
      } catch {
        if (!cached && !silent) {
          setQuestions([]);
        }
      } finally {
        if (!silent) {
          setLoading(false);
          setUpdating(false);
        }
      }
    },
    [
      applyData,
      buildUrl,
      difficulty,
      page,
      platform,
      prefetchPage,
      questions.length,
      search,
      topic,
      totalPages
    ]
  );

  useEffect(() => {
    setPage(1);
    loadQuestions(1, { force: false });
  }, [topic, platform, difficulty]);

  useEffect(() => {
    if (questions.length > 0) {
      for (let i = 1; i <= 5; i += 1) {
        prefetchPage(page + i);
      }
      prefetchPage(page - 1);
    }
  }, [page, questions.length, prefetchPage]);

  useEffect(() => {
    const realTopics = topics.filter((item) => item && item !== "All").slice(0, 60);
    if (!realTopics.length) return;

    realTopics.forEach((topicName, index) => {
      setTimeout(async () => {
        const cacheKey = makeCacheKey({
          page: 1,
          topic: topicName,
          platform,
          difficulty,
          search: ""
        });

        if (readCache(cacheKey)) return;

        try {
          const params = new URLSearchParams({
            page: "1",
            limit: String(PAGE_SIZE),
            topic: topicName,
            platform,
            difficulty,
            search: ""
          });

          const res = await api.get(`/dsa/questions?${params.toString()}`);
          if (res.data?.ok) {
            writeCache(cacheKey, res.data);
          }
        } catch {}
      }, index * 70);
    });
  }, [topics, platform, difficulty]);

  function searchNow() {
    setPage(1);
    loadQuestions(1, { force: false });
  }

  function refreshAll() {
    setTopic("All");
    setPlatform("All");
    setDifficulty("All");
    setSearch("");
    setPage(1);

    setTimeout(() => {
      loadQuestions(1, { force: true });
    }, 0);
  }

  function changePage(targetPage) {
    const safePage = Math.max(1, Math.min(totalPages, targetPage));
    setPage(safePage);
    loadQuestions(safePage, { force: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleDone(id) {
    const next = { ...done, [id]: !done[id] };
    if (!next[id]) delete next[id];

    setDone(next);
    saveDone(next);
  }

  const completed = useMemo(
    () => Object.values(done).filter(Boolean).length,
    [done]
  );

  const progress = totalAll ? Math.round((completed / totalAll) * 100) : 0;

  return (
    <div className="dsa-page min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="dsa-shell mx-auto max-w-7xl">
        <div className="dsa-hero mb-6 rounded-[32px] bg-gradient-to-br from-indigo-600 via-sky-500 to-cyan-400 p-7 text-white shadow-xl">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-white/80">
            DSA Tracker
          </p>

          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            Topic-Wise DSA Practice
          </h1>

          <p className="mt-3 max-w-3xl text-sm font-semibold leading-7 text-white/85 sm:text-base">
            Real dataset loaded from backend. Practice coding questions by topic,
            platform, and difficulty.
          </p>
        </div>

        <div className="dsa-stats mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">
              Total Questions
            </p>
            <h2 className="mt-2 text-3xl font-black text-slate-900">
              {totalAll || "..."}
            </h2>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">
              Completed
            </p>
            <h2 className="mt-2 text-3xl font-black text-emerald-600">
              {completed}
            </h2>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">
              Pending
            </p>
            <h2 className="mt-2 text-3xl font-black text-orange-500">
              {Math.max(0, totalAll - completed)}
            </h2>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">
              Progress
            </p>
            <h2 className="mt-2 text-3xl font-black text-indigo-600">
              {progress}%
            </h2>
          </div>
        </div>

        <div className="dsa-filter-panel mb-6 rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto_auto]">
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
                const nextTopic = e.target.value;
                const cached = readCache(
                  makeCacheKey({
                    page: 1,
                    topic: nextTopic,
                    platform,
                    difficulty,
                    search
                  })
                );

                if (cached) {
                  applyData(cached, 1);
                  setLoading(false);
                  setUpdating(false);
                }

                setTopic(nextTopic);
                setPage(1);
              }}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-800 shadow-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            >
              {topics.map((item) => (
                <option key={item} value={item}>
                  {item === "All" ? "All Topics" : item}
                </option>
              ))}
            </select>

            <select
              value={difficulty}
              onChange={(e) => {
                const nextDifficulty = e.target.value;
                const cached = readCache(
                  makeCacheKey({
                    page: 1,
                    topic,
                    platform,
                    difficulty: nextDifficulty,
                    search
                  })
                );

                if (cached) {
                  applyData(cached, 1);
                  setLoading(false);
                  setUpdating(false);
                }

                setDifficulty(nextDifficulty);
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
                const nextPlatform = e.target.value;
                const cached = readCache(
                  makeCacheKey({
                    page: 1,
                    topic,
                    platform: nextPlatform,
                    difficulty,
                    search
                  })
                );

                if (cached) {
                  applyData(cached, 1);
                  setLoading(false);
                  setUpdating(false);
                }

                setPlatform(nextPlatform);
                setPage(1);
              }}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-800 shadow-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            >
              {platforms.map((item) => (
                <option key={item} value={item}>
                  {item === "All" ? "All Platforms" : item}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={searchNow}
              className="dsa-main-btn rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-black text-white shadow hover:bg-indigo-700"
            >
              Search
            </button>

            <button
              type="button"
              onClick={refreshAll}
              className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="dsa-topic-list mb-6 flex flex-wrap gap-2">
          {topics
            .filter((item) => item !== "All")
            .map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  const cached = readCache(
                    makeCacheKey({
                      page: 1,
                      topic: item,
                      platform,
                      difficulty,
                      search
                    })
                  );

                  if (cached) {
                    applyData(cached, 1);
                    setLoading(false);
                    setUpdating(false);
                  }

                  setTopic(item);
                  setPage(1);
                }}
                className={`rounded-xl px-4 py-2 text-sm font-black ring-1 ${
                  topic === item
                    ? "bg-indigo-600 text-white ring-indigo-600"
                    : "bg-white text-slate-700 ring-slate-200 hover:bg-indigo-50"
                }`}
              >
                {item} {topicCounts[item] || 0}
              </button>
            ))}
        </div>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-white px-5 py-4 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-black text-slate-600">
            {`Showing ${questions.length} of ${total} questions`}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => changePage(page - 1)}
              disabled={page === 1}
              className="rounded-2xl bg-white px-4 py-2 text-sm font-black text-slate-700 ring-1 ring-slate-200 hover:bg-indigo-50 disabled:opacity-40"
            >
              Previous
            </button>

            <span className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">
              Page {page} / {totalPages}
            </span>

            <button
              type="button"
              onClick={() => changePage(page + 1)}
              disabled={page === totalPages}
              className="dsa-main-btn rounded-2xl bg-slate-900 px-4 py-2 text-sm font-black text-white hover:bg-slate-800 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>

        {!loading && questions.length === 0 && (
          <div className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
            <h3 className="text-xl font-black text-slate-900">
              No coding questions found.
            </h3>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              Try another topic, platform, difficulty, or search keyword.
            </p>
          </div>
        )}

        <div className="dsa-question-grid grid gap-4 lg:grid-cols-2">
          {questions.map((q, index) => (
            <div
              key={q.id || `${q.title}-${index}`}
              className="dsa-question-card rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700">
                  {q.topic || "DSA"}
                </span>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
                  Question {(page - 1) * PAGE_SIZE + index + 1}
                </span>

                <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-black text-sky-700">
                  {q.platform || "Platform"}
                </span>

                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                  {q.difficulty || "Easy"}
                </span>
              </div>

              <h3 className="mt-4 text-xl font-black leading-snug text-slate-900">
                {q.title}
              </h3>

              <p className="mt-2 text-sm font-bold text-slate-500">
                Status: {done[q.id] ? "Completed" : "Not Attempted"}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                {q.url && (
                  <a
                    href={q.url}
                    target="_blank"
                    rel="noreferrer"
                    className="dsa-main-btn rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-black text-white shadow hover:bg-indigo-700"
                  >
                    Open Question ↗
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => toggleDone(q.id)}
                  className={`rounded-2xl px-5 py-3 text-sm font-black shadow ${
                    done[q.id]
                      ? "bg-emerald-600 text-white"
                      : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {done[q.id] ? "Done" : "Mark Done"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => changePage(page - 1)}
              disabled={page === 1}
              className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-700 ring-1 ring-slate-200 hover:bg-indigo-50 disabled:opacity-40"
            >
              Previous Page
            </button>

            <span className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-700 ring-1 ring-slate-200">
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              onClick={() => changePage(page + 1)}
              disabled={page === totalPages}
              className="dsa-main-btn rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white hover:bg-slate-800 disabled:opacity-40"
            >
              Next Page
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
