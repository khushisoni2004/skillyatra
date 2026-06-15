import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Companies.css";
import { API_BASE } from "../lib/config";

const COMPANIES_CACHE_KEY = "skillyatra_companies_cache_v5";
const ROLES_CACHE_PREFIX = "skillyatra_company_roles_cache_v5";
const CACHE_TIME = 1000 * 60 * 30;

const INSTANT_COMPANIES = [
  { companyName: "Google", totalJobCount: 75 },
  { companyName: "Amazon", totalJobCount: 248 },
  { companyName: "Microsoft", totalJobCount: 80 },
  { companyName: "Infosys", totalJobCount: 120 },
  { companyName: "TCS", totalJobCount: 150 },
  { companyName: "Wipro", totalJobCount: 110 },
  { companyName: "Accenture", totalJobCount: 130 },
  { companyName: "Capgemini", totalJobCount: 95 },
  { companyName: "Cognizant", totalJobCount: 100 },
  { companyName: "IBM", totalJobCount: 90 }
];

function mergeCompanies(oldList, newList) {
  const map = new Map();

  [...(oldList || []), ...(newList || [])].forEach((item) => {
    const name = item?.companyName;
    if (!name) return;
    map.set(String(name).toLowerCase(), item);
  });

  return Array.from(map.values()).sort((a, b) =>
    String(a.companyName || "").localeCompare(String(b.companyName || ""))
  );
}

function readCache(key) {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed?.time || !parsed?.data) return null;

    if (Date.now() - parsed.time > CACHE_TIME) {
      sessionStorage.removeItem(key);
      return null;
    }

    return parsed.data;
  } catch {
    return null;
  }
}

function writeCache(key, data) {
  try {
    sessionStorage.setItem(
      key,
      JSON.stringify({
        time: Date.now(),
        data
      })
    );
  } catch {}
}

function roleCacheKey(companyName) {
  return `${ROLES_CACHE_PREFIX}:${companyName}`;
}

