import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Companies.css";

import { BACKEND_BASE } from "../lib/config";
const API_BASE = BACKEND_BASE;

export default function Companies() {
  const navigate = useNavigate();

  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState("");
  const [dropdownCompany, setDropdownCompany] = useState("");
  const [companyMenuOpen, setCompanyMenuOpen] = useState(false);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [totalJobRows, setTotalJobRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchedOnce, setSearchedOnce] = useState(false);
  const [rolesViewed, setRolesViewed] = useState(false);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE}/api/companies?limit=2000`);
      const data = await res.json();
      const list = Array.isArray(data.companies) ? data.companies : [];

      setCompanies(list);
      setTotalCompanies(data.totalCompanies || list.length || 0);
      setTotalJobRows(data.totalJobRows || 0);
      setSelectedCompany("");
      setRoles([]);
      setSearch("");
      setDropdownCompany("");
      setSearchedOnce(false);
      setRolesViewed(false);
    } catch (err) {
      setCompanies([]);
      setError("No companies loaded. Check backend API.");
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async (companyName) => {
    if (!companyName) return;

    try {
      setRolesLoading(true);
      setSelectedCompany(companyName);
      setRoles([]);
      setRolesViewed(true);
      setSearchedOnce(true);

      const res = await fetch(
        `${API_BASE}/api/companies/${encodeURIComponent(companyName)}/roles`
      );

      const data = await res.json();
      setRoles(Array.isArray(data.roles) ? data.roles : []);
    } catch (err) {
      setRoles([]);
    } finally {
      setRolesLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const searchedCompanies = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];

    return companies
      .filter((company) =>
        String(company.companyName || "").toLowerCase().includes(q)
      )
      .slice(0, 80);
  }, [companies, search]);

  const dropdownCompanies = useMemo(() => {
    return companies
      .filter((company) => company.companyName)
      .sort((a, b) => String(a.companyName).localeCompare(String(b.companyName)))
      .slice(0, 2000);
  }, [companies]);

  const searchSuggestions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];

    return companies
      .filter((company) =>
        String(company.companyName || "").toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [companies, search]);

  const handleSearch = () => {
    setSearchedOnce(true);
    setSelectedCompany("");
    setRoles([]);
    setRolesViewed(false);
    setDropdownCompany("");
    setCompanyMenuOpen(false);
  };

  const handleDropdownChange = (companyName) => {
    setDropdownCompany(companyName);
    setSearch(companyName);

    if (companyName) {
      loadRoles(companyName);
    } else {
      setSelectedCompany("");
      setRoles([]);
      setRolesViewed(false);
      setSearchedOnce(false);
      setCompanyMenuOpen(false);
    }
  };

  const openCompany = (companyName) => {
    if (!companyName) return;
    navigate(`/companies/${encodeURIComponent(companyName)}`);
  };

  const openRole = (companyName, roleIndex) => {
    if (!companyName) return;
    navigate(`/companies/${encodeURIComponent(companyName)}/roles/${roleIndex + 1}`);
  };

  return (
    <div className="companies-theme-page min-h-screen">
      <section className="companies-theme-hero">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-400/25 blur-3xl" />
        <div className="absolute -bottom-28 left-16 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative z-10">
          <p className="companies-theme-kicker">
            Company Wise Preparation
          </p>

          <div className="mt-3 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl font-black tracking-tight md:text-5xl">
                Company + Job Roles
              </h1>
              <p className="mt-4 max-w-4xl text-sm font-semibold leading-6 text-indigo-100">
                Search or select a company from dropdown to view real dataset roles, required skills, locations and role-wise preparation.
              </p>
            </div>

            <div className="rounded-3xl bg-white/10 p-5 backdrop-blur-xl ring-1 ring-white/15">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-indigo-200">
                Selected Company
              </p>
              <h2 className="mt-2 max-w-[280px] truncate text-2xl font-black">
                {selectedCompany || "Search first"}
              </h2>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
              <p className="text-sm font-bold text-indigo-100">Companies Loaded</p>
              <h2 className="mt-2 text-4xl font-black">{totalCompanies}</h2>
            </div>

            <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
              <p className="text-sm font-bold text-indigo-100">Dataset Job Rows</p>
              <h2 className="mt-2 text-4xl font-black">{totalJobRows}</h2>
            </div>

            <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
              <p className="text-sm font-bold text-indigo-100">Roles Loaded</p>
              <h2 className="mt-2 text-4xl font-black">{rolesViewed ? roles.length : 0}</h2>
            </div>

            <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
              <p className="text-sm font-bold text-indigo-100">Status</p>
              <h2 className="mt-2 text-xl font-black">{loading ? "Loading..." : "Ready"}</h2>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-[34px] bg-white/95 p-6 shadow-2xl shadow-indigo-100/70 ring-1 ring-indigo-100 backdrop-blur">
        <div className="grid gap-4 xl:grid-cols-[1fr_1fr_auto] xl:items-end">
          <div className="relative">
            <label className="mb-2 flex items-center gap-2 text-sm font-black text-slate-800">
              <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                🔍
              </span>
              Search Company
            </label>

            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSearchedOnce(false);
                setSelectedCompany("");
                setRoles([]);
                setRolesViewed(false);
                setDropdownCompany("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              placeholder="Google, Amazon, Infosys, TCS..."
              className="w-full rounded-[22px] border border-indigo-100 bg-gradient-to-r from-slate-50 to-indigo-50/70 px-5 py-4 text-sm font-bold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
            />

            {search.trim() && searchSuggestions.length > 0 && !selectedCompany && (
              <div className="absolute left-0 right-0 top-[92px] z-40 overflow-hidden rounded-[24px] border border-indigo-100 bg-white shadow-2xl shadow-indigo-100">
                <div className="max-h-72 overflow-y-auto p-2">
                  {searchSuggestions.map((company, index) => (
                    <button
                      key={`suggestion-${company.companyName}-${index}`}
                      type="button"
                      onClick={() => {
                        setSearch(company.companyName);
                        setDropdownCompany(company.companyName);
                        setCompanyMenuOpen(false);
                        loadRoles(company.companyName);
                      }}
                      className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition hover:bg-indigo-50"
                    >
                      <span className="text-sm font-black text-slate-800">
                        {company.companyName}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        {company.totalJobCount || 0} jobs
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <label className="mb-2 flex items-center gap-2 text-sm font-black text-slate-800">
              <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
                ▾
              </span>
              Company Dropdown
            </label>

            <button
              type="button"
              onClick={() => setCompanyMenuOpen((value) => !value)}
              className="flex w-full items-center justify-between rounded-[22px] border border-indigo-100 bg-gradient-to-r from-white via-indigo-50/80 to-violet-50 px-5 py-4 text-left text-sm font-black text-slate-800 shadow-sm outline-none transition hover:border-indigo-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
            >
              <span className="max-w-[85%] truncate">
                {dropdownCompany || "Select company directly"}
              </span>
              <span className="rounded-2xl bg-white px-3 py-1 text-indigo-700 shadow-sm">
                {companyMenuOpen ? "▲" : "▼"}
              </span>
            </button>

            {companyMenuOpen && (
              <div className="absolute left-0 right-0 top-[92px] z-50 overflow-hidden rounded-[24px] border border-indigo-100 bg-white shadow-2xl shadow-indigo-100">
                <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-violet-50 px-4 py-3">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600">
                    Select Company
                  </p>
                </div>

                <div className="max-h-80 overflow-y-auto p-2">
                  {dropdownCompanies.map((company, index) => {
                    const active = dropdownCompany === company.companyName;

                    return (
                      <button
                        key={`dropdown-${company.companyName}-${index}`}
                        type="button"
                        onClick={() => {
                          setCompanyMenuOpen(false);
                          handleDropdownChange(company.companyName);
                        }}
                        className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition ${
                          active
                            ? "bg-indigo-600 text-white"
                            : "text-slate-800 hover:bg-indigo-50"
                        }`}
                      >
                        <span className="text-sm font-black">
                          {company.companyName}
                        </span>
                        <span className={`text-xs font-bold ${active ? "text-indigo-100" : "text-slate-500"}`}>
                          {company.totalJobCount || 0} jobs
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleSearch}
            className="rounded-[22px] bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-8 py-4 text-sm font-black text-white shadow-xl shadow-indigo-200 transition hover:-translate-y-0.5 hover:scale-[1.02]"
          >
            Search →
          </button>
        </div>
      </section>

      <section className="mt-8 rounded-[34px] bg-white p-6 shadow-xl shadow-indigo-50 ring-1 ring-indigo-100">
        {loading && (
          <div className="rounded-2xl bg-indigo-50 p-4 font-black text-indigo-700">
            Loading companies...
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 font-black text-red-700">
            {error}
          </div>
        )}

        {!search.trim() && (
          <div className="rounded-[30px] border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-10 text-center shadow-inner">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-3xl shadow-sm">
              🔍
            </div>
            <h3 className="mt-4 text-xl font-black text-slate-900">
              Search company to start
            </h3>
            <p className="mt-2 font-semibold text-slate-500">
              No job role data is shown before search or dropdown selection.
            </p>
          </div>
        )}

        {search.trim() && searchedOnce && searchedCompanies.length === 0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 font-bold text-amber-800">
            No company found in dataset for "{search}".
          </div>
        )}

        {search.trim() && searchedOnce && searchedCompanies.length > 0 && (
          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  Company Option Bar
                </h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Click company to load roles. Company detail opens only from detail button.
                </p>
              </div>

              {selectedCompany && (
                <button
                  onClick={() => openCompany(selectedCompany)}
                  className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-indigo-700"
                >
                  Company Detail →
                </button>
              )}
            </div>

            <div className="overflow-x-auto rounded-[30px] border border-indigo-100 bg-gradient-to-r from-slate-50 to-indigo-50 p-4">
              <div className="flex min-w-max gap-3">
                {searchedCompanies.map((company, index) => {
                  const active = selectedCompany === company.companyName;

                  return (
                    <button
                      key={`${company.companyName}-${index}`}
                      onClick={() => {
                        setDropdownCompany(company.companyName);
                        loadRoles(company.companyName);
                      }}
                      className={`rounded-3xl border px-5 py-4 text-left transition hover:-translate-y-1 hover:shadow-xl ${
                        active
                          ? "border-indigo-500 bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-100"
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
          </div>
        )}
      </section>

      <section className="mt-8 rounded-[34px] bg-white p-6 shadow-xl shadow-indigo-50 ring-1 ring-indigo-100">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900">Job Roles</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              {rolesViewed && selectedCompany
                ? `${selectedCompany} roles from dataset`
                : "Search or select a company to view roles"}
            </p>
          </div>

          {rolesViewed && selectedCompany && (
            <button
              onClick={() => openCompany(selectedCompany)}
              className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-black text-white transition hover:bg-indigo-700"
            >
              Open company detail →
            </button>
          )}
        </div>

        {!rolesViewed && (
          <div className="mt-6 rounded-[30px] border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-10 text-center shadow-inner">
            <div className="text-5xl">↔️</div>
            <h3 className="mt-4 text-xl font-black text-slate-900">
              No roles shown yet
            </h3>
            <p className="mt-2 font-semibold text-slate-500">
              Search company or choose from dropdown, then select a company.
            </p>
          </div>
        )}

        {rolesViewed && rolesLoading && (
          <div className="mt-6 rounded-2xl bg-indigo-50 p-5 font-black text-indigo-700">
            Loading roles...
          </div>
        )}

        {rolesViewed && !rolesLoading && roles.length === 0 && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 font-bold text-amber-800">
            No roles found for this company in dataset.
          </div>
        )}

        {rolesViewed && !rolesLoading && roles.length > 0 && (
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {roles.map((role, index) => {
              const skills = role.skills || [];
              const locations = role.locations || [];

              return (
                <div
                  key={index}
                  className="rounded-[30px] border border-indigo-100 bg-gradient-to-br from-white via-slate-50 to-indigo-50/60 p-5 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-100"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-black text-slate-900">
                        {role.roleName}
                      </h3>
                      <p className="mt-2 text-sm font-bold text-slate-500">
                        {locations.slice(0, 4).join(", ") || "Location not specified"}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
                        {role.expectedPackage}
                      </span>
                      <p className="mt-2 text-xs font-bold text-slate-500">
                        {role.expectedExperience}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <h4 className="font-black text-slate-800">Required Skills</h4>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {skills.length ? (
                        skills.map((skill, i) => (
                          <span
                            key={`${skill}-${i}`}
                            className="rounded-full bg-white px-3 py-1 text-xs font-black text-indigo-700 ring-1 ring-indigo-100"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm font-bold text-slate-500">
                          Skill data not available.
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => openRole(selectedCompany, index)}
                    className="mt-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-indigo-100 transition hover:scale-[1.02]"
                  >
                    Open role detail →
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
