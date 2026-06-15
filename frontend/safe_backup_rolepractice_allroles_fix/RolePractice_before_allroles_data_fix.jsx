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

function getRoleAliases(role) {
  const raw = String(role || "").trim();
  const base = raw
    .replace(/developer/gi, "")
    .replace(/engineer/gi, "")
    .replace(/specialist/gi, "")
    .replace(/consultant/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  const aliases = new Set([
    raw,
    base,
    raw.replace(/\//g, " "),
    raw.replace(/\//g, " & "),
    raw.replace(/&/g, "and"),
    raw.replace(/and/gi, "&"),
    base.replace(/\//g, " "),
    base.replace(/\//g, " & "),
    base.replace(/&/g, "and"),
    base.replace(/and/gi, "&")
  ]);

  const norm = normalize(raw);

  if (norm.includes("ai") || norm.includes("ml") || norm.includes("machine learning")) {
    ["AI", "ML", "AI ML", "AI & ML", "Ai & Ml", "AI/ML", "Machine Learning", "Artificial Intelligence"].forEach((x) => aliases.add(x));
  }

  if (norm.includes("software")) {
    ["Software", "Software Developer", "Developer", "SDE", "Full Stack Developer"].forEach((x) => aliases.add(x));
  }

  if (norm.includes("devops")) {
    ["DevOps", "Devops Engineer", "DevOps Engineer", "Cloud DevOps"].forEach((x) => aliases.add(x));
  }

  if (norm.includes("react")) {
    ["React", "React Engineer", "Frontend", "Frontend Developer"].forEach((x) => aliases.add(x));
  }

  if (norm.includes("sap")) {
    ["SAP", "Sap Engineer", "SAP Engineer"].forEach((x) => aliases.add(x));
  }

  return Array.from(aliases).filter(Boolean);
}

function getQuestionText(item) {
  return item.question || item.title || item.prompt || item.text || "Question not available";
}

function getRoleText(item, fallbackRole) {
  return (
    item.role ||
    item.roleName ||
    item.targetRole ||
    item.category ||
    item.domain ||
    item.track ||
    item.jobRole ||
    fallbackRole ||
    "Practice"
  );
}

function getDifficulty(item) {
  return item.difficulty || item.level || "Easy";
}

function getOptions(item) {
  if (Array.isArray(item.options)) return item.options;

  const options = [];
  ["A", "B", "C", "D"].forEach((key) => {
    if (item[key]) options.push(item[key]);
    if (item[key.toLowerCase()]) options.push(item[key.toLowerCase()]);
  });

  return options;
}

function getAnswer(item) {
  return (
    item.answer ||
    item.correctAnswer ||
    item.correct_option ||
    item.correctOption ||
    item.solution ||
    ""
  );
}

export default function RolePractice() {
  const params = useParams();
  const role = decodeRole(params.role || params.roleName);

  const [questions, setQuestions] = useState([]);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [loading, setLoading] = useState(false);
  const [openAnswers, setOpenAnswers] = useState({});
  const [page, setPage] = useState(1);

  async function loadQuestions() {
    if (!role) return;

    setLoading(true);

    try {
      const aliases = getRoleAliases(role);
      let finalQuestions = [];

      for (const candidate of aliases) {
        try {
          const res = await fetch(
            `${API_BASE}/api/role-practice/${encodeURIComponent(candidate)}?limit=200`
          );

          const data = await res.json();
          const list = Array.isArray(data.questions) ? data.questions : [];

          if (list.length > finalQuestions.length) {
            finalQuestions = list;
          }

          if (list.length >= 25) break;
        } catch {
          // try next alias
        }
      }

      setQuestions(finalQuestions);
      setPage(1);
      setOpenAnswers({});
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
    const selectedRole = normalize(role);
    const keyword = normalize(search);

    return questions.filter((item) => {
      const aliases = getRoleAliases(role).map(normalize);
      const itemRole = normalize(getRoleText(item, role));

      const roleMatched =
        !selectedRole ||
        !itemRole ||
        aliases.some((alias) =>
          itemRole === alias ||
          itemRole.includes(alias) ||
          alias.includes(itemRole)
        );

      const difficultyMatched =
        difficulty === "All" ||
        normalize(getDifficulty(item)) === normalize(difficulty);

      const questionText = normalize(getQuestionText(item));
      const optionText = normalize(getOptions(item).join(" "));
      const searchMatched =
        !keyword || questionText.includes(keyword) || optionText.includes(keyword);

      return roleMatched && difficultyMatched && searchMatched;
    });
  }, [questions, role, search, difficulty]);

  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;

  const paginatedQuestions = filteredQuestions.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  const attempted = Object.keys(openAnswers).length;
  const progress = filteredQuestions.length
    ? Math.round((attempted / filteredQuestions.length) * 100)
    : 0;

  const difficulties = useMemo(() => {
    const values = new Set(["All"]);

    questions.forEach((item) => {
      const level = getDifficulty(item);
      if (level) values.add(level);
    });

    return Array.from(values);
  }, [questions]);

  const toggleAnswer = (index) => {
    const key = `${safePage}-${index}`;

    setOpenAnswers((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="sy-role-practice-theme min-h-screen">
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
              {attempted} attempted · {filteredQuestions.length} role-wise questions
            </span>
          </div>
        </section>

        <section className="rolePracticeFilter">
          <div className="rolePracticeSearchWrap">
            <Search size={24} />
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
            <p>Try another difficulty or search keyword.</p>
          </section>
        ) : (
          <>
            <section className="rolePracticeGrid">
              {paginatedQuestions.map((item, index) => {
                const globalIndex = startIndex + index + 1;
                const answerKey = `${safePage}-${index}`;
                const options = getOptions(item);
                const answer = getAnswer(item);

                return (
                  <article key={item._id || item.id || globalIndex} className="roleQuestionCard">
                    <div className="roleQuestionBadges">
                      <span>Q{globalIndex}</span>
                      <span>{getDifficulty(item)}</span>
                      <span>{getRoleText(item, role)}</span>
                    </div>

                    <h2>{getQuestionText(item)}</h2>

                    <div className="roleOptions">
                      {options.map((option, optionIndex) => (
                        <div key={optionIndex} className="roleOption">
                          <b>{String.fromCharCode(65 + optionIndex)}.</b>
                          <span>{option}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleAnswer(index)}
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
