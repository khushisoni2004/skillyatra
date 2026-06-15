import { useEffect, useMemo, useState } from "react";
import api from "../lib/api";

function normalizeOptions(options = []) {
  const keys = ["A", "B", "C", "D"];

  return options.map((option, index) => {
    if (typeof option === "string") return { key: keys[index], text: option };
    return {
      key: option.key || keys[index],
      text: option.text || option.value || option.label || ""
    };
  });
}

export default function PracticeMCQs() {
  const [groups, setGroups] = useState(["All"]);
  const [counts, setCounts] = useState({});
  const [selectedGroup, setSelectedGroup] = useState("All");
  const [search, setSearch] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answered, setAnswered] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pageSize = 25;

  async function loadQuestions(group = selectedGroup, searchText = search) {
    try {
      setLoading(true);
      setError("");
      setAnswered({});
      setCurrentPage(1);

      const params = new URLSearchParams({
        group,
        search: searchText || ""
      });

      const res = await api.get(`/practice/questions?${params.toString()}`);

      if (!res.data?.ok) {
        setError(res.data?.message || "MCQs not loaded.");
        setQuestions([]);
        return;
      }

      setGroups(res.data.groups || ["All"]);
      setCounts(res.data.counts || {});
      setQuestions(
        (res.data.questions || []).map((q) => ({
          ...q,
          options: normalizeOptions(q.options || [])
        }))
      );
    } catch {
      setError("Practice MCQs not loaded. Check backend.");
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }

  async function chooseAnswer(questionId, optionKey) {
    if (answered[questionId]) return;

    try {
      const res = await api.post("/practice/answer", {
        id: questionId,
        selected: optionKey
      });

      if (!res.data?.ok) return;

      setAnswered((prev) => ({
        ...prev,
        [questionId]: res.data
      }));
    } catch {
      setError("Answer check failed. Check backend.");
    }
  }

  useEffect(() => {
    loadQuestions("All", "");
  }, []);

  const score = useMemo(() => {
    const values = Object.values(answered);
    return {
      attempted: values.length,
      correct: values.filter((x) => x.isCorrect).length
    };
  }, [answered]);

  const totalPages = Math.max(1, Math.ceil(questions.length / pageSize));

  const paginatedQuestions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return questions.slice(start, start + pageSize);
  }, [questions, currentPage]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-white p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[34px] bg-gradient-to-r from-indigo-700 via-violet-700 to-slate-950 p-8 text-white shadow-xl shadow-indigo-200">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-indigo-200">
            Practice MCQs
          </p>
          <h1 className="mt-3 text-4xl font-black">Real Dataset MCQ Practice</h1>
          <p className="mt-3 text-sm font-semibold text-indigo-100">
            Select group, search questions, and answer instantly. Correct option becomes green, wrong option becomes red.
          </p>
        </section>

        {error && (
          <div className="rounded-2xl bg-rose-50 p-4 text-sm font-black text-rose-700 ring-1 ring-rose-100">
            {error}
          </div>
        )}

        <section className="rounded-[30px] bg-white p-5 shadow-lg shadow-indigo-50 ring-1 ring-indigo-100">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search question or topic..."
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-800 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />

            <select
              value={selectedGroup}
              onChange={(e) => {
                setSelectedGroup(e.target.value);
                loadQuestions(e.target.value, search);
              }}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-800 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            >
              {groups.map((group) => (
                <option key={group} value={group}>
                  {group} {counts[group] ? `(${counts[group]})` : ""}
                </option>
              ))}
            </select>

            <button
              onClick={() => loadQuestions(selectedGroup, search)}
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white hover:bg-slate-800"
            >
              Search
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setAnswered({});
                setError("");
              }}
              className="rounded-2xl bg-slate-100 px-5 py-2 text-sm font-black text-slate-700"
            >
              Reset
            </button>

            <button
              onClick={() => loadQuestions(selectedGroup, search)}
              className="rounded-2xl bg-indigo-600 px-5 py-2 text-sm font-black text-white"
            >
              Refresh Set
            </button>

            <span className="rounded-2xl bg-emerald-50 px-5 py-2 text-sm font-black text-emerald-700 ring-1 ring-emerald-100">
              Score: {score.correct}/{score.attempted}
            </span>
          </div>
        </section>

        <section className="rounded-[30px] bg-white p-6 shadow-lg shadow-indigo-50 ring-1 ring-indigo-100">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">Practice Set</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                {loading ? "Loading..." : `${questions.length} MCQs • Page ${currentPage}/${totalPages}`}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            {!loading && questions.length === 0 && (
              <div className="rounded-2xl bg-slate-50 p-6 text-center text-sm font-bold text-slate-500 ring-1 ring-slate-200">
                No MCQs loaded. Try All or another dropdown option.
              </div>
            )}

            {paginatedQuestions.map((q, index) => {
              const checked = answered[q.id];

              return (
                <div key={q.id} className="rounded-[26px] border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700 ring-1 ring-indigo-100">
                      Q{(currentPage - 1) * pageSize + index + 1}
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-700 ring-1 ring-slate-200">
                      {q.subject}
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-black text-slate-900">{q.question}</h3>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {(q.options || []).map((option) => {
                      const isSelected = checked?.selected === option.key;
                      const isCorrect = checked?.correctAnswer === option.key;
                      const isWrongSelected = checked && isSelected && !checked.isCorrect;

                      return (
                        <button
                          key={option.key}
                          disabled={Boolean(checked)}
                          onClick={() => chooseAnswer(q.id, option.key)}
                          className={`rounded-2xl border p-4 text-left text-sm font-bold transition ${
                            isCorrect
                              ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                              : isWrongSelected
                                ? "border-rose-400 bg-rose-50 text-rose-800"
                                : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50"
                          }`}
                        >
                          <span className="mr-2 font-black">{option.key}.</span>
                          {option.text}
                        </button>
                      );
                    })}
                  </div>

                  {checked && (
                    <div
                      className={`mt-4 rounded-2xl p-4 text-sm font-black ring-1 ${
                        checked.isCorrect
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                          : "bg-rose-50 text-rose-700 ring-rose-100"
                      }`}
                    >
                      {checked.isCorrect ? "Correct" : `Wrong. Correct answer: ${checked.correctAnswer}`}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {questions.length > pageSize && (
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-[24px] bg-slate-50 p-4 ring-1 ring-slate-200">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-700 ring-1 ring-slate-200 hover:bg-indigo-50 disabled:opacity-40"
              >
                Previous Page
              </button>

              <span className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-700 ring-1 ring-slate-200">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
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
