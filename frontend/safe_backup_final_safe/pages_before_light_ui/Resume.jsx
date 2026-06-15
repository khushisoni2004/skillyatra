import React, { useEffect, useMemo, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";

function Badge({ children, tone = "slate" }) {
  const tones = {
    green: "bg-green-50 text-green-700 ring-green-100",
    red: "bg-red-50 text-red-700 ring-red-100",
    yellow: "bg-amber-50 text-amber-700 ring-amber-100",
    indigo: "bg-indigo-50 text-indigo-700 ring-indigo-100",
    violet: "bg-violet-50 text-violet-700 ring-violet-100",
    slate: "bg-slate-50 text-slate-700 ring-slate-200"
  };

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${tones[tone] || tones.slate}`}>
      {children}
    </span>
  );
}

function statusTone(status) {
  if (status === "Present") return "green";
  if (status === "Missing") return "red";
  if (status === "Weak") return "yellow";
  return "slate";
}

export default function ResumeCoach() {
  const [companies, setCompanies] = useState([]);
  const [companySearch, setCompanySearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [analysis, setAnalysis] = useState(null);

  const [companyLoading, setCompanyLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const loadCompanies = async () => {
    try {
      setCompanyLoading(true);
      setError("");

      const res = await fetch(`${API_BASE}/api/resume/companies`);
      const data = await res.json();

      if (!data.ok) {
        setCompanies([]);
        setError(data.message || "Failed to load companies.");
        return;
      }

      setCompanies(Array.isArray(data.companies) ? data.companies : []);
    } catch (err) {
      setCompanies([]);
      setError("Failed to load companies. Backend API is not responding.");
    } finally {
      setCompanyLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const filteredCompanies = useMemo(() => {
    const q = companySearch.trim().toLowerCase();

    if (!q) return [];

    return companies
      .filter((company) =>
        String(company.companyName || "").toLowerCase().includes(q)
      )
      .slice(0, 80);
  }, [companies, companySearch]);

  const selectedCompanyData = useMemo(() => {
    return companies.find((company) => company.companyName === selectedCompany);
  }, [companies, selectedCompany]);

  const roles = selectedCompanyData?.roles || [];

  const readTextFile = async (file) => {
    if (!file) return;

    const content = await file.text();
    setResumeText(content);
    setAnalysis(null);
    setError("");
  };

  const analyzeResume = async () => {
    try {
      setError("");
      setAnalysis(null);

      if (!selectedCompany) {
        setError("Search and select company first.");
        return;
      }

      if (!selectedRole) {
        setError("Select target role first.");
        return;
      }

      if (!resumeText.trim()) {
        setError("Paste resume text first.");
        return;
      }

      setAnalyzing(true);

      const res = await fetch(`${API_BASE}/api/resume/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          resumeText,
          companyName: selectedCompany,
          roleName: selectedRole
        })
      });

      const data = await res.json();

      if (!data.ok) {
        setError(data.message || "Resume analysis failed.");
        return;
      }

      setAnalysis(data);
    } catch (err) {
      setError("Resume analysis failed. Check backend server.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <section className="rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-900 to-violet-700 p-8 text-white shadow-xl">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.35em] text-indigo-100">
          Resume Coach
        </p>

        <h1 className="text-4xl font-black md:text-5xl">
          Advanced Resume Role Fit Analyzer
        </h1>

        <p className="mt-4 max-w-4xl text-base font-semibold text-indigo-100">
          Analyze your resume against a selected company job role using your uploaded job market dataset.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-5">
          <div className="rounded-2xl border border-white/20 bg-white/10 p-5">
            <p className="text-sm font-bold text-indigo-100">Companies Loaded</p>
            <h2 className="mt-2 text-4xl font-black">{companies.length}</h2>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/10 p-5">
            <p className="text-sm font-bold text-indigo-100">Selected Company</p>
            <h2 className="mt-2 text-lg font-black">
              {selectedCompany || "Not selected"}
            </h2>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/10 p-5">
            <p className="text-sm font-bold text-indigo-100">Selected Role</p>
            <h2 className="mt-2 text-lg font-black">
              {selectedRole || "Not selected"}
            </h2>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/10 p-5">
            <p className="text-sm font-bold text-indigo-100">ATS Score</p>
            <h2 className="mt-2 text-4xl font-black">
              {analysis ? `${analysis.atsScore}%` : "--"}
            </h2>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/10 p-5">
            <p className="text-sm font-bold text-indigo-100">Role Match</p>
            <h2 className="mt-2 text-4xl font-black">
              {analysis ? `${analysis.roleMatchScore}%` : "--"}
            </h2>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900">
                1. Select Target Company + Role
              </h2>
              <p className="mt-1 font-semibold text-slate-500">
                Search company, click from option bar, then choose role.
              </p>
            </div>

            {companyLoading && (
              <Badge tone="indigo">Loading...</Badge>
            )}
          </div>

          <div className="mt-5">
            <label className="mb-2 block font-black text-slate-700">
              Search Company
            </label>

            <input
              value={companySearch}
              onChange={(e) => {
                setCompanySearch(e.target.value);
                setSelectedCompany("");
                setSelectedRole("");
                setAnalysis(null);
                setError("");
              }}
              placeholder="Search Google, Amazon, Flipkart, Accenture, Infosys..."
              className="w-full rounded-xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-indigo-500"
            />
          </div>

          {!companySearch.trim() && (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
              <div className="text-4xl">🔎</div>
              <h3 className="mt-3 text-lg font-black text-slate-900">
                Search company to start
              </h3>
              <p className="mt-1 font-semibold text-slate-500">
                No company or role is selected by default.
              </p>
            </div>
          )}

          {companySearch.trim() && (
            <div className="mt-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-black text-slate-800">
                  Company Option Bar
                </h3>
                <p className="text-xs font-bold text-slate-500">
                  Scroll and click
                </p>
              </div>

              {filteredCompanies.length === 0 ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 font-bold text-amber-800">
                  No company found for "{companySearch}".
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex min-w-max gap-3">
                    {filteredCompanies.map((company, index) => {
                      const active = selectedCompany === company.companyName;

                      return (
                        <button
                          key={`${company.companyName}-${index}`}
                          onClick={() => {
                            setSelectedCompany(company.companyName);
                            setSelectedRole("");
                            setAnalysis(null);
                            setError("");
                          }}
                          className={`rounded-2xl border px-5 py-4 text-left transition hover:-translate-y-1 hover:shadow-md ${
                            active
                              ? "border-indigo-500 bg-indigo-600 text-white"
                              : "border-slate-200 bg-white text-slate-900"
                          }`}
                        >
                          <p className="whitespace-nowrap text-sm font-black">
                            {company.companyName}
                          </p>
                          <p className={`mt-1 whitespace-nowrap text-xs font-bold ${active ? "text-indigo-100" : "text-slate-500"}`}>
                            {company.totalJobCount || 0} jobs
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedCompany && (
            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-black text-slate-800">
                  Role Option Bar
                </h3>
                <p className="text-xs font-bold text-slate-500">
                  {roles.length} roles
                </p>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex min-w-max gap-3">
                  {roles.map((role, index) => {
                    const active = selectedRole === role.roleName;

                    return (
                      <button
                        key={`${role.roleName}-${index}`}
                        onClick={() => {
                          setSelectedRole(role.roleName);
                          setAnalysis(null);
                          setError("");
                        }}
                        className={`w-72 rounded-2xl border px-5 py-4 text-left transition hover:-translate-y-1 hover:shadow-md ${
                          active
                            ? "border-indigo-500 bg-indigo-600 text-white"
                            : "border-slate-200 bg-white text-slate-900"
                        }`}
                      >
                        <p className="text-sm font-black">
                          {role.roleName}
                        </p>

                        <p className={`mt-2 text-xs font-bold ${active ? "text-indigo-100" : "text-slate-500"}`}>
                          {role.jobCount || 0} jobs
                        </p>

                        <p className={`mt-1 text-xs font-bold ${active ? "text-indigo-100" : "text-green-700"}`}>
                          {role.expectedPackage || "Not specified in dataset"}
                        </p>

                        <p className={`mt-1 text-xs font-bold ${active ? "text-indigo-100" : "text-slate-500"}`}>
                          {role.expectedExperience || "Not specified in dataset"}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
            <h3 className="font-black text-indigo-900">
              Analyzer Features
            </h3>

            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {[
                "ATS checklist",
                "Role-wise skill gap",
                "Matched vs missing skills",
                "Weak bullet detector",
                "Must-add resume proof",
                "Suggested role projects",
                "7-day improvement plan",
                "Role match score"
              ].map((item, index) => (
                <div key={index} className="rounded-2xl bg-white p-3 text-sm font-bold text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-2xl font-black text-slate-900">
            2. Paste Resume Text
          </h2>

          <p className="mt-1 font-semibold text-slate-500">
            Paste your resume content or upload a .txt resume file.
          </p>

          <input
            type="file"
            accept=".txt"
            onChange={(e) => readTextFile(e.target.files?.[0])}
            className="mt-5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold"
          />

          <textarea
            value={resumeText}
            onChange={(e) => {
              setResumeText(e.target.value);
              setAnalysis(null);
              setError("");
            }}
            placeholder="Paste your resume text here..."
            rows={17}
            className="mt-4 w-full rounded-2xl border border-slate-200 p-4 font-semibold outline-none focus:border-indigo-500"
          />

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 font-black text-red-700">
              {error}
            </div>
          )}

          <button
            onClick={analyzeResume}
            disabled={analyzing}
            className="mt-5 w-full rounded-xl bg-indigo-600 px-6 py-4 font-black text-white shadow-lg hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {analyzing ? "Analyzing..." : "Analyze Resume →"}
          </button>
        </div>
      </section>

      {!analysis && (
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="text-5xl">📄</div>
          <h2 className="mt-4 text-2xl font-black text-slate-900">
            Analysis will appear here
          </h2>
          <p className="mt-2 font-semibold text-slate-500">
            Select company, select role, paste resume, then click Analyze Resume.
          </p>
        </section>
      )}

      {analysis && (
        <section className="mt-8 space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black text-slate-900">
                  Resume Analysis Result
                </h2>
                <p className="mt-1 font-semibold text-slate-500">
                  {analysis.companyName} → {analysis.roleName}
                </p>
              </div>

              <Badge tone="indigo">{analysis.readinessLabel}</Badge>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-5">
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="font-bold text-slate-500">ATS Score</p>
                <h3 className="mt-2 text-4xl font-black text-slate-900">
                  {analysis.atsScore}%
                </h3>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="font-bold text-slate-500">Role Match</p>
                <h3 className="mt-2 text-4xl font-black text-slate-900">
                  {analysis.roleMatchScore}%
                </h3>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="font-bold text-slate-500">Matched Skills</p>
                <h3 className="mt-2 text-4xl font-black text-green-700">
                  {analysis.matchedSkills.length}
                </h3>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="font-bold text-slate-500">Missing Skills</p>
                <h3 className="mt-2 text-4xl font-black text-red-700">
                  {analysis.missingSkills.length}
                </h3>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="font-bold text-slate-500">Package</p>
                <h3 className="mt-2 text-lg font-black text-slate-900">
                  {analysis.expectedPackage}
                </h3>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-2xl font-black text-slate-900">
              ATS Checklist
            </h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {analysis.atsChecklist.map((item, index) => (
                <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-black text-slate-900">{item.label}</h3>
                    <Badge tone={statusTone(item.status)}>{item.status}</Badge>
                  </div>

                  <p className="mt-3 text-sm font-semibold text-slate-600">
                    {item.suggestion}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-2xl font-black text-slate-900">
                Matched Skills
              </h2>

              <div className="mt-4 flex flex-wrap gap-2">
                {analysis.matchedSkills.length ? (
                  analysis.matchedSkills.map((skill, index) => (
                    <Badge key={index} tone="green">{skill}</Badge>
                  ))
                ) : (
                  <p className="font-bold text-slate-500">
                    No matched skills found.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-2xl font-black text-slate-900">
                Missing Skills
              </h2>

              <div className="mt-4 flex flex-wrap gap-2">
                {analysis.missingSkills.length ? (
                  analysis.missingSkills.map((skill, index) => (
                    <Badge key={index} tone="red">{skill}</Badge>
                  ))
                ) : (
                  <p className="font-bold text-green-700">
                    Great. No major role skill missing.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-2xl font-black text-slate-900">
              Must Add To Resume
            </h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {analysis.mustAdd.length ? (
                analysis.mustAdd.map((item, index) => (
                  <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <h3 className="text-lg font-black text-slate-900">
                      {item.skill}
                    </h3>

                    <p className="mt-3 text-sm font-bold text-slate-600">
                      <span className="text-slate-900">Learn:</span> {item.whatToLearn}
                    </p>

                    <p className="mt-3 text-sm font-bold text-slate-600">
                      <span className="text-slate-900">Proof:</span> {item.resumeProof}
                    </p>

                    <div className="mt-4 rounded-2xl bg-white p-4 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
                      {item.bulletExample}
                    </div>
                  </div>
                ))
              ) : (
                <p className="font-bold text-green-700">
                  No missing skills to add.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-2xl font-black text-slate-900">
              Weak Resume Points
            </h2>

            <div className="mt-5 space-y-4">
              {analysis.weakPoints.length ? (
                analysis.weakPoints.map((item, index) => (
                  <div key={index} className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                    <p className="text-sm font-black text-amber-900">
                      Weak line:
                    </p>
                    <p className="mt-1 text-sm font-semibold text-amber-800">
                      {item.weakLine}
                    </p>

                    <p className="mt-3 text-sm font-black text-amber-900">
                      Issue:
                    </p>
                    <p className="mt-1 text-sm font-semibold text-amber-800">
                      {item.issue}
                    </p>

                    <p className="mt-3 text-sm font-black text-green-900">
                      Improved version:
                    </p>
                    <p className="mt-1 rounded-2xl bg-white p-3 text-sm font-semibold text-green-800">
                      {item.improvedVersion}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-green-200 bg-green-50 p-4 font-bold text-green-700">
                  No common weak resume phrases detected.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-2xl font-black text-slate-900">
              Suggested Projects
            </h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {analysis.projectSuggestions.map((project, index) => (
                <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <h3 className="text-lg font-black text-slate-900">
                    {project.title}
                  </h3>

                  <p className="mt-3 text-sm font-bold text-slate-600">
                    {project.whatToBuild}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {(project.skillsCovered || []).map((skill, i) => (
                      <Badge key={i} tone="indigo">{skill}</Badge>
                    ))}
                  </div>

                  <div className="mt-4 rounded-2xl bg-white p-4 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
                    {project.resumeBulletExample}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-2xl font-black text-slate-900">
              7-Day Improvement Plan
            </h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {analysis.improvementPlan.map((item, index) => (
                <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <h3 className="font-black text-indigo-700">
                    {item.day}
                  </h3>
                  <p className="mt-2 text-sm font-semibold text-slate-700">
                    {item.task}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm font-bold text-amber-800">
            {analysis.disclaimer}
          </div>
        </section>
      )}
    </div>
  );
}
