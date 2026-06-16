import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import "./DSAResourcesTheme.css";

const PAGE_SIZE = 25;
const DONE_STORAGE_KEY = "skillyatra_real_dsa_done_v1";
const CACHE_PREFIX = "skillyatra_dsa_stable_v20";
const CACHE_TTL = 10 * 60 * 1000;

function getBackendBase() {
  const configured = String(
    import.meta.env.VITE_API_URL ||
      import.meta.env.VITE_BACKEND_URL ||
      "https://skillyatra-backend.onrender.com"
  )
    .trim()
    .replace(/\/+$/, "");

  return configured;
}

function getQuestionsEndpoint() {
  const base = getBackendBase();

  if (base.endsWith("/api")) {
    return `${base}/dsa/questions`;
  }

  return `${base}/api/dsa/questions`;
}

function normalize(value, fallback = "") {
  return String(value ?? fallback).trim();
}

function makeCacheKey({
  page,
  topic,
  difficulty,
  platform,
  search
}) {
  return [
    CACHE_PREFIX,
    Number(page || 1),
    normalize(topic, "All").toLowerCase(),
    normalize(difficulty, "All").toLowerCase(),
    normalize(platform, "All").toLowerCase(),
    normalize(search, "").toLowerCase()
  ].join("::");
}

function readCache(key) {
  try {
    const raw = sessionStorage.getItem(key);

    if (!raw) return null;

    const parsed = JSON.parse(raw);

    if (
      !parsed ||
      !parsed.savedAt ||
      Date.now() - parsed.savedAt > CACHE_TTL
    ) {
      sessionStorage.removeItem(key);
      return null;
    }

    return parsed.data || null;
  } catch {
    return null;
  }
}

function writeCache(key, data) {
  try {
    sessionStorage.setItem(
      key,
      JSON.stringify({
        savedAt: Date.now(),
        data
      })
    );
  } catch {
    // Browser storage failure must never break the page.
  }
}

function readDoneQuestions() {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(DONE_STORAGE_KEY) || "[]"
    );

    return Array.isArray(parsed)
      ? parsed.map(String)
      : [];
  } catch {
    return [];
  }
}

function getQuestionId(question, index) {
  return String(
    question?.id ||
      question?._id ||
      question?.questionId ||
      question?.url ||
      `${question?.title || "question"}-${index}`
  );
}

