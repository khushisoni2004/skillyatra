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
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ${styles[type] || styles.default}`}>
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

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-indigo-100">{label}</p>
      <h3 className="mt-2 truncate text-2xl font-black text-white">{value}</h3>
    </div>
  );
}

export default function ResumeCoach() {
  const [companies, setCompanies] = useState([]);
  const [companySearch, setCompanySearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
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
    <main className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-slate-50 via-indigo-50/60 to-violet-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <section className="relative overflow-hidden rounded-[38px] bg-gradient-to-br from-[#0f172a] via-[#312e81] to-[#6d28d9] p-6 text-white shadow-2xl shadow-indigo-200 sm:p-8">
          <div className="resume-glow-main absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-400/25 blur-3xl" />
          <div className="absolute -bottom-28 left-16 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative z-10">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-indigo-100">
            Resume Coach
          </p>

          <h1 className="mt-3 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
            Advanced Resume Role Fit Analyzer
          </h1>

          <p className="mt-3 max-w-3xl text-sm font-semibold text-indigo-100 sm:text-base">
            Analyze your resume against a selected company job role using your uploaded job market dataset.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard label="Companies Loaded" value={companies.length} />
            <StatCard label="Selected Company" value={selectedCompany || "Not selected"} />
            <StatCard label="Selected Role" value={selectedRole || "Not selected"} />
            <StatCard label="ATS Score" value={analysis ? `${analysis.atsScore}%` : "--"} />
            <StatCard label="Role Match" value={analysis ? `${analysis.roleMatchScore}%` : "--"} />
          </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[34px] bg-white/95 p-6 shadow-xl shadow-indigo-50 ring-1 ring-indigo-100 backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Select Target</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Search company, select company, then select job role.
                </p>
              </div>

              {companyLoading && <Badge type="primary">Loading...</Badge>}
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-black text-slate-700">
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
                placeholder="Search Google, Amazon, Flipkart, Accenture..."
                className="w-full rounded-[22px] border border-indigo-100 bg-gradient-to-r from-slate-50 to-indigo-50/70 px-5 py-4 text-sm font-bold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            {!companySearch.trim() && (
              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
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
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">
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
                              setAnalysis(null);
                              setError("");
                            }}
                            className={`rounded-xl border p-4 text-left transition hover:shadow-md ${
                              active
                                ? "border-indigo-600 bg-indigo-600 text-white"
                                : "border-slate-200 bg-white text-slate-900"
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
                <label className="mb-2 block text-sm font-black text-slate-700">
                  Choose Job Role
                </label>

                <select
                  value={selectedRole}
                  onChange={(e) => {
                    setSelectedRole(e.target.value);
                    setAnalysis(null);
                    setError("");
                  }}
                  className="w-full rounded-[22px] border border-indigo-100 bg-gradient-to-r from-slate-50 to-indigo-50/70 px-5 py-4 text-sm font-bold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                >
                  <option value="">Select role</option>
                  {roles.map((role, index) => (
                    <option key={`${role.roleName}-${index}`} value={role.roleName}>
                      {role.roleName} | {role.jobCount || 0} jobs | {role.expectedPackage || "Not specified"} | {role.expectedExperience || "Not specified"}
                    </option>
                  ))}
                </select>

                {selectedRole && (
                  <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
                    <p className="text-sm font-black text-indigo-900">{selectedRole}</p>
                    <p className="mt-1 text-xs font-bold text-indigo-700">
                      Selected role is ready for analysis.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="rounded-[34px] bg-white/95 p-6 shadow-xl shadow-indigo-50 ring-1 ring-indigo-100 backdrop-blur">
            <h2 className="text-2xl font-black text-slate-900">
              Upload / Paste Resume
            </h2>

            <p className="mt-1 text-sm font-semibold text-slate-500">
              Upload PDF, DOCX, TXT or paste the complete resume text manually. The full extracted text is sent for analysis.
            </p>

            <div className="mt-4 rounded-[24px] border border-indigo-100 bg-indigo-50 p-4">
              <p className="text-sm font-black text-indigo-900">Strict full resume check</p>
              <p className="mt-1 text-xs font-bold leading-5 text-indigo-700">
                It checks role skills, ATS points, missing skills, weak bullets, projects and improvement plan using the selected company role.
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
                <p className="mt-1 text-lg font-black text-slate-900">
                  {resumeText.trim().split(/\s+/).filter(Boolean).length}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
                <p className="text-xs font-black text-slate-500">Characters</p>
                <p className="mt-1 text-lg font-black text-slate-900">
                  {resumeText.length}
                </p>
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
            <div className="rounded-[34px] bg-white/95 p-6 shadow-xl shadow-indigo-50 ring-1 ring-indigo-100 backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-black text-slate-900">Resume Analysis Result</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {analysis.companyName} → {analysis.roleName}
                  </p>
                </div>

                <Badge type="primary">{analysis.readinessLabel}</Badge>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div className="rounded-[24px] bg-gradient-to-br from-slate-50 to-indigo-50 p-5 ring-1 ring-indigo-100">
                  <p className="text-sm font-bold text-slate-500">ATS Score</p>
                  <h3 className="mt-2 text-4xl font-black text-slate-900">{analysis.atsScore}%</h3>
                </div>
                <div className="rounded-[24px] bg-gradient-to-br from-slate-50 to-indigo-50 p-5 ring-1 ring-indigo-100">
                  <p className="text-sm font-bold text-slate-500">Role Match</p>
                  <h3 className="mt-2 text-4xl font-black text-slate-900">{analysis.roleMatchScore}%</h3>
                </div>
                <div className="rounded-[24px] bg-gradient-to-br from-slate-50 to-indigo-50 p-5 ring-1 ring-indigo-100">
                  <p className="text-sm font-bold text-slate-500">Matched</p>
                  <h3 className="mt-2 text-4xl font-black text-emerald-700">{analysis.matchedSkills.length}</h3>
                </div>
                <div className="rounded-[24px] bg-gradient-to-br from-slate-50 to-indigo-50 p-5 ring-1 ring-indigo-100">
                  <p className="text-sm font-bold text-slate-500">Missing</p>
                  <h3 className="mt-2 text-4xl font-black text-rose-700">{analysis.missingSkills.length}</h3>
                </div>
                <div className="rounded-[24px] bg-gradient-to-br from-slate-50 to-indigo-50 p-5 ring-1 ring-indigo-100">
                  <p className="text-sm font-bold text-slate-500">Package</p>
                  <h3 className="mt-2 text-lg font-black text-slate-900">{analysis.expectedPackage}</h3>
                </div>
              </div>
            </div>

            <div className="rounded-[34px] bg-white/95 p-6 shadow-xl shadow-indigo-50 ring-1 ring-indigo-100 backdrop-blur">
              <h2 className="text-2xl font-black text-slate-900">ATS Checklist</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {analysis.atsChecklist.map((item, index) => (
                  <div key={index} className="rounded-[24px] border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/60 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-sm font-black text-slate-900">{item.label}</h3>
                      <Badge type={badgeType(item.status)}>{item.status}</Badge>
                    </div>
                    <p className="mt-3 text-sm font-semibold text-slate-600">{item.suggestion}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-[34px] bg-white/95 p-6 shadow-xl shadow-indigo-50 ring-1 ring-indigo-100 backdrop-blur">
                <h2 className="text-2xl font-black text-slate-900">Matched Skills</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {analysis.matchedSkills.length ? (
                    analysis.matchedSkills.map((skill, index) => (
                      <Badge key={index} type="success">{skill}</Badge>
                    ))
                  ) : (
                    <p className="text-sm font-bold text-slate-500">No matched skills found.</p>
                  )}
                </div>
              </div>

              <div className="rounded-[34px] bg-white/95 p-6 shadow-xl shadow-indigo-50 ring-1 ring-indigo-100 backdrop-blur">
                <h2 className="text-2xl font-black text-slate-900">Missing Skills</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {analysis.missingSkills.length ? (
                    analysis.missingSkills.map((skill, index) => (
                      <Badge key={index} type="danger">{skill}</Badge>
                    ))
                  ) : (
                    <p className="text-sm font-bold text-emerald-700">No major skill missing.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-[34px] bg-white/95 p-6 shadow-xl shadow-indigo-50 ring-1 ring-indigo-100 backdrop-blur">
              <h2 className="text-2xl font-black text-slate-900">Must Add To Resume</h2>
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                {analysis.mustAdd.length ? (
                  analysis.mustAdd.map((item, index) => (
                    <div key={index} className="rounded-[24px] border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/60 p-5">
                      <h3 className="text-lg font-black text-slate-900">{item.skill}</h3>
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
                  <p className="text-sm font-bold text-emerald-700">No missing skills to add.</p>
                )}
              </div>
            </div>

            <div className="rounded-[34px] bg-white/95 p-6 shadow-xl shadow-indigo-50 ring-1 ring-indigo-100 backdrop-blur">
              <h2 className="text-2xl font-black text-slate-900">7-Day Improvement Plan</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {analysis.improvementPlan.map((item, index) => (
                  <div key={index} className="rounded-[24px] border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/60 p-5">
                    <h3 className="font-black text-indigo-700">{item.day}</h3>
                    <p className="mt-2 text-sm font-semibold text-slate-700">{item.task}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
