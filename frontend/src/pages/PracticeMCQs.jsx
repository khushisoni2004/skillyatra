import { useMemo, useState } from "react";
import api from "../lib/api";
import { MCQ_COUNTS, MCQ_GROUPS, MCQ_QUESTIONS } from "../data/generatedMcqs";

const FALLBACK_GROUPS = [
  "All",
  "Quantitative Aptitude",
  "Logical Reasoning",
  "Verbal Ability",
  "Placement / NQT",
  "Programming",
  "Core CS",
  "Python",
  "Data Science",
  "HR / Technical Interview"
];

export default function PracticeMCQs() {
  const groups = MCQ_GROUPS?.length ? MCQ_GROUPS : FALLBACK_GROUPS;
  const counts = MCQ_COUNTS || {};

  const [selectedGroup, setSelectedGroup] = useState("All");
  const [selectedTopic, setSelectedTopic] = useState("All Topics");
  const [search, setSearch] = useState("");
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 25;

  const topicOptions = useMemo(() => {
    let list = Array.isArray(MCQ_QUESTIONS) ? MCQ_QUESTIONS : [];

    if (selectedGroup !== "All") {
      list = list.filter((q) => q.subject === selectedGroup);
    }

    const topics = [
      ...new Set(list.map((q) => String(q.topic || "General")).filter(Boolean))
    ];

    return ["All Topics", ...topics.sort()];
  }, [selectedGroup]);

  const questions = useMemo(() => {
    let list = Array.isArray(MCQ_QUESTIONS) ? MCQ_QUESTIONS : [];

    if (selectedGroup !== "All") {
      list = list.filter((q) => q.subject === selectedGroup);
    }

    if (selectedTopic !== "All Topics") {
      list = list.filter((q) => String(q.topic || "General") === selectedTopic);
    }

    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter((q) =>
        [q.question, q.subject, q.topic, q.difficulty, q.sourceDataset]
          .join(" ")
          .toLowerCase()
          .includes(s)
      );
    }

    return list;
  }, [selectedGroup, selectedTopic, search]);

  const score = useMemo(() => {
    const values = Object.values(checked);
    return {
      attempted: values.length,
      correct: values.filter((x) => x.isCorrect).length
    };
  }, [checked]);

  const totalPages = Math.max(1, Math.ceil(questions.length / pageSize));

  const paginatedQuestions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return questions.slice(start, start + pageSize);
  }, [questions, currentPage]);

  function resetAnswers() {
    setAnswers({});
    setChecked({});
  }

  function changeGroup(group) {
    setSelectedGroup(group);
    setSelectedTopic("All Topics");
    setCurrentPage(1);
    setAnswers({});
    setChecked({});
  }

  function changeTopic(topic) {
    setSelectedTopic(topic);
    setCurrentPage(1);
    setAnswers({});
    setChecked({});
  }

  async function submitAnswer(q) {
    const selected = answers[q.id];
    if (!selected) return;

    const correctAnswer = q.correctAnswer || q.answer;
    const isCorrect =
      String(correctAnswer).toLowerCase() === String(selected).toLowerCase();

    setChecked((prev) => ({
      ...prev,
      [q.id]: {
        selected,
        correctAnswer,
        isCorrect,
        explanation: q.explanation || ""
      }
    }));

    try {
      const sessionId = localStorage.getItem("skillyatra_session_id") || "guest";
      await api.post("/practice-db/attempt", {
        sessionId,
        qid: q.id,
        selectedAnswer: selected
      });
    } catch (error) {
      console.error("Attempt save failed:", error);
    }
  }


  function renderQuestionText(question) {
    const raw = String(question || "");
    const parts = raw.split("\n\n");

    if (parts.length < 2) {
      return <span>{raw}</span>;
    }

    const heading = parts[0];
    const code = parts.slice(1).join("\n\n");

    return (
      <div className="space-y-4">
        <span>{heading}</span>
        <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-sm font-semibold leading-6 text-sky-100 shadow-inner ring-1 ring-slate-800">
          <code>{code}</code>
        </pre>
      </div>
    );
  }

  function refreshAll() {
    setSelectedGroup("All");
    setSelectedTopic("All Topics");
    setSearch("");
    setCurrentPage(1);
    setAnswers({});
    setChecked({});
  }

  return (
    <main className="practiceMcqThemePage min-h-screen bg-gradient-to-br from-slate-100 via-blue-100 to-indigo-100 p-6">
      <div className="practiceMcqThemeShell mx-auto max-w-7xl space-y-6">
        <section className="practiceMcqHero rounded-[34px] bg-gradient-to-r from-sky-500 via-sky-400 to-emerald-400 p-8 text-white shadow-xl shadow-sky-200">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-sky-50">
            Practice MCQs
          </p>

          <h1 className="mt-3 text-4xl font-black">
            Real Dataset MCQ Practice
          </h1>

          <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-sky-50">
            Dataset se loaded real placement MCQs, grouped by subject and topic.
          </p>
        </section>

        <section className="practiceMcqStatsGrid grid gap-4 md:grid-cols-4">
          <div className="rounded-[26px] bg-white p-5 shadow-lg ring-1 ring-slate-200">
            <p className="text-sm font-black text-slate-500">Total MCQs</p>
            <h2 className="mt-2 text-3xl font-black text-slate-900">
              {questions.length}
            </h2>
          </div>

          <div className="rounded-[26px] bg-white p-5 shadow-lg ring-1 ring-slate-200">
            <p className="text-sm font-black text-slate-500">Attempted</p>
            <h2 className="mt-2 text-3xl font-black text-sky-600">
              {score.attempted}
            </h2>
          </div>

          <div className="rounded-[26px] bg-white p-5 shadow-lg ring-1 ring-slate-200">
            <p className="text-sm font-black text-slate-500">Correct</p>
            <h2 className="mt-2 text-3xl font-black text-emerald-600">
              {score.correct}
            </h2>
          </div>

          <div className="rounded-[26px] bg-white p-5 shadow-lg ring-1 ring-slate-200">
            <p className="text-sm font-black text-slate-500">Score</p>
            <h2 className="mt-2 text-3xl font-black text-emerald-600">
              {score.correct}/{score.attempted}
            </h2>
          </div>
        </section>

        <section className="practiceMcqFilterPanel rounded-[30px] bg-white p-5 shadow-xl ring-1 ring-slate-200">
          <div className="grid gap-3 md:grid-cols-[1fr_240px_240px_auto]">
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") setCurrentPage(1);
              }}
              placeholder="Search question, topic, subject..."
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-800 shadow-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
            />

            <select
              value={selectedGroup}
              onChange={(e) => changeGroup(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-800 shadow-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
            >
              {groups.map((group) => (
                <option key={group} value={group}>
                  {group} {counts[group] ? `(${counts[group]})` : ""}
                </option>
              ))}
            </select>

            <select
              value={selectedTopic}
              onChange={(e) => changeTopic(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-800 shadow-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
            >
              {topicOptions.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>

            <button
              onClick={() => setCurrentPage(1)}
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white hover:bg-slate-800"
            >
              Search
            </button>
          </div>

          <div className="practiceMcqTopicChips mt-4 flex flex-wrap gap-2">
            {groups.filter((g) => g !== "All").map((g) => (
              <button
                key={g}
                onClick={() => changeGroup(g)}
                className={`rounded-xl px-4 py-2 text-sm font-black ring-1 ${
                  selectedGroup === g
                    ? "bg-gradient-to-r from-sky-500 via-sky-400 to-emerald-400 text-white ring-sky-300 shadow-lg shadow-sky-100"
                    : "bg-white text-slate-700 ring-slate-200 hover:bg-sky-50"
                }`}
              >
                {g} <span className="ml-1 text-xs opacity-80">{counts[g] || 0}</span>
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={resetAnswers}
              className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-700 shadow ring-1 ring-slate-200 hover:bg-sky-50"
            >
              Reset
            </button>

            <button
              onClick={refreshAll}
              className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-700 shadow ring-1 ring-slate-200 hover:bg-sky-50"
            >
              Refresh
            </button>

            <span className="rounded-2xl bg-sky-50 px-5 py-3 text-sm font-black text-sky-700 ring-1 ring-sky-100">
              Score: {score.correct}/{score.attempted}
            </span>
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm font-black text-slate-700">
            Showing {paginatedQuestions.length} of {questions.length} MCQs
          </p>

          <p className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-700 shadow ring-1 ring-slate-200">
            Page {currentPage} of {totalPages}
          </p>
        </div>

        <section className="practiceMcqQuestionGrid space-y-5">
          {questions.length === 0 && (
            <div className="rounded-[28px] bg-white p-8 text-center text-sm font-black text-slate-500 shadow ring-1 ring-slate-200">
              No MCQs found for this filter.
            </div>
          )}

          {paginatedQuestions.map((q, index) => {
            const result = checked[q.id];
            const selected = result?.selected || answers[q.id];

            return (
              <div
                key={q.id}
                className="practiceMcqQuestionCard rounded-[28px] bg-white p-6 shadow-lg ring-1 ring-slate-200"
              >
                <div className="flex flex-wrap items-start justify-between gap-5">
                  <div className="min-w-0 flex-1">
                    <span className="inline-flex rounded-full bg-gradient-to-r from-sky-500 via-sky-400 to-emerald-400 px-5 py-2 text-sm font-black text-white shadow-lg shadow-sky-100">
                      {q.subject}
                    </span>

                    <p className="mt-4 text-xs font-black uppercase tracking-wide text-slate-400">
                      Question {(currentPage - 1) * pageSize + index + 1}
                    </p>

                    <h3 className="mt-2 text-2xl font-black text-slate-950">
                      {renderQuestionText(q.question)}
                    </h3>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-black text-sky-700 ring-1 ring-sky-100">
                        {q.topic || "General"}
                      </span>

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">
                        Dataset
                      </span>

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">
                        {result ? "Attempted" : "Not Attempted"}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                      {(q.options || []).map((option) => {
                        const isSelected = selected === option.key;
                        const isCorrect = result?.correctAnswer === option.key;
                        const isWrongSelected = result && isSelected && !result.isCorrect;

                        return (
                          <button
                            key={option.key}
                            disabled={Boolean(result)}
                            onClick={() => {
                              if (!result) {
                                setAnswers((prev) => ({
                                  ...prev,
                                  [q.id]: option.key
                                }));
                              }
                            }}
                            className={`rounded-2xl border p-4 text-left text-sm font-black transition ${
                              isCorrect
                                ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                                : isWrongSelected
                                  ? "border-rose-400 bg-rose-50 text-rose-800"
                                  : isSelected
                                    ? "border-sky-400 bg-sky-50 text-sky-800"
                                    : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-sky-50"
                            }`}
                          >
                            <span className="mr-2 font-black">{option.key}.</span>
                            {option.text}
                          </button>
                        );
                      })}
                    </div>

                    {result && (
                      <div
                        className={`mt-4 rounded-2xl p-4 text-sm font-black ring-1 ${
                          result.isCorrect
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                            : "bg-rose-50 text-rose-700 ring-rose-100"
                        }`}
                      >
                        {result.isCorrect
                          ? "Correct"
                          : `Wrong. Correct answer: ${result.correctAnswer}`}
                        {result.explanation && <p className="mt-2">{result.explanation}</p>}
                      </div>
                    )}
                  </div>

                  <div className="flex min-w-[170px] flex-col gap-3">
                    <button
                      type="button"
                      disabled={!answers[q.id] || Boolean(result)}
                      onClick={() => submitAnswer(q)}
                      className="rounded-2xl bg-gradient-to-r from-sky-500 via-sky-400 to-emerald-400 px-5 py-3 text-center text-sm font-black text-white shadow-lg shadow-sky-100 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Submit Answer
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {totalPages > 1 && (
          <div className="practiceMcqPagination flex flex-wrap items-center justify-between gap-4 rounded-[24px] bg-white p-4 shadow ring-1 ring-slate-200">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-700 ring-1 ring-slate-200 hover:bg-sky-50 disabled:opacity-40"
            >
              Previous Page
            </button>

            <span className="rounded-2xl bg-slate-50 px-5 py-3 text-sm font-black text-slate-700 ring-1 ring-slate-200">
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
      </div>
    </main>
  );
}
