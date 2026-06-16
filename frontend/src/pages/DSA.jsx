import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import api from "../lib/api";
import "./DSA.css";

const STORAGE_KEY = "skillyatra_real_dsa_done_v1";
const CACHE_PREFIX = "skillyatra_dsa_server_page_cache_v11";
const FULL_CACHE_PREFIX = "skillyatra_dsa_filtered_full_cache_v11";
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

function readCache(key) {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed?.time || !parsed?.data) return null;

    const maxAge = 1000 * 60 * 30;
    if (Date.now() - parsed.time > maxAge) {
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

function normalizeText(value) {
  return String(value || "").trim();
}

function makePageCacheKey({
  page,
  topic,
  platform,
  difficulty,
  search
}) {
  const normalize = (value, fallback = "") =>
    encodeURIComponent(
      String(value ?? fallback)
        .trim()
        .toLowerCase()
    );

  return [
    CACHE_PREFIX,
    Number(page || 1),
    normalize(topic, "All"),
    normalize(platform, "All"),
    normalize(difficulty, "All"),
    normalize(search, "")
  ].join(":");
}

function makeFullCacheKey({ topic, platform, difficulty, search }) {
  return `${FULL_CACHE_PREFIX}:${topic || "All"}:${platform || "All"}:${difficulty || "All"}:${search || ""}`;
}

function buildQuestionsUrl({
  page = 1,
  limit = PAGE_SIZE,
  topic = "All",
  platform = "All",
  difficulty = "All",
  search = ""
}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    topic,
    platform,
    difficulty,
    search
  });

  return `/dsa/questions?${params.toString()}`;
}

