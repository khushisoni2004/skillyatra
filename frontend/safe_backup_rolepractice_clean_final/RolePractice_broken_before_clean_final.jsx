import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, RefreshCw, Search, Sparkles } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";
const PAGE_SIZE = 25;

function decodeRole(value) {
  try {
    return decodeURIComponent(value || "").trim();
  } catch {
    return String(value || "").trim();
  }
}

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/%20/g, " ")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractQuestions(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.questions)) return payload.questions;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
}

function getQuestionText(item) {
  return item?.question || item?.title || item?.prompt || item?.text || "Question not available";
}

function getRoleText(item, fallbackRole) {
  return (
    item?.role ||
    item?.roleName ||
    item?.targetRole ||
    item?.category ||
    item?.domain ||
    item?.track ||
    item?.jobRole ||
    fallbackRole ||
    "Practice"
  );
}

function getDifficulty(item) {
  return item?.difficulty || item?.level || "Easy";
}

function getOptions(item) {
  if (Array.isArray(item?.options)) return item.options;

  const options = [];
  ["A", "B", "C", "D"].forEach((key) => {
    if (item?.[key]) options.push(item[key]);
    if (item?.[key.toLowerCase()]) options.push(item[key.toLowerCase()]);
  });

  return options;
}

function getAnswer(item) {
  return (
    item?.answer ||
    item?.correctAnswer ||
    item?.correct_option ||
    item?.correctOption ||
    item?.solution ||
    ""
  );
}

