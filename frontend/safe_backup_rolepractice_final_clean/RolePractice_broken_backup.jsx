import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Loader2,
  RotateCcw,
  XCircle
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";

function getArrayFromResponse(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.questions)) return data.questions;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.practiceQuestions)) return data.practiceQuestions;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function normalizeOptions(item) {
  const raw =
    item.options ||
    item.choices ||
    item.answers ||
    item.mcqOptions ||
    [];

  if (!Array.isArray(raw)) return [];

  return raw.map((option) => {
    if (typeof option === "string") return option;
    if (option?.text) return option.text;
    if (option?.label) return option.label;
    if (option?.option) return option.option;
    if (option?.value) return option.value;
    return String(option);
  });
}

function getCorrectAnswer(item) {
  return (
    item.answer ||
    item.correctAnswer ||
    item.correct ||
    item.solution ||
    item.correct_option ||
    item.correctOption ||
    ""
  );
}

function roleMatchesQuestion(item, selectedRole) {
  const roleWords = selectedRole
    .toLowerCase()
    .replace("/", " ")
    .split(" ")
    .filter(Boolean);

  const text = [
    item.role,
    item.roles,
    item.category,
    item.topic,
    item.subject,
    item.type,
    item.difficulty,
    item.question,
    item.title,
    Array.isArray(item.tags) ? item.tags.join(" ") : ""
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (!text.trim()) return true;

  return roleWords.some((word) => text.includes(word));
}

export default function RolePractice() {
  const { role } = useParams();

  const selectedRole = useMemo(() => {
    return decodeURIComponent(role || "Software Developer");
  }, [role]);

  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResult, setShowResult] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cacheKey = `skillyatra_role_practice_${selectedRole}`;

  useEffect(() => {
    let active = true;

    async function loadQuestions() {
      try {
        setLoading(true);
        setError("");

        const cached = sessionStorage.getItem(cacheKey);

        if (cached) {
          const cachedQuestions = JSON.parse(cached);
          if (active) {
            setQuestions(cachedQuestions);
            setLoading(false);
          }
          return;
        }

        const urls = [
          `${API_BASE}/api/practice-questions?role=${encodeURIComponent(selectedRole)}`,
          `${API_BASE}/api/practicequestions?role=${encodeURIComponent(selectedRole)}`,
          `${API_BASE}/api/questions?role=${encodeURIComponent(selectedRole)}`,
          `${API_BASE}/api/practice/questions?role=${encodeURIComponent(selectedRole)}`,
          `${API_BASE}/api/practice-questions`,
          `${API_BASE}/api/practicequestions`,
          `${API_BASE}/api/questions`,
          `${API_BASE}/api/practice/questions`
        ];

        let finalList = [];

        for (const url of urls) {
          try {
            const response = await fetch(url);

            if (!response.ok) {
              continue;
            }

            const data = await response.json();
            const list = getArrayFromResponse(data);

            if (Array.isArray(list) && list.length > 0) {
              finalList = list;
              break;
            }
          } catch {
            continue;
          }
        }

        const roleFiltered = finalList.filter((item) =>
          roleMatchesQuestion(item, selectedRole)
        );

        const usableQuestions = (roleFiltered.length ? roleFiltered : finalList)
          .filter((item) => item.question || item.title)
          .slice(0, 100);

        if (active) {
          setQuestions(usableQuestions);
          sessionStorage.setItem(cacheKey, JSON.stringify(usableQuestions));
        }
      } catch (err) {
        if (active) {
          setError("Questions load nahi ho paaye. Backend running hai ya nahi check karo.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadQuestions();

    return () => {
      active = false;
    };
  }, [selectedRole, cacheKey]);

  const handleAnswer = (questionId, option) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: option
    }));

    setShowResult((prev) => ({
      ...prev,
      [questionId]: true
    }));
  };

  const resetPractice = () => {
    setSelectedAnswers({});
    setShowResult({});
  };

  const reloadQuestions = () => {
    sessionStorage.removeItem(cacheKey);
    window.location.reload();
  };

  return (
    <div className="sy-page-theme min-h-screen bg-[#eef4fb] px-8 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/roadmaps"
          className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Roadmaps
        </Link>

        <button
          type="button"
          onClick={reloadQuestions}
          className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-purple-700 shadow-sm ring-1 ring-purple-100 hover:bg-purple-50"
        >
          <RotateCcw className="h-4 w-4" />
          Reload Questions
        </button>
      </div>

      <section className="rounded-[2rem] bg-gradient-to-r from-fuchsia-700 via-purple-600 to-slate-950 p-8 text-white shadow-xl">
        <p className="text-xs font-black uppercase tracking-[0.35em] text-purple-100">
          Role Based Practice
        </p>

        <h1 className="mt-4 text-4xl font-black leading-tight">
          {selectedRole} MCQ Questions
        </h1>

        <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-purple-100">
          Practice role-wise MCQ questions for placement preparation.
        </p>

        <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white/10 px-5 py-3 text-sm font-black text-white ring-1 ring-white/20">
          <BookOpen className="h-5 w-5" />
          {questions.length} Questions Loaded
        </div>
      </section>

      {loading ? (
        <section className="mt-8 rounded-[2rem] bg-white p-14 text-center shadow-sm ring-1 ring-slate-200">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
            <Loader2 className="h-9 w-9 animate-spin" />
          </div>

          <h2 className="mt-5 text-2xl font-black text-slate-950">
            Loading questions...
          </h2>

          <p className="mt-2 text-sm font-semibold text-slate-500">
            Questions database se load ho rahe hain.
          </p>
        </section>
      ) : error ? (
        <section className="mt-8 rounded-[2rem] bg-white p-10 text-center shadow-sm ring-1 ring-red-100">
          <XCircle className="mx-auto h-12 w-12 text-red-500" />

          <h2 className="mt-4 text-2xl font-black text-red-600">
            Questions load nahi ho paaye
          </h2>

          <p className="mt-2 text-sm font-semibold text-slate-500">
            {error}
          </p>
        </section>
      ) : questions.length === 0 ? (
        <section className="mt-8 rounded-[2rem] bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
          <BookOpen className="mx-auto h-12 w-12 text-purple-600" />

          <h2 className="mt-4 text-2xl font-black text-slate-950">
            No questions found
          </h2>

          <p className="mt-2 text-sm font-semibold text-slate-500">
            Is role ke liye matching MCQ questions nahi mile.
          </p>
        </section>
      ) : (
        <section className="mt-8 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-600">
                Practice Set
              </p>

              <h2 className="mt-2 text-2xl font-black text-slate-950">
                {questions.length} MCQ Questions
              </h2>
            </div>

            <button
              type="button"
              onClick={resetPractice}
              className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-700 hover:bg-slate-200"
            >
              Reset Answers
            </button>
          </div>

          <div className="grid gap-5">
            {questions.map((item, index) => {
              const questionId = item._id || item.id || index;
              const options = normalizeOptions(item);
              const selected = selectedAnswers[questionId];
              const correctAnswer = getCorrectAnswer(item);

              return (
                <article
                  key={questionId}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-black text-purple-700">
                      Q{index + 1}
                    </span>

                    {item.difficulty && (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                        {item.difficulty}
                      </span>
                    )}

                    {item.topic && (
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                        {item.topic}
                      </span>
                    )}

                    {item.category && (
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                        {item.category}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-4 text-lg font-black leading-7 text-slate-950">
                    {item.question || item.title || "Question not available"}
                  </h3>

                  {options.length > 0 ? (
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {options.map((option, optionIndex) => {
                        const isSelected = selected === option;
                        const isCorrect =
                          showResult[questionId] &&
                          correctAnswer &&
                          option === correctAnswer;

                        const isWrong =
                          showResult[questionId] &&
                          isSelected &&
                          correctAnswer &&
                          option !== correctAnswer;

                        return (
                          <button
                            key={`${questionId}-${optionIndex}`}
                            type="button"
                            onClick={() => handleAnswer(questionId, option)}
                            className={`rounded-xl border px-4 py-3 text-left text-sm font-bold transition ${
                              isCorrect
                                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                                : isWrong
                                  ? "border-red-300 bg-red-50 text-red-700"
                                  : isSelected
                                    ? "border-purple-300 bg-purple-50 text-purple-700"
                                    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm font-semibold text-slate-500">
                      Options not available for this question.
                    </p>
                  )}

                  {showResult[questionId] && (
                    <div className="mt-4 rounded-xl bg-slate-50 p-4">
                      <p className="flex items-center gap-2 text-sm font-black text-slate-800">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        Correct Answer: {correctAnswer || "Not available"}
                      </p>

                      {item.explanation && (
                        <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                          {item.explanation}
                        </p>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
