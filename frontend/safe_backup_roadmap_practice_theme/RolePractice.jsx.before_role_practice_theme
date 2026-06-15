import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Brain,
  CheckCircle2,
  Loader2,
  RotateCcw,
  Search,
  XCircle
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";

function decodeRole(value) {
  try {
    return decodeURIComponent(value || "Software Developer");
  } catch {
    return "Software Developer";
  }
}

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/^option\s*/i, "")
    .replace(/^answer\s*[:\-]?\s*/i, "")
    .replace(/^[a-d1-4][\).\-\s]+/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isCorrectOption(option, answer, index) {
  const o = normalize(option);
  const a = normalize(answer);

  const letters = ["a", "b", "c", "d"];
  const nums = ["1", "2", "3", "4"];

  if (!a) return false;
  if (a === letters[index] || a === nums[index]) return true;
  if (o === a) return true;
  if (o.includes(a) && a.length > 2) return true;
  if (a.includes(o) && o.length > 2) return true;

  return false;
}

export default function RolePractice() {
  const params = useParams();
  const role = decodeRole(params.role);

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [showAnswer, setShowAnswer] = useState({});
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [loading, setLoading] = useState(true);

  const loadQuestions = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/api/role-practice/${encodeURIComponent(role)}?limit=50`);
      const data = await res.json();

      if (data.ok) {
        setQuestions(Array.isArray(data.questions) ? data.questions : []);
      } else {
        setQuestions([]);
      }
    } catch {
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [role]);

  const filteredQuestions = useMemo(() => {
    const q = search.trim().toLowerCase();

    return questions.filter((item) => {
      const matchSearch =
        !q ||
        String(item.question || "").toLowerCase().includes(q) ||
        String(item.category || "").toLowerCase().includes(q);

      const matchDifficulty =
        difficulty === "All" ||
        String(item.difficulty || "").toLowerCase() === difficulty.toLowerCase();

      return matchSearch && matchDifficulty;
    });
  }, [questions, search, difficulty]);

  const attempted = Object.keys(answers).length;
  const correctCount = questions.filter((item) => {
    const selected = answers[item.id];
    if (!selected) return false;
    return item.options?.some((option, index) => selected === option && isCorrectOption(option, item.answer, index));
  }).length;

  const progress = questions.length ? Math.round((attempted / questions.length) * 100) : 0;

  const selectOption = (questionId, option) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: option
    }));

    setShowAnswer((prev) => ({
      ...prev,
      [questionId]: true
    }));
  };

  return (
    <div className="min-h-screen bg-[#eef4fb] px-8 py-8">
      <section className="rounded-[2rem] bg-gradient-to-r from-indigo-700 via-blue-600 to-slate-950 p-8 text-white shadow-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link
              to="/roadmaps"
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-black text-white ring-1 ring-white/20 hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Roadmaps
            </Link>

            <p className="mt-6 text-xs font-black uppercase tracking-[0.35em] text-indigo-100">
              Role Based MCQ Practice
            </p>

            <h1 className="mt-4 text-4xl font-black leading-tight">
              {role} Practice Questions
            </h1>

            <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-indigo-100">
              50 placement-focused MCQs loaded from your backend dataset/MongoDB for this selected role.
            </p>
          </div>

          <div className="rounded-[1.6rem] bg-white/10 p-6 ring-1 ring-white/20">
            <h2 className="text-5xl font-black">{progress}%</h2>
            <p className="mt-1 text-sm font-black text-indigo-100">
              {attempted} of {questions.length} attempted
            </p>
            <p className="mt-2 text-xs font-black text-emerald-100">
              Correct: {correctCount}
            </p>
          </div>
        </div>

        <div className="mt-7 h-3 rounded-full bg-white/20">
          <div
            className="h-3 rounded-full bg-white transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </section>

      <section className="mt-8 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="grid gap-4 lg:grid-cols-[1fr_220px_150px]">
          <div className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-50">
            <Search className="h-5 w-5 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search question/topic..."
              className="h-full flex-1 border-none bg-transparent text-sm font-bold text-slate-900 outline-none"
            />
          </div>

          <select
            value={difficulty}
            onChange={(event) => setDifficulty(event.target.value)}
            className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
          >
            <option>All</option>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>

          <button
            type="button"
            onClick={loadQuestions}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-black text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700"
          >
            <RotateCcw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </section>

      <section className="mt-8">
        {loading ? (
          <div className="rounded-[2rem] bg-white p-12 text-center shadow-sm ring-1 ring-slate-200">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-indigo-600" />
            <h2 className="mt-4 text-xl font-black text-slate-950">
              Loading role-wise MCQs...
            </h2>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="rounded-[2rem] bg-white p-12 text-center shadow-sm ring-1 ring-slate-200">
            <Brain className="mx-auto h-12 w-12 text-slate-400" />
            <h2 className="mt-4 text-xl font-black text-slate-950">
              No role MCQs found
            </h2>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              Import datasets first or check backend API.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {filteredQuestions.map((item, index) => {
              const selected = answers[item.id];
              const reveal = showAnswer[item.id];
              const options = Array.isArray(item.options) ? item.options : [];

              return (
                <article
                  key={`${item.id}-${index}`}
                  className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700">
                      Q{index + 1}
                    </span>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                      {item.difficulty || "Medium"}
                    </span>

                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                      {item.category || role}
                    </span>
                  </div>

                  <h3 className="mt-4 text-base font-black leading-7 text-slate-950">
                    {item.question}
                  </h3>

                  <div className="mt-5 space-y-3">
                    {options.map((option, optionIndex) => {
                      const isSelected = selected === option;
                      const isCorrect = isCorrectOption(option, item.answer, optionIndex);
                      const isWrongSelected = isSelected && !isCorrect;

                      let className =
                        "w-full rounded-xl border px-4 py-3 text-left text-sm font-bold transition";

                      if (reveal && isCorrect) {
                        className += " border-emerald-600 bg-emerald-50 text-emerald-700";
                      } else if (isWrongSelected) {
                        className += " border-red-600 bg-red-50 text-red-700";
                      } else if (isSelected) {
                        className += " border-indigo-600 bg-indigo-50 text-indigo-700";
                      } else {
                        className += " border-slate-200 bg-white text-slate-700 hover:bg-slate-50";
                      }

                      return (
                        <button
                          key={`${item.id}-${optionIndex}`}
                          type="button"
                          onClick={() => selectOption(item.id, option)}
                          className={className}
                        >
                          <span className="mr-2 font-black">
                            {String.fromCharCode(65 + optionIndex)}.
                          </span>
                          {option}

                          {reveal && isCorrect && (
                            <span className="ml-3 inline-flex items-center gap-1 text-xs font-black text-emerald-700">
                              <CheckCircle2 className="h-4 w-4" />
                              Right Answer
                            </span>
                          )}

                          {isWrongSelected && (
                            <span className="ml-3 inline-flex items-center gap-1 text-xs font-black text-red-700">
                              <XCircle className="h-4 w-4" />
                              Wrong
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setShowAnswer((prev) => ({
                          ...prev,
                          [item.id]: !prev[item.id]
                        }))
                      }
                      className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-black text-white hover:bg-indigo-700"
                    >
                      {reveal ? "Hide Answer" : "Show Answer"}
                    </button>

                    {selected && (
                      <span
                        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-black ${
                          options.some((option, optionIndex) => selected === option && isCorrectOption(option, item.answer, optionIndex))
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {options.some((option, optionIndex) => selected === option && isCorrectOption(option, item.answer, optionIndex)) ? (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            Correct
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4" />
                            Incorrect
                          </>
                        )}
                      </span>
                    )}
                  </div>

                  {reveal && (
                    <div className="mt-5 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                      <p className="text-sm font-black text-slate-700">Correct Answer</p>
                      <p className="mt-2 text-sm font-semibold leading-6 text-emerald-700">
                        {item.answer || "Answer not available in dataset."}
                      </p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