function getRoleAliases(role) {
  const raw = String(role || "").trim();
  const clean = raw.replace(/developer|engineer|specialist|consultant/gi, "").trim();

  const aliases = new Set([
    raw,
    clean,
    raw.replace(/\//g, " "),
    raw.replace(/\//g, " & "),
    raw.replace(/&/g, "and"),
    raw.replace(/and/gi, "&"),
    clean.replace(/\//g, " "),
    clean.replace(/\//g, " & ")
  ]);

  const n = normalize(raw);

  if (n.includes("frontend")) {
    ["Frontend", "Frontend Developer", "React", "React Engineer", "JavaScript"].forEach((x) => aliases.add(x));
  }

  if (n.includes("software")) {
    ["Software", "Software Developer", "SDE", "Developer", "Full Stack"].forEach((x) => aliases.add(x));
  }

  if (n.includes("backend")) {
    ["Backend", "Backend Developer", "Node", "Node.js", "API"].forEach((x) => aliases.add(x));
  }

  if (n.includes("mern")) {
    ["MERN", "MERN Stack", "Full Stack", "React", "Node"].forEach((x) => aliases.add(x));
  }

  if (n.includes("ai") || n.includes("ml") || n.includes("machine")) {
    ["AI", "ML", "AI ML", "AI & ML", "Ai & Ml", "AI/ML", "Machine Learning", "Artificial Intelligence"].forEach((x) => aliases.add(x));
  }

  if (n.includes("python")) {
    ["Python", "Python Developer", "AI & ML", "Backend"].forEach((x) => aliases.add(x));
  }

  if (n.includes("data")) {
    ["Data Science", "Data Scientist", "Machine Learning", "AI & ML"].forEach((x) => aliases.add(x));
  }

  if (n.includes("devops")) {
    ["DevOps", "Devops Engineer", "DevOps Engineer", "Cloud"].forEach((x) => aliases.add(x));
  }

  if (n.includes("sap")) {
    ["SAP", "Sap Engineer", "SAP Engineer"].forEach((x) => aliases.add(x));
  }

  return Array.from(aliases).filter(Boolean);
}

function isCorrectOption(option, optionIndex, answer) {
  const letter = String.fromCharCode(65 + optionIndex);
  const optionText = normalize(option);
  const answerText = String(answer || "").trim();
  const answerNorm = normalize(answerText);

  return (
    answerText.toUpperCase() === letter ||
    answerText.toUpperCase().startsWith(letter + ".") ||
    answerText.toUpperCase().startsWith(letter + ")") ||
    optionText === answerNorm ||
    answerNorm.includes(optionText) ||
    optionText.includes(answerNorm)
  );
}

export default function RolePractice() {
  const params = useParams();
  const role = decodeRole(params.role || params.roleName || "");

  const [questions, setQuestions] = useState([]);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [loading, setLoading] = useState(false);
  const [openAnswers, setOpenAnswers] = useState({});
  const [selectedOptions, setSelectedOptions] = useState({});
  const [page, setPage] = useState(1);

  async function fetchList(url) {
    try {
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      return extractQuestions(data);
    } catch {
      return [];
    }
  }

  async function loadQuestions() {
    setLoading(true);

    try {
      const aliases = getRoleAliases(role);
      const urls = [];

      aliases.forEach((candidate) => {
        const encoded = encodeURIComponent(candidate);
        urls.push(`${API_BASE}/api/role-practice/${encoded}?limit=200`);
        urls.push(`${API_BASE}/api/practice/questions?role=${encoded}&limit=200`);
        urls.push(`${API_BASE}/api/practice/questions?group=${encoded}&limit=200`);
        urls.push(`${API_BASE}/api/practice/questions?category=${encoded}&limit=200`);
      });

      urls.push(`${API_BASE}/api/practice/questions?limit=200`);
      urls.push(`${API_BASE}/api/practice/questions`);
      urls.push(`${API_BASE}/api/questions?limit=200`);
      urls.push(`${API_BASE}/api/mcqs?limit=200`);

      let best = [];

      for (const url of urls) {
        const list = await fetchList(url);
        if (list.length > best.length) best = list;
        if (list.length >= 25) break;
      }

      setQuestions(best);
      setPage(1);
      setOpenAnswers({});
      setSelectedOptions({});
    } catch (error) {
      console.error("Role practice loading failed:", error);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQuestions();
  }, [role]);

  const filteredQuestions = useMemo(() => {
    const keyword = normalize(search);
    const aliases = getRoleAliases(role).map(normalize);

    const baseFiltered = questions.filter((item) => {
      const difficultyMatched =
        difficulty === "All" || normalize(getDifficulty(item)) === normalize(difficulty);

      const q = normalize(getQuestionText(item));
      const o = normalize(getOptions(item).join(" "));

      const searchMatched = !keyword || q.includes(keyword) || o.includes(keyword);

      return difficultyMatched && searchMatched;
    });

    const roleFiltered = baseFiltered.filter((item) => {
      const itemRole = normalize(getRoleText(item, role));

      return (
        !itemRole ||
        aliases.some((alias) => itemRole === alias || itemRole.includes(alias) || alias.includes(itemRole))
      );
    });

    return roleFiltered.length ? roleFiltered : baseFiltered;
  }, [questions, role, search, difficulty]);

  const difficulties = useMemo(() => {
    const set = new Set(["All"]);
    questions.forEach((item) => set.add(getDifficulty(item)));
    return Array.from(set);
  }, [questions]);

  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const paginatedQuestions = filteredQuestions.slice(startIndex, startIndex + PAGE_SIZE);

  const attempted = Object.keys(selectedOptions).length;
  const progress = filteredQuestions.length ? Math.round((attempted / filteredQuestions.length) * 100) : 0;

  function toggleAnswer(key) {
    setOpenAnswers((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  }

  function pickOption(key, optionIndex) {
    setSelectedOptions((prev) => ({
      ...prev,
      [key]: optionIndex
    }));
  }

  return (
    <div className="rolePracticePage">
      <main className="rolePracticeShell">
        <section className="rolePracticeHero">
          <div>
            <Link to="/roadmaps" className="rolePracticeBack">
              <ArrowLeft size={18} />
              Back to Roadmaps
            </Link>

            <div className="rolePracticeTag">
              <Sparkles size={15} />
              Role Based MCQ Practice
            </div>

            <h1>{role || "Role"} Practice Questions</h1>

            <p>
              {filteredQuestions.length} placement-focused MCQs loaded from your backend dataset/MongoDB for this selected role.
            </p>
          </div>

          <div className="rolePracticeAnalysis">
            <p>Analysis</p>
            <h2>{progress}%</h2>
            <span>
              {attempted} attempted · {filteredQuestions.length} questions
            </span>
          </div>
        </section>

        <section className="rolePracticeFilter">
          <div className="rolePracticeSearchWrap">
            <Search size={23} />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search question/topic..."
            />
          </div>

          <select
            value={difficulty}
            onChange={(event) => {
              setDifficulty(event.target.value);
              setPage(1);
            }}
          >
            {difficulties.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>

          <button type="button" onClick={loadQuestions} className="rolePracticeRefresh">
            <RefreshCw size={19} />
            Refresh
          </button>
        </section>

        {loading ? (
          <section className="rolePracticeEmpty">
            <h2>Loading questions...</h2>
            <p>Please wait while questions are fetched.</p>
          </section>
        ) : filteredQuestions.length === 0 ? (
          <section className="rolePracticeEmpty">
            <h2>No questions found</h2>
            <p>Start backend on port 5001 or check your question dataset.</p>
          </section>
        ) : (
          <>
            <section className="rolePracticeGrid">
              {paginatedQuestions.map((item, index) => {
                const globalIndex = startIndex + index + 1;
                const answerKey = `${safePage}-${index}`;
                const options = getOptions(item);
                const answer = getAnswer(item);
                const selectedIndex = selectedOptions[answerKey];
                const answered = selectedIndex !== undefined;

                return (
                  <article key={item._id || item.id || globalIndex} className="roleQuestionCard">
                    <div className="roleQuestionBadges">
                      <span>Q{globalIndex}</span>
                      <span>{getDifficulty(item)}</span>
                      <span>{getRoleText(item, role)}</span>
                    </div>

                    <h2>{getQuestionText(item)}</h2>

                    <div className="roleOptions">
                      {options.map((option, optionIndex) => {
                        const correct = isCorrectOption(option, optionIndex, answer);
                        const selected = selectedIndex === optionIndex;

                        let cls = "roleOption";
                        if (answered && correct) cls += " optionCorrect";
                        if (answered && selected && !correct) cls += " optionWrong";

                        return (
                          <button
                            key={optionIndex}
                            type="button"
                            onClick={() => pickOption(answerKey, optionIndex)}
                            className={cls}
                          >
                            <b>{String.fromCharCode(65 + optionIndex)}.</b>
                            <span>{option}</span>
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleAnswer(answerKey)}
                      className="practiceSubmitAnswerBtn"
                    >
                      Show Answer
                    </button>

                    {openAnswers[answerKey] && (
                      <div className="roleAnswerBox">
                        <CheckCircle2 size={18} />
                        <span>{answer || "Answer not available"}</span>
                      </div>
                    )}
                  </article>
                );
              })}
            </section>

            {filteredQuestions.length > PAGE_SIZE && (
              <section className="rolePracticePagination">
                <button
                  type="button"
                  disabled={safePage === 1}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                >
                  ← Previous
                </button>

                <div>
                  <strong>Page {safePage} of {totalPages}</strong>
                  <span>
                    Showing {startIndex + 1}-{Math.min(startIndex + PAGE_SIZE, filteredQuestions.length)} of {filteredQuestions.length}
                  </span>
                </div>

                <button
                  type="button"
                  disabled={safePage === totalPages}
                  onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                >
                  Next →
                </button>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