export default function DSA() {
  const [questions, setQuestions] = useState([]);
  const [topics, setTopics] = useState(["All"]);
  const [platforms, setPlatforms] = useState(["All"]);
  const [difficulties, setDifficulties] = useState([
    "All",
    "Easy",
    "Medium",
    "Hard"
  ]);
  const [topicCounts, setTopicCounts] = useState({});

  const [topic, setTopic] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [platform, setPlatform] = useState("All");
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalAll, setTotalAll] = useState(0);

  const [doneIds, setDoneIds] = useState(() =>
    readDoneQuestions()
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const abortRef = useRef(null);
  const requestIdRef = useRef(0);
  const mountedRef = useRef(true);

  const completed = doneIds.length;
  const pending = Math.max(0, totalAll - completed);
  const progress = totalAll
    ? Math.min(100, Math.round((completed / totalAll) * 100))
    : 0;

  const buildUrl = useCallback(
    ({
      targetPage,
      nextTopic,
      nextDifficulty,
      nextPlatform,
      nextSearch
    }) => {
      const params = new URLSearchParams();

      params.set("page", String(targetPage));
      params.set("limit", String(PAGE_SIZE));
      params.set("topic", nextTopic || "All");
      params.set("difficulty", nextDifficulty || "All");
      params.set("platform", nextPlatform || "All");
      params.set("search", nextSearch || "");

      // Query timestamp bypasses stale CDN/browser responses
      // without adding forbidden request headers.
      params.set("_t", String(Date.now()));

      return `${getQuestionsEndpoint()}?${params.toString()}`;
    },
    []
  );

  const applyData = useCallback((data, fallbackPage = 1) => {
    const nextQuestions = Array.isArray(data?.questions)
      ? data.questions
      : [];

    const nextTopics = Array.isArray(data?.topics)
      ? data.topics
      : ["All"];

    const nextPlatforms = Array.isArray(data?.platforms)
      ? data.platforms
      : ["All"];

    const nextDifficulties = Array.isArray(data?.difficulties)
      ? data.difficulties
      : ["All", "Easy", "Medium", "Hard"];

    const nextTotal = Number(data?.total || 0);
    const nextTotalAll = Number(data?.totalAll || 0);

    const calculatedPages = Math.max(
      1,
      Number(
        data?.totalPages ||
          Math.ceil(nextTotal / PAGE_SIZE)
      )
    );

    setQuestions(nextQuestions);
    setTopics(
      nextTopics.includes("All")
        ? nextTopics
        : ["All", ...nextTopics]
    );
    setPlatforms(
      nextPlatforms.includes("All")
        ? nextPlatforms
        : ["All", ...nextPlatforms]
    );
    setDifficulties(
      nextDifficulties.includes("All")
        ? nextDifficulties
        : ["All", ...nextDifficulties]
    );
    setTopicCounts(
      data?.topicCounts && typeof data.topicCounts === "object"
        ? data.topicCounts
        : {}
    );

    setTotal(nextTotal);
    setTotalAll(nextTotalAll);
    setTotalPages(calculatedPages);
    setPage(Number(data?.page || fallbackPage));
  }, []);

  const loadQuestions = useCallback(
    async ({
      targetPage = 1,
      nextTopic = topic,
      nextDifficulty = difficulty,
      nextPlatform = platform,
      nextSearch = activeSearch,
      force = false
    } = {}) => {
      const safePage = Math.max(1, Number(targetPage || 1));

      const filters = {
        page: safePage,
        topic: nextTopic || "All",
        difficulty: nextDifficulty || "All",
        platform: nextPlatform || "All",
        search: nextSearch || ""
      };

      const cacheKey = makeCacheKey(filters);
      const cached = force ? null : readCache(cacheKey);

      requestIdRef.current += 1;
      const currentRequestId = requestIdRef.current;

      if (abortRef.current) {
        abortRef.current.abort();
      }

      const controller = new AbortController();
      abortRef.current = controller;

      setError("");
      setPage(safePage);

      if (cached?.ok) {
        applyData(cached, safePage);
        setLoading(false);
      } else {
        // Never leave cards from previous topic/page visible.
        setQuestions([]);
        setTotal(0);
        setTotalPages(1);
        setLoading(true);
      }

      const timeoutId = window.setTimeout(() => {
        controller.abort();
      }, 90000);

      try {
        const response = await fetch(
          buildUrl({
            targetPage: safePage,
            nextTopic: filters.topic,
            nextDifficulty: filters.difficulty,
            nextPlatform: filters.platform,
            nextSearch: filters.search
          }),
          {
            method: "GET",
            mode: "cors",
            credentials: "omit",
            signal: controller.signal
          }
        );

        if (!response.ok) {
          throw new Error(
            `Backend returned HTTP ${response.status}`
          );
        }

        const data = await response.json();

        if (!data?.ok) {
          throw new Error(
            data?.message || "Invalid DSA response"
          );
        }

        if (
          !mountedRef.current ||
          currentRequestId !== requestIdRef.current
        ) {
          return;
        }

        const normalized = {
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
          questions: Array.isArray(data.questions)
            ? data.questions
            : []
        };

        writeCache(cacheKey, normalized);
        applyData(normalized, safePage);
        setError("");
      } catch (requestError) {
        if (
          !mountedRef.current ||
          currentRequestId !== requestIdRef.current
        ) {
          return;
        }

        if (requestError?.name === "AbortError") {
          setError(
            "The DSA request timed out. Press Refresh to try again."
          );
        } else {
          setError(
            requestError?.message ||
              "Unable to load DSA questions."
          );
        }

        if (!cached?.ok) {
          setQuestions([]);
          setTotal(0);
          setTotalPages(1);
        }
      } finally {
        window.clearTimeout(timeoutId);

        if (
          mountedRef.current &&
          currentRequestId === requestIdRef.current
        ) {
          setLoading(false);
        }
      }
    },
    [
      topic,
      difficulty,
      platform,
      activeSearch,
      applyData,
      buildUrl
    ]
  );

  useEffect(() => {
    mountedRef.current = true;

    loadQuestions({
      targetPage: 1,
      nextTopic: "All",
      nextDifficulty: "All",
      nextPlatform: "All",
      nextSearch: "",
      force: true
    });

    return () => {
      mountedRef.current = false;

      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, []);

  function handleTopicChange(nextTopic) {
    setTopic(nextTopic);
    setPage(1);

    loadQuestions({
      targetPage: 1,
      nextTopic,
      nextDifficulty: difficulty,
      nextPlatform: platform,
      nextSearch: activeSearch
    });
  }

  function handleDifficultyChange(nextDifficulty) {
    setDifficulty(nextDifficulty);
    setPage(1);

    loadQuestions({
      targetPage: 1,
      nextTopic: topic,
      nextDifficulty,
      nextPlatform: platform,
      nextSearch: activeSearch
    });
  }

  function handlePlatformChange(nextPlatform) {
    setPlatform(nextPlatform);
    setPage(1);

    loadQuestions({
      targetPage: 1,
      nextTopic: topic,
      nextDifficulty: difficulty,
      nextPlatform,
      nextSearch: activeSearch
    });
  }

  function handleSearch() {
    const nextSearch = searchInput.trim();

    setActiveSearch(nextSearch);
    setPage(1);

    loadQuestions({
      targetPage: 1,
      nextTopic: topic,
      nextDifficulty: difficulty,
      nextPlatform: platform,
      nextSearch,
      force: true
    });
  }

  function handleSearchKeyDown(event) {
    if (event.key === "Enter") {
      handleSearch();
    }
  }

  function handleRefresh() {
    Object.keys(sessionStorage)
      .filter((key) =>
        key.startsWith("skillyatra_dsa")
      )
      .forEach((key) =>
        sessionStorage.removeItem(key)
      );

    loadQuestions({
      targetPage: page,
      nextTopic: topic,
      nextDifficulty: difficulty,
      nextPlatform: platform,
      nextSearch: activeSearch,
      force: true
    });
  }

  function changePage(targetPage) {
    const safePage = Math.max(
      1,
      Math.min(
        Number(totalPages || 1),
        Number(targetPage || 1)
      )
    );

    if (safePage === page || loading) return;

    loadQuestions({
      targetPage: safePage,
      nextTopic: topic,
      nextDifficulty: difficulty,
      nextPlatform: platform,
      nextSearch: activeSearch
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  function toggleDone(question, index) {
    const id = getQuestionId(question, index);

    setDoneIds((current) => {
      const exists = current.includes(id);

      const next = exists
        ? current.filter((item) => item !== id)
        : [...current, id];

      localStorage.setItem(
        DONE_STORAGE_KEY,
        JSON.stringify(next)
      );

      return next;
    });
  }

  const summaryText = useMemo(() => {
    if (loading && questions.length === 0) {
      return "Loading questions...";
    }

    return `Showing ${questions.length} of ${total} questions`;
  }, [loading, questions.length, total]);

  return (
    <div className="dsa-theme-page min-h-screen px-4 py-6 md:px-8">
      <div className="dsa-theme-shell mx-auto max-w-7xl">
        <div className="dsa-theme-hero mb-6">
          <h1 className="text-3xl font-black text-slate-900">
            DSA Tracker
          </h1>
          <h2 className="mt-2 text-xl font-bold text-slate-800">
            Topic-Wise DSA Practice
          </h2>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Real dataset loaded from backend. Practice coding
            questions by topic, platform, and difficulty.
          </p>
        </div>

        <div className="dsa-theme-stats mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="dsa-theme-stat-card rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-bold text-slate-500">
              Total Questions
            </p>
            <p className="mt-2 text-3xl font-black text-slate-900">
              {totalAll || "..."}
            </p>
          </div>

          <div className="dsa-theme-stat-card rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-bold text-slate-500">
              Completed
            </p>
            <p className="mt-2 text-3xl font-black text-emerald-600">
              {completed}
            </p>
          </div>

          <div className="dsa-theme-stat-card rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-bold text-slate-500">
              Pending
            </p>
            <p className="mt-2 text-3xl font-black text-amber-600">
              {pending}
            </p>
          </div>

          <div className="dsa-theme-stat-card rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-bold text-slate-500">
              Progress
            </p>
            <p className="mt-2 text-3xl font-black text-indigo-600">
              {progress}%
            </p>
          </div>
        </div>

        <div className="dsa-theme-filters mb-5 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px_220px_auto_auto]">
            <input
              type="text"
              value={searchInput}
              onChange={(event) =>
                setSearchInput(event.target.value)
              }
              onKeyDown={handleSearchKeyDown}
              placeholder="Search question..."
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold outline-none focus:border-indigo-500"
            />

            <select
              value={topic}
              onChange={(event) =>
                handleTopicChange(event.target.value)
              }
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold outline-none focus:border-indigo-500"
            >
              {topics.map((item) => (
                <option key={item} value={item}>
                  {item === "All" ? "All Topics" : item}
                </option>
              ))}
            </select>

            <select
              value={difficulty}
              onChange={(event) =>
                handleDifficultyChange(event.target.value)
              }
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold outline-none focus:border-indigo-500"
            >
              {difficulties.map((item) => (
                <option key={item} value={item}>
                  {item === "All"
                    ? "All Difficulty"
                    : item}
                </option>
              ))}
            </select>

            <select
              value={platform}
              onChange={(event) =>
                handlePlatformChange(event.target.value)
              }
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold outline-none focus:border-indigo-500"
            >
              {platforms.map((item) => (
                <option key={item} value={item}>
                  {item === "All"
                    ? "All Platforms"
                    : item}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleSearch}
              disabled={loading}
              className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-black text-white disabled:opacity-50"
            >
              Search
            </button>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading}
              className="rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-3 text-sm font-black text-indigo-700 disabled:opacity-50"
            >
              Refresh
            </button>
          </div>
        </div>

        {Object.keys(topicCounts).length > 0 && (
          <div className="dsa-theme-topics mb-6 flex flex-wrap gap-2">
            {Object.entries(topicCounts).map(
              ([item, count]) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleTopicChange(item)}
                  className={`rounded-full px-3 py-2 text-xs font-black ${
                    topic === item
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-slate-700 ring-1 ring-slate-200"
                  }`}
                >
                  {item} {count}
                </button>
              )
            )}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        <div className="dsa-theme-pagination mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-bold text-slate-600">
            {summaryText}
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={loading || page <= 1}
              onClick={() => changePage(page - 1)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-black text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <span className="text-sm font-black text-slate-700">
              Page {page} / {totalPages}
            </span>

            <button
              type="button"
              disabled={loading || page >= totalPages}
              onClick={() => changePage(page + 1)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-black text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>

        {loading && questions.length === 0 && (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
            <h3 className="mt-4 text-lg font-black text-indigo-700">
              Loading selected questions...
            </h3>
          </div>
        )}

        {!loading && questions.length === 0 && (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
            <h3 className="text-xl font-black text-slate-900">
              No coding questions found.
            </h3>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              Try another topic, platform, difficulty, or search
              keyword.
            </p>
          </div>
        )}

        {questions.length > 0 && (
          <div className="dsa-theme-question-grid">
            {questions.map((question, index) => {
              const id = getQuestionId(question, index);
              const isDone = doneIds.includes(id);
              const questionNumber =
                (page - 1) * PAGE_SIZE + index + 1;

              const questionUrl =
                question?.url ||
                question?.link ||
                question?.problemUrl ||
                question?.problem_url ||
                question?.problemLink ||
                question?.problem_link ||
                question?.href ||
                "";

              const platformName =
                question?.platform || "Coding Platform";

              return (
                <article
                  key={id}
                  className="dsa-theme-question-card rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="mb-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700">
                          {question.topic || topic}
                        </span>

                        <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-black text-sky-700">
                          {question.platform ||
                            "Unknown Platform"}
                        </span>

                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">
                          {question.difficulty ||
                            "Not specified"}
                        </span>
                      </div>

                      <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                        Question {questionNumber}
                      </p>

                      <h3 className="mt-1 text-lg font-black text-slate-900">
                        {question.title ||
                          question.question ||
                          "Untitled Question"}
                      </h3>

                      <p className="mt-2 text-sm font-bold text-slate-500">
                        Status:{" "}
                        <span
                          className={
                            isDone
                              ? "text-emerald-600"
                              : "text-amber-600"
                          }
                        >
                          {isDone
                            ? "Completed"
                            : "Not Attempted"}
                        </span>
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {questionUrl ? (
                        <a
                          href={questionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="dsa-theme-open-btn"
                        >
                          Open on {platformName} ↗
                        </a>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="dsa-theme-open-btn is-disabled"
                          title="This dataset record does not contain a platform link."
                        >
                          Link unavailable
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          toggleDone(question, index)
                        }
                        className={`dsa-theme-done-btn ${
                          isDone ? "is-completed" : ""
                        }`}
                      >
                        {isDone
                          ? "Mark Pending"
                          : "Mark Done"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {questions.length > 0 && (
          <div className="dsa-theme-bottom-pagination mt-6 flex flex-wrap items-center justify-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <button
              type="button"
              disabled={loading || page <= 1}
              onClick={() => changePage(page - 1)}
              className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-black disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous Page
            </button>

            <span className="text-sm font-black text-slate-700">
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              disabled={loading || page >= totalPages}
              onClick={() => changePage(page + 1)}
              className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next Page
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