export default function Companies() {
  const navigate = useNavigate();

  const [companies, setCompanies] = useState(() => readCache(COMPANIES_CACHE_KEY)?.companies || INSTANT_COMPANIES);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [roles, setRoles] = useState([]);

  const [search, setSearch] = useState("");
  const [dropdownCompany, setDropdownCompany] = useState("");
  const [companyMenuOpen, setCompanyMenuOpen] = useState(false);

  const [totalCompanies, setTotalCompanies] = useState(() => readCache(COMPANIES_CACHE_KEY)?.totalCompanies || 2000);
  const [totalJobRows, setTotalJobRows] = useState(() => readCache(COMPANIES_CACHE_KEY)?.totalJobRows || 104128);

  const [loading, setLoading] = useState(false);
  const [softUpdating, setSoftUpdating] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(false);

  const [error, setError] = useState("");
  const [searchedOnce, setSearchedOnce] = useState(false);
  const [rolesViewed, setRolesViewed] = useState(false);

  const applyCompaniesData = (data) => {
    const list = Array.isArray(data?.companies) ? data.companies : [];

    setCompanies((prev) => mergeCompanies(prev, list));
    setTotalCompanies(data?.totalCompanies || data?.totalAllCompanies || list.length || 0);
    setTotalJobRows(data?.totalJobRows || 0);
  };

  const loadCompanies = async ({ force = false } = {}) => {
    const cached = !force ? readCache(COMPANIES_CACHE_KEY) : null;

    // Instant UI: never block page for companies API.
    if (cached) {
      applyCompaniesData(cached);
    } else if (!companies.length) {
      setCompanies(INSTANT_COMPANIES);
      setTotalCompanies(2000);
      setTotalJobRows(104128);
    }

    setLoading(false);
    setSoftUpdating(false);

    try {
      setError("");

      const res = await fetch(`${API_BASE}/companies?limit=50000`, {
        method: "GET",
        cache: "no-store",
        mode: "cors"
      });

      const data = await res.json();

      if (data?.ok) {
        writeCache(COMPANIES_CACHE_KEY, data);
        applyCompaniesData(data);
      }
    } catch {
      // Keep instant companies visible. Do not show loading or error on first screen.
    } finally {
      setLoading(false);
      setSoftUpdating(false);
    }
  };

  const loadRoles = async (companyName) => {
    if (!companyName) return;

    const key = roleCacheKey(companyName);
    const cached = readCache(key);

    setSelectedCompany(companyName);
    setRolesViewed(true);
    setSearchedOnce(true);
    setRolesLoading(false);

    const companyFromList = companies.find(
      (item) =>
        String(item.companyName || "").toLowerCase() ===
        String(companyName || "").toLowerCase()
    );

    if (cached) {
      setRoles(Array.isArray(cached.roles) ? cached.roles : []);
    } else if (Array.isArray(companyFromList?.roles) && companyFromList.roles.length) {
      setRoles(companyFromList.roles);
      writeCache(key, { roles: companyFromList.roles });
    } else {
      setRoles([]);
    }

    // Backend roles load in background. UI never blocks.
    fetch(`${API_BASE}/companies/${encodeURIComponent(companyName)}/roles`, {
      method: "GET",
      cache: "no-store",
      mode: "cors"
    })
      .then((res) => res.json())
      .then((data) => {
        const nextRoles = Array.isArray(data?.roles) ? data.roles : [];
        writeCache(key, { roles: nextRoles });
        setRoles(nextRoles);
      })
      .catch(() => {})
      .finally(() => {
        setRolesLoading(false);
      });
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
      .slice(0, 300);
  }, [companies, search]);

  const dropdownCompanies = useMemo(() => {
    return companies
      .filter((company) => company.companyName)
      .sort((a, b) =>
        String(a.companyName).localeCompare(String(b.companyName))
      );
  }, [companies]);

  const searchSuggestions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];

    return companies
      .filter((company) =>
        String(company.companyName || "").toLowerCase().includes(q)
      )
      .slice(0, 20);
  }, [companies, search]);

  const searchCompaniesFromBackend = async (query) => {
    const q = String(query || "").trim();
    if (!q) return [];

    const urls = [
      `${API_BASE}/companies?search=${encodeURIComponent(q)}&limit=50000`,
      `${API_BASE}/companies?q=${encodeURIComponent(q)}&limit=50000`,
      `${API_BASE}/api/companies?search=${encodeURIComponent(q)}&limit=50000`,
      `${API_BASE}/api/companies?q=${encodeURIComponent(q)}&limit=50000`
    ];

    for (const url of urls) {
      try {
        const res = await fetch(url, {
          method: "GET",
          cache: "no-store",
          mode: "cors"
        });

        const data = await res.json();
        const list = Array.isArray(data?.companies) ? data.companies : [];

        if (list.length) {
          const merged = mergeCompanies(companies, list);
          setCompanies(merged);
          writeCache(COMPANIES_CACHE_KEY, {
            companies: merged,
            totalCompanies: data?.totalCompanies || data?.totalAllCompanies || merged.length,
            totalJobRows: data?.totalJobRows || totalJobRows
          });
          return list;
        }
      } catch {}
    }

    return [];
  };

  const handleSearch = async () => {
    const q = search.trim();

    setSearchedOnce(true);
    setSelectedCompany("");
    setRoles([]);
    setRolesViewed(false);
    setDropdownCompany("");
    setCompanyMenuOpen(false);

    if (q.length >= 2) {
      await searchCompaniesFromBackend(q);
    }
  };

  const handleDropdownChange = (companyName) => {
    setDropdownCompany(companyName);
    setSearch(companyName);
    setCompanyMenuOpen(false);

    if (companyName) {
      loadRoles(companyName);
    } else {
      setSelectedCompany("");
      setRoles([]);
      setRolesViewed(false);
      setSearchedOnce(false);
    }
  };

  const openCompany = (companyName) => {
    if (!companyName) return;
    navigate(`/companies/${encodeURIComponent(companyName)}`);
  };

  const openRole = (companyName, roleIndex) => {
    if (!companyName) return;

    try {
      const role = roles[roleIndex] || null;
      if (role) {
        sessionStorage.setItem(
          `skillyatra_selected_role:${companyName}:${roleIndex + 1}`,
          JSON.stringify({ companyName, role })
        );
      }
    } catch {}

    navigate(`/companies/${encodeURIComponent(companyName)}/roles/${roleIndex + 1}`);
  };

  return (
    <div className="companies-page">
      <div className="companies-shell">
        <section className="companies-hero">
          <div>
            <p className="companies-eyebrow">Company Wise Preparation</p>
            <h1>Company + Job Roles</h1>
            <p>
              Search or select a company from dropdown to view real dataset roles,
              required skills, locations and role-wise preparation.
            </p>
          </div>

          <div className="companies-stats">
            <div className="company-stat-card">
              <span>Selected Company</span>
              <strong>{selectedCompany || "Search first"}</strong>
            </div>

            <div className="company-stat-card">
              <span>Companies Loaded</span>
              <strong>{totalCompanies || companies.length || 0}</strong>
            </div>

            <div className="company-stat-card">
              <span>Dataset Job Rows</span>
              <strong>{totalJobRows || 0}</strong>
            </div>

            <div className="company-stat-card">
              <span>Roles Loaded</span>
              <strong>{rolesViewed ? roles.length : 0}</strong>
            </div>
          </div>
        </section>

        <section className="companies-card">
          <div className="companies-toolbar">
            <div className="company-search-box">
              <label>🔍 Search Company</label>

              <input
                value={search}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearch(value);
                  setSearchedOnce(false);
                  setSelectedCompany("");
                  setRoles([]);
                  setRolesViewed(false);
                  setDropdownCompany("");

                  if (value.trim().length >= 3) {
                    searchCompaniesFromBackend(value);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                placeholder="Google, Amazon, Infosys, TCS..."
              />

              {search.trim() && searchSuggestions.length > 0 && !selectedCompany && (
                <div className="company-suggestions">
                  {searchSuggestions.map((company) => (
                    <button
                      key={company.companyName}
                      type="button"
                      onClick={() => {
                        setSearch(company.companyName);
                        setDropdownCompany(company.companyName);
                        setCompanyMenuOpen(false);
                        loadRoles(company.companyName);
                      }}
                    >
                      <span>{company.companyName}</span>
                      <small>{company.totalJobCount || 0} jobs</small>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="company-dropdown-box">
              <label>▾ Company Dropdown</label>

              <button
                type="button"
                className="company-dropdown-trigger"
                onClick={() => {
                  setCompanyMenuOpen((value) => !value);
                  loadCompanies({ force: true });
                  searchCompaniesFromBackend(search || "a");
                }}
              >
                <span>{dropdownCompany || "Select company directly"}</span>
                <b>{companyMenuOpen ? "▲" : "▼"}</b>
              </button>

              {companyMenuOpen && (
                <div className="company-dropdown-menu">
                  <p>Select Company</p>

                  {dropdownCompanies.map((company) => {
                    const active = dropdownCompany === company.companyName;

                    return (
                      <button
                        key={company.companyName}
                        type="button"
                        onClick={() => handleDropdownChange(company.companyName)}
                        className={active ? "active" : ""}
                      >
                        <span>{company.companyName}</span>
                        <small>{company.totalJobCount || 0} jobs</small>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button type="button" onClick={handleSearch} className="company-search-btn">
              Search →
            </button>
          </div>

          {false && loading && (
            <div className="company-alert loading">Loading companies...</div>
          )}

          {false && softUpdating && (
            <div className="company-alert loading">Refreshing companies in background...</div>
          )}

          {error && <div className="company-alert error">{error}</div>}

          {!search.trim() && (
            <div className="company-start-box">
              <h3>🔍 Search company to start</h3>
              <p>No job role data is shown before search or dropdown selection.</p>
            </div>
          )}

          {search.trim() && searchedOnce && searchedCompanies.length === 0 && (
            <div className="company-start-box">
              <h3>No company found in dataset for "{search}".</h3>
            </div>
          )}

          {search.trim() && searchedOnce && searchedCompanies.length > 0 && (
            <div className="company-options">
              <div className="company-options-head">
                <div>
                  <h2>Company Option Bar</h2>
                  <p>Click company to load roles. Company detail opens only from detail button.</p>
                </div>

                {selectedCompany && (
                  <button type="button" onClick={() => openCompany(selectedCompany)}>
                    Company Detail →
                  </button>
                )}
              </div>

              <div className="company-chip-grid">
                {searchedCompanies.map((company) => {
                  const active = selectedCompany === company.companyName;

                  return (
                    <button
                      key={company.companyName}
                      type="button"
                      onClick={() => {
                        setDropdownCompany(company.companyName);
                        loadRoles(company.companyName);
                      }}
                      className={active ? "active" : ""}
                    >
                      <strong>{company.companyName}</strong>
                      <span>{company.totalJobCount || 0} jobs</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        <section className="companies-card roles-card">
          <div className="roles-head">
            <div>
              <h2>Job Roles</h2>
              <p>
                {rolesViewed && selectedCompany
                  ? `${selectedCompany} roles from dataset`
                  : "Search or select a company to view roles"}
              </p>
            </div>

            {rolesViewed && selectedCompany && (
              <button type="button" onClick={() => openCompany(selectedCompany)}>
                Open company detail →
              </button>
            )}
          </div>

          {!rolesViewed && (
            <div className="empty-roles">
              <div>↔️</div>
              <h3>No roles shown yet</h3>
              <p>Search company or choose from dropdown, then select a company.</p>
            </div>
          )}

          {rolesViewed && !rolesLoading && roles.length === 0 && (
            <div className="empty-roles">
              <h3>Roles are syncing from dataset. Select another company or wait a moment.</h3>
            </div>
          )}

          {rolesViewed && !rolesLoading && roles.length > 0 && (
            <div className="roles-grid">
              {roles.map((role, index) => {
                const skills = role.skills || [];
                const locations = role.locations || [];

                return (
                  <article key={`${role.roleName}-${index}`} className="role-item">
                    <h3>{role.roleName}</h3>

                    <p className="role-location">
                      {locations.slice(0, 4).join(", ") || "Location not specified"}
                    </p>

                    <div className="role-meta">
                      <span>{role.expectedPackage}</span>
                      <span>{role.expectedExperience}</span>
                    </div>

                    <h4>Required Skills</h4>

                    <div className="skill-wrap">
                      {skills.length ? (
                        skills.map((skill, i) => <span key={`${skill}-${i}`}>{skill}</span>)
                      ) : (
                        <span>Skill data not available.</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => openRole(selectedCompany, index)}
                    >
                      Open role detail →
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
