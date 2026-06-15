import React, { useEffect, useMemo, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";

function Badge({ children, type = "default" }) {
  const styles = {
    default: "bg-slate-100 text-slate-700 ring-slate-200",
    success: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    danger: "bg-rose-50 text-rose-700 ring-rose-100",
    warning: "bg-amber-50 text-amber-700 ring-amber-100",
    primary: "bg-indigo-50 text-indigo-700 ring-indigo-100"
  };

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-black ring-1 ${styles[type] || styles.default}`}>
      {children}
    </span>
  );
}

function badgeType(status) {
  if (status === "Present") return "success";
  if (status === "Missing") return "danger";
  if (status === "Weak") return "warning";
  return "default";
}

function cleanText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^\w\s.+#/-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueList(list) {
  const seen = new Set();
  return (list || [])
    .filter(Boolean)
    .map((item) => String(item).trim())
    .filter(Boolean)
    .filter((item) => {
      const key = cleanText(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function skillInResume(skill, resumeText) {
  const skillClean = cleanText(skill);
  const resumeClean = cleanText(resumeText);
  if (!skillClean || !resumeClean) return false;

  const aliases = {
    crm: ["crm", "customer relationship management"],
    "crm software": ["crm", "crm software", "customer relationship management"],
    sales: ["sales", "selling"],
    "cold calling": ["cold calling", "calling", "outbound calling"],
    "business development": ["business development", "bde", "client acquisition"],
    "customer service": ["customer service", "customer support", "client support"],
    javascript: ["javascript", "js"],
    react: ["react", "reactjs", "react.js"],
    node: ["node", "nodejs", "node.js"],
    "node.js": ["node", "nodejs", "node.js"],
    mongodb: ["mongodb", "mongo db", "mongo"],
    sql: ["sql", "mysql", "postgresql"],
    "machine learning": ["machine learning", "ml"],
    "computer vision": ["computer vision", "opencv"],
    accounting: ["accounting", "accounts"],
    sap: ["sap", "sap fi", "sap fico"]
  };

  const checks = aliases[skillClean] || [skillClean];
  return checks.some((word) => resumeClean.includes(cleanText(word)));
}

function getRoleSkillsFromDataset(selectedRoleData, analysis) {
  return uniqueList([
    ...(selectedRoleData?.skills || []),
    ...(selectedRoleData?.requiredSkills || []),
    ...(selectedRoleData?.topSkills || []),
    ...(analysis?.roleSkills || []),
    ...(analysis?.requiredSkills || []),
    ...(analysis?.targetSkills || []),
    ...(analysis?.matchedSkills || []),
    ...(analysis?.missingSkills || [])
  ]);
}

function makeDatasetProofSuggestions(missingSkills, roleName) {
  return uniqueList(missingSkills).slice(0, 10).map((skill) => ({
    skill,
    whatToAdd: `Add real proof of ${skill} for ${roleName}.`,
    proof: `Mention internship, project, training, work task, certification, tool usage, or measurable result where you used ${skill}.`,
    example: `Added ${skill} experience in ${roleName}-related work with clear action, tool/process used, and measurable outcome.`
  }));
}

export default function ResumeCoach() {
  const [companies, setCompanies] = useState([]);
  const [companySearch, setCompanySearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [analysis, setAnalysis] = useState(null);

  const [companyLoading, setCompanyLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
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
      setError("Backend not connected. Start backend on port 5001.");
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
      .slice(0, 12);
  }, [companies, companySearch]);

  const selectedCompanyData = useMemo(() => {
    return companies.find((company) => company.companyName === selectedCompany);
  }, [companies, selectedCompany]);

  const roles = selectedCompanyData?.roles || [];

  const selectedRoleData = useMemo(() => {
    return roles.find((role) => role.roleName === selectedRole) || null;
  }, [roles, selectedRole]);

  const datasetRequiredSkills = useMemo(() => {
    return getRoleSkillsFromDataset(selectedRoleData, analysis);
  }, [selectedRoleData, analysis]);

  const strictMatchedSkills = useMemo(() => {
    const datasetMatched = datasetRequiredSkills.filter((skill) =>
      skillInResume(skill, resumeText)
    );

    return uniqueList([...(analysis?.matchedSkills || []), ...datasetMatched]);
  }, [analysis, datasetRequiredSkills, resumeText]);

  const strictMissingSkills = useMemo(() => {
    const datasetMissing = datasetRequiredSkills.filter((skill) =>
      !skillInResume(skill, resumeText)
    );

    return uniqueList([...(analysis?.missingSkills || []), ...datasetMissing]).filter(
      (skill) => !strictMatchedSkills.some((matched) => cleanText(matched) === cleanText(skill))
    );
  }, [analysis, datasetRequiredSkills, resumeText, strictMatchedSkills]);

  const strictRoleMatchScore = useMemo(() => {
    if (!analysis) return "--";

    const total = strictMatchedSkills.length + strictMissingSkills.length;
    if (!total) return `${analysis.roleMatchScore || 0}%`;

    return `${Math.round((strictMatchedSkills.length / total) * 100)}%`;
  }, [analysis, strictMatchedSkills, strictMissingSkills]);

  const strictProofSuggestions = useMemo(() => {
    return makeDatasetProofSuggestions(strictMissingSkills, selectedRole || "selected role");
  }, [strictMissingSkills, selectedRole]);

  const resumeWordCount = resumeText.trim()
    ? resumeText.trim().split(/\s+/).filter(Boolean).length
    : 0;

  const uploadResumeFile = async (file) => {
    if (!file) return;

    try {
      setUploading(true);
      setError("");
      setAnalysis(null);

      const formData = new FormData();
      formData.append("resume", file);

      const res = await fetch(`${API_BASE}/api/resume/extract-text`, {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      if (!data.ok) {
        setError(data.message || "Could not read this resume file.");
        return;
      }

      setResumeText(data.extractedText || "");
    } catch (err) {
      setError("Resume upload failed. Start backend and try again.");
    } finally {
      setUploading(false);
    }
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
        setError("Paste or upload complete resume first.");
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
    <main className="sy-page-theme sy-resume-theme min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-slate-50 via-indigo-50/60 to-violet-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1500px] space-y-7">
        <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#0f172a] via-[#312e81] to-[#6d28d9] p-7 text-white shadow-2xl shadow-indigo-200 sm:p-7">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-400/25 blur-3xl" />
          <div className="absolute -bottom-28 left-16 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative z-10">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-indigo-200">
              Resume Coach
            </p>

            <h1 className="mt-3 text-[32px] font-black leading-tight sm:text-[38px] lg:text-[44px]">
              RoleFit Lab
            </h1>

            <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-indigo-100 sm:text-base">
              Dataset-based resume skill gap checker.
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[34px] bg-white/95 p-6 shadow-xl shadow-indigo-50 ring-1 ring-indigo-100 backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Role Target</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Search company, select company, then choose role.
                </p>
              </div>

              {companyLoading && <Badge type="primary">Loading...</Badge>}
            </div>

            <div className="mt-5">
              <label className="mb-2 flex items-center gap-2 text-sm font-black text-slate-800">
                <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                  🔍
                </span>
                Search Company
              </label>

              <input
                value={companySearch}
                onChange={(e) => {
                  setCompanySearch(e.target.value);
                  setSelectedCompany("");
                  setSelectedRole("");
                  setRoleMenuOpen(false);
                  setAnalysis(null);
                  setError("");
                }}
                placeholder="Search company..."
                className="w-full rounded-[22px] border border-indigo-100 bg-gradient-to-r from-slate-50 to-indigo-50/70 px-5 py-4 text-sm font-bold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            {!companySearch.trim() && (
              <div className="mt-5 rounded-[30px] border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-8 text-center shadow-inner">
                <div className="text-4xl">🔎</div>
                <h3 className="mt-3 text-lg font-black text-slate-900">
                  Search company to start
                </h3>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  No company or role is selected by default.
                </p>
              </div>
            )}

            {companySearch.trim() && (
              <div className="mt-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-800">Matching Companies</h3>
                  <span className="text-xs font-bold text-slate-500">
                    {filteredCompanies.length} results
                  </span>
                </div>

                {filteredCompanies.length === 0 ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">
                    No company found for "{companySearch}".
                  </div>
                ) : (
                  <div className="max-h-72 overflow-y-auto rounded-[28px] border border-indigo-100 bg-gradient-to-r from-slate-50 to-indigo-50 p-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {filteredCompanies.map((company, index) => {
                        const active = selectedCompany === company.companyName;

                        return (
                          <button
                            key={`${company.companyName}-${index}`}
                            type="button"
                            onClick={() => {
                              setSelectedCompany(company.companyName);
                              setSelectedRole("");
                              setRoleMenuOpen(false);
                              setAnalysis(null);
                              setError("");
                            }}
                            className={`rounded-[22px] border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg ${
                              active
                                ? "border-indigo-600 bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-100"
                                : "border-indigo-100 bg-white text-slate-900"
                            }`}
                          >
                            <p className="truncate text-sm font-black">{company.companyName}</p>
                            <p className={`mt-1 text-xs font-bold ${active ? "text-indigo-100" : "text-slate-500"}`}>
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
                <label className="mb-2 flex items-center gap-2 text-sm font-black text-slate-800">
                  <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
                    ▾
                  </span>
                  Choose Job Role
                </label>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setRoleMenuOpen((value) => !value)}
                    className="flex w-full items-center justify-between rounded-[22px] border border-indigo-100 bg-gradient-to-r from-white via-indigo-50/80 to-violet-50 px-5 py-4 text-left text-sm font-black text-slate-800 shadow-sm outline-none transition hover:border-indigo-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  >
                    <span className="max-w-[85%] truncate">
                      {selectedRole || "Select role"}
                    </span>
                    <span className="rounded-2xl bg-white px-3 py-1 text-indigo-700 shadow-sm">
                      {roleMenuOpen ? "▲" : "▼"}
                    </span>
                  </button>

                  {roleMenuOpen && (
                    <div className="absolute left-0 right-0 top-[66px] z-50 overflow-hidden rounded-[26px] border border-indigo-100 bg-white shadow-2xl shadow-indigo-100">
                      <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-violet-50 px-4 py-3">
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600">
                          Select role from dataset
                        </p>
                      </div>

                      <div className="max-h-80 overflow-y-auto p-2">
                        {roles.map((role, index) => {
                          const active = selectedRole === role.roleName;

                          return (
                            <button
                              key={`${role.roleName}-${index}`}
                              type="button"
                              onClick={() => {
                                setSelectedRole(role.roleName);
                                setRoleMenuOpen(false);
                                setAnalysis(null);
                                setError("");
                              }}
                              className={`w-full rounded-2xl px-4 py-3 text-left transition ${
                                active
                                  ? "bg-indigo-600 text-white"
                                  : "text-slate-800 hover:bg-indigo-50"
                              }`}
                            >
                              <p className="text-sm font-black">{role.roleName}</p>
                              <p className={`mt-1 text-xs font-bold ${active ? "text-indigo-100" : "text-slate-500"}`}>
                                {role.jobCount || 0} jobs • {role.expectedPackage || "Not disclosed"} • {role.expectedExperience || "Experience not specified"}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {selectedRole && (
                  <div className="mt-4 rounded-[24px] border border-indigo-100 bg-indigo-50 p-4">
                    <p className="text-sm font-black text-indigo-900">{selectedRole}</p>
                    <p className="mt-1 text-xs font-bold leading-5 text-indigo-700">
                      Selected role is ready for strict full-resume analysis.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="rounded-[34px] bg-white/95 p-6 shadow-xl shadow-indigo-50 ring-1 ring-indigo-100 backdrop-blur">
            <h2 className="text-2xl font-black text-slate-900">
              Resume Scanner
            </h2>

            <p className="mt-1 text-sm font-semibold text-slate-500">
              Upload or paste your complete resume text.
            </p>

            <div className="mt-4 rounded-[24px] border border-indigo-100 bg-indigo-50 p-4">
              <p className="text-sm font-black text-indigo-900">Strict full resume check</p>
              <p className="mt-1 text-xs font-bold leading-5 text-indigo-700">
                Checks actual role skills from dataset against your full resume text.
              </p>
            </div>

            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={(e) => uploadResumeFile(e.target.files?.[0])}
              className="mt-5 w-full rounded-[22px] border border-indigo-100 bg-gradient-to-r from-white to-indigo-50 px-4 py-3 text-sm font-bold text-slate-700"
            />

            {uploading && (
              <div className="mt-3 rounded-xl bg-indigo-50 p-3 text-sm font-black text-indigo-700">
                Reading resume file...
              </div>
            )}

            <textarea
              value={resumeText}
              onChange={(e) => {
                setResumeText(e.target.value);
                setAnalysis(null);
                setError("");
              }}
              placeholder="Resume text will appear here after upload, or paste manually..."
              rows={14}
              className="mt-4 w-full resize-y rounded-[24px] border border-indigo-100 bg-slate-50/80 p-5 text-sm font-semibold leading-6 text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
            />

            {resumeText.trim() && (
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
                  <p className="text-xs font-black text-slate-500">Resume coverage</p>
                  <p className="mt-1 text-lg font-black text-slate-900">Full text</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
                  <p className="text-xs font-black text-slate-500">Words</p>
                  <p className="mt-1 text-lg font-black text-slate-900">{resumeWordCount}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
                  <p className="text-xs font-black text-slate-500">Characters</p>
                  <p className="mt-1 text-lg font-black text-slate-900">{resumeText.length}</p>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-black text-red-700">
                {error}
              </div>
            )}

            <button
              onClick={analyzeResume}
              disabled={analyzing || uploading}
              className="mt-5 w-full rounded-[22px] bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-6 py-4 text-sm font-black text-white shadow-xl shadow-indigo-200 transition hover:-translate-y-0.5 hover:scale-[1.01] disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {analyzing ? "Analyzing..." : "Analyze Resume →"}
            </button>
          </div>
        </section>

        {!analysis && (
          <section className="rounded-[34px] border border-indigo-100 bg-white p-8 text-center shadow-xl shadow-indigo-50">
            <div className="text-5xl">📄</div>
            <h2 className="mt-4 text-2xl font-black text-slate-900">
              Analysis will appear here
            </h2>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              Select company, select role, upload or paste resume, then click Analyze Resume.
            </p>
          </section>
        )}

        {analysis && (
          <section className="space-y-6">
            <div className="rounded-[34px] bg-white/95 p-6 shadow-xl shadow-indigo-50 ring-1 ring-indigo-100">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-black text-slate-900">Role Fit Report</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {analysis.companyName} → {analysis.roleName}
                  </p>
                </div>

                <Badge type="primary">{analysis.readinessLabel}</Badge>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">                <div className="rounded-[24px] bg-gradient-to-br from-slate-50 to-indigo-50 p-5 ring-1 ring-indigo-100">
                  <p className="text-sm font-bold text-slate-500">Strict Role Match</p>
                  <h3 className="mt-2 text-4xl font-black text-slate-900">{strictRoleMatchScore}</h3>
                </div>
                <div className="rounded-[24px] bg-gradient-to-br from-slate-50 to-indigo-50 p-5 ring-1 ring-indigo-100">
                  <p className="text-sm font-bold text-slate-500">Matched</p>
                  <h3 className="mt-2 text-4xl font-black text-emerald-700">{strictMatchedSkills.length}</h3>
                </div>
                <div className="rounded-[24px] bg-gradient-to-br from-slate-50 to-indigo-50 p-5 ring-1 ring-indigo-100">
                  <p className="text-sm font-bold text-slate-500">Missing</p>
                  <h3 className="mt-2 text-4xl font-black text-rose-700">{strictMissingSkills.length}</h3>
                </div>
                <div className="rounded-[24px] bg-gradient-to-br from-slate-50 to-indigo-50 p-5 ring-1 ring-indigo-100">
                  <p className="text-sm font-bold text-slate-500">Package</p>
                  <h3 className="mt-2 text-lg font-black text-slate-900">{analysis.expectedPackage}</h3>
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-[34px] bg-white/95 p-6 shadow-xl shadow-indigo-50 ring-1 ring-indigo-100">
                <h2 className="text-2xl font-black text-slate-900">Matched Skills</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Skills detected from your resume text.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {strictMatchedSkills.length ? (
                    strictMatchedSkills.map((skill, index) => (
                      <Badge key={index} type="success">{skill}</Badge>
                    ))
                  ) : (
                    <p className="text-sm font-bold text-slate-500">No matched skills found.</p>
                  )}
                </div>
              </div>

              <div className="rounded-[34px] bg-white/95 p-6 shadow-xl shadow-indigo-50 ring-1 ring-indigo-100">
                <h2 className="text-2xl font-black text-slate-900">Dataset Skill Gap</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Required by selected role dataset but not found in resume text.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {strictMissingSkills.length ? (
                    strictMissingSkills.map((skill, index) => (
                      <Badge key={index} type="danger">{skill}</Badge>
                    ))
                  ) : (
                    <p className="text-sm font-bold text-emerald-700">No major skill missing.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-[34px] bg-white/95 p-6 shadow-xl shadow-indigo-50 ring-1 ring-indigo-100">
              <h2 className="text-2xl font-black text-slate-900">Resume Upgrade Actions</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                Role-wise actions based on missing dataset skills and your resume content.
              </p>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                {strictProofSuggestions.length ? (
                  strictProofSuggestions.map((item, index) => (
                    <div key={index} className="rounded-[24px] border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/60 p-5">
                      <h3 className="text-lg font-black text-slate-900">{item.skill}</h3>
                      <p className="mt-3 text-sm font-bold text-slate-600">
                        <span className="text-slate-900">What to learn:</span> {item.whatToLearn || item.action || item.whatToAdd}
                      </p>
                      <p className="mt-3 text-sm font-bold text-slate-600">
                        <span className="text-slate-900">Resume proof:</span> {item.resumeProof || item.proof}
                      </p>
                      <div className="mt-4 rounded-2xl bg-white p-4 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
                        {item.bulletExample || item.example}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm font-bold text-emerald-700">No missing skills to add.</p>
                )}
              </div>
            </div>          </section>
        )}
      </div>
    </main>
  );
}