function hasActiveFilter({ topic, platform, difficulty, search }) {
  return (
    normalizeText(topic) !== "All" ||
    normalizeText(platform) !== "All" ||
    normalizeText(difficulty) !== "All" ||
    normalizeText(search) !== ""
  );
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
  const requestRef = useRef(0);

  const applyServerData = useCallback((data, fallbackPage = 1) => {
    if (!data?.ok) return;

    setQuestions(Array.isArray(data.questions) ? data.questions : []);
    setTopics(Array.isArray(data.topics) && data.topics.length ? data.topics : ["All"]);
    setPlatforms(Array.isArray(data.platforms) && data.platforms.length ? data.platforms : ["All"]);
    setTopicCounts(data.topicCounts || {});
    setTotalAll(Number(data.totalAll || 0));
    setTotal(Number(data.total || 0));
    setTotalPages(Number(data.totalPages || 1));
    setPage(Number(data.page || fallbackPage || 1));
  }, []);

  const applyFullFilteredData = useCallback((data, targetPage = 1) => {
    if (!data?.ok) return;

    const allQuestions = Array.isArray(data.questions) ? data.questions : [];
    const safePage = Math.max(1, Number(targetPage || 1));
    const start = (safePage - 1) * PAGE_SIZE;
    const slicedQuestions = allQuestions.slice(start, start + PAGE_SIZE);

    setQuestions(slicedQuestions);
    setTopics(Array.isArray(data.topics) && data.topics.length ? data.topics : ["All"]);
    setPlatforms(Array.isArray(data.platforms) && data.platforms.length ? data.platforms : ["All"]);
    setTopicCounts(data.topicCounts || {});
    setTotalAll(Number(data.totalAll || 0));

    const realTotal = Number(data.total || allQuestions.length || 0);
    setTotal(realTotal);
    setTotalPages(Math.max(1, Math.ceil(realTotal / PAGE_SIZE)));
    setPage(safePage);
  }, []);

  async function prefetchServerPage() {
    // Disabled intentionally.
    // Background prefetch previously allowed stale topic/page data
    // to overwrite the user's latest selection.
    return;
  }

  async function loadServerPage({
    targetPage = 1,
    nextTopic = "All",
    nextPlatform = "All",
    nextDifficulty = "All",
    nextSearch = "",
    force = false
  }) {
    const safePage = Math.max(1, Number(targetPage || 1));

    const filters = {
      page: safePage,
      topic: nextTopic || "All",
      platform: nextPlatform || "All",
      difficulty: nextDifficulty || "All",
      search: nextSearch || ""
    };

    const cacheKey = makePageCacheKey(filters);
    const cached = force ? null : readCache(cacheKey);

    const reqId = requestRef.current + 1;
    requestRef.current = reqId;

    setPage(safePage);

    if (cached?.ok && Array.isArray(cached.questions)) {
      applyServerData(cached, safePage);
      setLoading(false);
    } else {
      setQuestions([]);
      setTotal(0);
      setTotalPages(1);
      setLoading(true);
    }

    const requestUrl = buildQuestionsUrl({
      page: safePage,
      limit: PAGE_SIZE,
      topic: filters.topic,
      platform: filters.platform,
      difficulty: filters.difficulty,
      search: filters.search
    });

    async function fetchQuestions() {
      return api.get(requestUrl, {
        timeout: 12000,});
    }

    try {
      let response;

      try {
        response = await fetchQuestions();
      } catch {
        // One automatic retry for temporary browser/network failure.
        await new Promise((resolve) => setTimeout(resolve, 350));
        response = await fetchQuestions();
      }

      if (requestRef.current !== reqId) return;

      const data = response?.data;

      if (!data?.ok) {
        throw new Error("Invalid DSA response");
      }

      const receivedQuestions = Array.isArray(data.questions)
        ? data.questions
        : [];

      const normalizedData = {
        ...data,
        page: Number(data.page || safePage),
        limit: Number(data.limit || PAGE_SIZE),
        total: Number(data.total || 0),
        totalAll: Number(data.totalAll || 0),
        totalPages: Math.max(
          1,
          Number(
            data.totalPages ||
              Math.ceil(Number(data.total || 0) / PAGE_SIZE)
          )
        ),
        questions: receivedQuestions
      };

      writeCache(cacheKey, normalizedData);
      applyServerData(normalizedData, safePage);
    } catch (error) {
      if (requestRef.current !== reqId) return;

      if (cached?.ok && Array.isArray(cached.questions)) {
        applyServerData(cached, safePage);
      } else {
        setQuestions([]);
        setTotal(0);
        setTotalPages(1);
        setPage(safePage);
      }

      console.error("DSA questions loading failed:", error);
    } finally {
      if (requestRef.current === reqId) {
        setLoading(false);
      }
    }
  }

  async function loadFilteredFull({
    targetPage = 1,
    nextTopic = topic,
    nextPlatform = platform,
    nextDifficulty = difficulty,
    nextSearch = search,
    force = false
  }) {
    return loadServerPage({
      targetPage,
      nextTopic,
      nextPlatform,
      nextDifficulty,
      nextSearch,
      force
    });
  }

  const loadQuestions = useCallback(
    ({
      targetPage = 1,
      nextTopic = topic,
      nextPlatform = platform,
      nextDifficulty = difficulty,
      nextSearch = search,
      force = false
    } = {}) => {
      loadServerPage({
        targetPage,
        nextTopic: nextTopic || "All",
        nextPlatform: nextPlatform || "All",
        nextDifficulty: nextDifficulty || "All",
        nextSearch: nextSearch || "",
        force
      });
    },
    [topic, platform, difficulty, search]
  );

  useEffect(() => {
    loadQuestions({
      targetPage: 1,
      nextTopic: "All",
      nextPlatform: "All",
      nextDifficulty: "All",
      nextSearch: "",
      force: false
    });

    return undefined;
  }, []);



  function searchNow() {
    setPage(1);
    loadQuestions({
      targetPage: 1,
      nextTopic: topic,
      nextPlatform: platform,
      nextDifficulty: difficulty,
      nextSearch: search,
      force: false
    });
  }

  function refreshAll() {
    Object.keys(sessionStorage)
      .filter((key) => key.includes("skillyatra_dsa"))
      .forEach((key) => sessionStorage.removeItem(key));

    setTopic("All");
    setPlatform("All");
    setDifficulty("All");
    setSearch("");
    setPage(1);
    setQuestions([]);

    loadQuestions({
      targetPage: 1,
      nextTopic: "All",
      nextPlatform: "All",
      nextDifficulty: "All",
      nextSearch: "",
      force: true
    });
  }

  function selectTopic(nextTopic) {
    setTopic(nextTopic);
    setPage(1);
    setQuestions([]);

    loadQuestions({
      targetPage: 1,
      nextTopic,
      nextPlatform: platform,
      nextDifficulty: difficulty,
      nextSearch: search,
      force: false
    });
  }

  function selectDifficulty(nextDifficulty) {
    setDifficulty(nextDifficulty);
    setPage(1);
    setQuestions([]);

    loadQuestions({
      targetPage: 1,
      nextTopic: topic,
      nextPlatform: platform,
      nextDifficulty,
      nextSearch: search,
      force: false
    });
  }

  function selectPlatform(nextPlatform) {
    setPlatform(nextPlatform);
    setPage(1);
    setQuestions([]);

    loadQuestions({
      targetPage: 1,
      nextTopic: topic,
      nextPlatform,
      nextDifficulty: difficulty,
      nextSearch: search,
      force: false
    });
  }

  function changePage(targetPage) {
    const safePage = Math.max(
      1,
      Math.min(Number(totalPages || 1), Number(targetPage || 1))
    );

    if (safePage === page && questions.length > 0) return;

    setPage(safePage);
    setQuestions([]);

    loadQuestions({
      targetPage: safePage,
      nextTopic: topic,
      nextPlatform: platform,
      nextDifficulty: difficulty,
      nextSearch: search,
      force: false
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
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
              onChange={(e) => selectTopic(e.target.value)}
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
              onChange={(e) => selectDifficulty(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-800 shadow-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            >
              <option value="All">All Difficulty</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            <select
              value={platform}
              onChange={(e) => selectPlatform(e.target.value)}
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
                onClick={() => selectTopic(item)}
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

        {loading && questions.length === 0 && (
          <div className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
            <h3 className="text-xl font-black text-indigo-700">
              Loading selected questions...
            </h3>
          </div>
        )}

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
              key={`${q.id || q.url || q.title}-${page}-${index}`}
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
                    className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-black text-white shadow hover:bg-indigo-700"
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
