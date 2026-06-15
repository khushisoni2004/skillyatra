import { useEffect, useMemo, useState } from "react";
import api from "../lib/api";

const SUBJECTS = [
  "All",
  "Quantitative Aptitude",
  "Logical Reasoning",
  "Verbal Ability",
  "Placement / NQT",
  "Programming",
  "React",
  "Backend",
  "Core CS"
];

function Badge({ children, tone = "slate" }) {
  const styles = {
    slate: "bg-slate-50 text-slate-700 ring-slate-200",
    indigo: "bg-indigo-50 text-indigo-700 ring-indigo-100",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    rose: "bg-rose-50 text-rose-700 ring-rose-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100"
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${styles[tone]}`}>
      {children}
    </span>
  );
}

export default function PracticeMCQs() {
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState({});
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const attempted = Object.keys(answers).length;
  const total = questions.length;

  async function loadQuestions(subject = selectedSubject) {
    try {
      setLoading(true);
      setError("");
      setResult(null);
      setAnswers({});

      const params = new URLSearchParams({
        subject: subject === "All" ? "all" : subject,
        limit: "50"
      });

      const res = await api.get(`/practice/questions?${params.toString()}`);

      if (!res.data?.ok) {
        setError(res.data?.message || "MCQs not loaded from dataset.");
        setQuestions([]);
        return;
      }

      setQuestions(res.data.questions || []);
      setSubjects(res.data.subjects || {});
    } catch {
      setError("Practice MCQs not loaded. Check backend.");
    } finally {
      setLoading(false);
    }
  }

  async function submitTest() {
    try {
      setError("");

      if (!questions.length) {
        setError("No MCQs loaded.");
        return;
      }

      if (attempted < questions.length) {
        setError(`Attempt all questions first. Attempted ${attempted}/${questions.length}.`);
        return;
      }

      const payload = questions.map((q) => ({
        id: q.id,
        selected: answers[q.id]
      }));

      const res = await api.post("/practice/submit", { answers: payload });

      if (!res.data?.ok) {
        setError("Could not submit test.");
        return;
      }

      setResult(res.data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Submit failed. Check backend.");
    }
  }

  useEffect(() => {
    loadQuestions("All");
  }, []);

  const resultMap = useMemo(() => {
    const map = {};
    for (const item of result?.results || []) map[item.id] = item;
    return map;
  }, [result]);

  const accuracy = result ? result.score : 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-white p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[34px] bg-gradient-to-r from-indigo-700 via-violet-700 to-slate-950 p-8 text-white shadow-xl shadow-indigo-200">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-indigo-200">
            Practice MCQs
          </p>
          <h1 className="mt-3 text-4xl font-black">Real Dataset MCQ Practice</h1>
          <p className="mt-3 max-w-3xl text-sm font-semibold text-indigo-100">
            Select answers first. Correct answer is hidden until final submit.
          </p>
        </section>

        {error && (
          <div className="rounded-2xl bg-rose-50 p-4 text-sm font-black text-rose-700 ring-1 ring-rose-100">
            {error}
          </div>
        )}

        {result && (
          <section className="rounded-[30px] bg-white p-6 shadow-lg shadow-indigo-50 ring-1 ring-indigo-100">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Final Score</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  You scored {result.correct}/{result.total}.
                </p>
              </div>

              <div className={`rounded-[24px] p-5 text-center ${
                result.score >= 70 ? "bg-emerald-50 text-emerald-700" : result.score >= 40 ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"
              }`}>
                <p className="text-xs font-black uppercase tracking-[0.2em]">Score</p>
                <h3 className="mt-1 text-4xl font-black">{result.score}%</h3>
              </div>
            </div>
          </section>
        )}

        <section className="grid gap-4 md:grid-cols-5">
          {[
            ["Total", total],
            ["Attempted", attempted],
            ["Correct", result?.correct ?? "-"],
            ["Wrong", result?.wrong ?? "-"],
            ["Accuracy", result ? `${accuracy}%` : "-"]
          ].map(([label, value]) => (
            <div key={label} className="rounded-[24px] bg-white p-5 shadow-lg shadow-indigo-50 ring-1 ring-indigo-100">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{label}</p>
              <h3 className="mt-2 text-3xl font-black text-slate-900">{value}</h3>
            </div>
          ))}
        </section>

        <section className="rounded-[30px] bg-white p-5 shadow-lg shadow-indigo-50 ring-1 ring-indigo-100">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.map((subject) => (
                <button
                  key={subject}
                  onClick={() => {
                    setSelectedSubject(subject);
                    loadQuestions(subject);
                  }}
                  className={`rounded-2xl px-4 py-2 text-sm font-black ring-1 ${
                    selectedSubject === subject
                      ? "bg-indigo-600 text-white ring-indigo-600"
                      : "bg-slate-50 text-slate-700 ring-slate-200 hover:bg-indigo-50"
                  }`}
                >
                  {subject} {subjects[subject] ? `(${subjects[subject]})` : ""}
                </button>
              ))}
            </div>

            <button
              onClick={() => loadQuestions(selectedSubject)}
              className="rounded-2xl bg-slate-900 px-5 py-2 text-sm font-black text-white hover:bg-slate-800"
            >
              Refresh Set
            </button>
          </div>
        </section>

        <section className="rounded-[30px] bg-white p-6 shadow-lg shadow-indigo-50 ring-1 ring-indigo-100">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">Practice Set</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                {loading ? "Loading..." : `${questions.length} unique MCQs`}
              </p>
            </div>

            <button
              onClick={submitTest}
              disabled={loading || !questions.length || !!result}
              className="rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-black text-white hover:bg-emerald-700 disabled:bg-slate-300"
            >
              Submit Test
            </button>
          </div>

          <div className="mt-6 space-y-5">
            {questions.map((q, index) => {
              const submitted = !!result;
              const r = resultMap[q.id];

              return (
                <div
                  key={q.id}
                  className="rounded-[26px] border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="indigo">Q{index + 1}</Badge>
                    <Badge>{q.subject}</Badge>
                    <Badge tone="amber">{q.topic}</Badge>
                    <Badge>{q.difficulty}</Badge>
                    <Badge>{q.sourceDataset ? "Dataset" : "Generated"}</Badge>
                  </div>

                  <h3 className="mt-4 text-lg font-black text-slate-900">{q.question}</h3>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {(q.options || []).map((option) => {
                      const selected = answers[q.id] === option.key;
                      const isCorrectOption = submitted && r?.correctAnswer === option.key;
                      const isWrongSelected = submitted && selected && !r?.isCorrect;

                      return (
                        <button
                          key={option.key}
                          disabled={submitted}
                          onClick={() => {
                            if (submitted) return;
                            setAnswers((prev) => ({ ...prev, [q.id]: option.key }));
                          }}
                          className={`rounded-2xl border p-4 text-left text-sm font-bold transition ${
                            isCorrectOption
                              ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                              : isWrongSelected
                                ? "border-rose-300 bg-rose-50 text-rose-800"
                                : selected
                                  ? "border-indigo-500 bg-indigo-50 text-indigo-800"
                                  : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300"
                          }`}
                        >
                          <span className="mr-2 font-black">{option.key}.</span>
                          {option.text}
                        </button>
                      );
                    })}
                  </div>

                  {submitted && r && (
                    <div className={`mt-4 rounded-2xl p-4 text-sm font-bold ring-1 ${
                      r.isCorrect
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                        : "bg-rose-50 text-rose-700 ring-rose-100"
                    }`}>
                      {r.isCorrect ? "Correct" : `Wrong. Correct answer: ${r.correctAnswer}`}
                      {r.explanation && <p className="mt-2">{r.explanation}</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
