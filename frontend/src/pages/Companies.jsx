import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Companies.css";
import { API_BASE } from "../lib/config";

const COMPANIES_CACHE_KEY = "skillyatra_companies_cache_v7";
const ROLES_CACHE_PREFIX = "skillyatra_company_roles_cache_v7";
const CACHE_TIME = 1000 * 60 * 60;

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
  { companyName: "IBM", totalJobCount: 90 },
  { companyName: "Flipkart", totalJobCount: 60 },
  { companyName: "Deloitte", totalJobCount: 85 },
  { companyName: "HCL", totalJobCount: 70 },
  { companyName: "Tech Mahindra", totalJobCount: 75 },
  { companyName: "LTIMindtree", totalJobCount: 65 },
  { companyName: "Mastercard", totalJobCount: 40 },
  { companyName: "Oracle", totalJobCount: 55 },
  { companyName: "Adobe", totalJobCount: 45 },
  { companyName: "Paytm", totalJobCount: 35 },
  { companyName: "PhonePe", totalJobCount: 38 },
  { companyName: "Zomato", totalJobCount: 34 },
  { companyName: "Swiggy", totalJobCount: 32 }
];

const COMPANY_ALIASES = {
  google: ["google india"],
  amazon: ["amazon india"],
  microsoft: ["microsoft india"],
  infosys: ["infosys limited"],
  tcs: ["tata consultancy services", "tata consultancy service"],
  wipro: ["wipro limited"],
  accenture: ["accenture india"],
  capgemini: ["cap gemini", "capgemini india"],
  cognizant: ["cts", "cognizant technology solutions"],
  ibm: ["international business machines", "ibm india"],
  deloitte: ["deloitte usi", "deloitte india", "deloitte consulting", "deloitree", "deloitee"],
  flipkart: ["flip kart", "flipkart internet"],
  hcl: ["hcltech", "hcl technologies"],
  techmahindra: ["tech mahindra"],
  ltimindtree: ["lti", "mindtree", "lti mindtree"],
  mastercard: ["master card"],
  oracle: ["oracle india"],
  adobe: ["adobe india"],
  paytm: ["paytm india"],
  phonepe: ["phone pe"],
  zomato: ["zomato india"],
  swiggy: ["swiggy india"]
};

function normalize(value = "") {
  return String(value).toLowerCase().replace(/[^a-z0-9]/g, "");
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

function getAliases(companyName = "") {
  const key = normalize(companyName);
  return COMPANY_ALIASES[key] || [];
}

function uniqueCompanies(list = []) {
  const map = new Map();

  list.forEach((item) => {
    if (!item?.companyName) return;
    const key = normalize(item.companyName);

    if (!map.has(key)) {
      map.set(key, item);
    } else {
      const existing = map.get(key);
      map.set(key, {
        ...existing,
        ...item,
        totalJobCount:
          Number(item.totalJobCount || 0) > Number(existing.totalJobCount || 0)
            ? item.totalJobCount
            : existing.totalJobCount
      });
    }
  });

  return Array.from(map.values());
}

function mergeCompanies(prev = [], next = []) {
  return uniqueCompanies([...(prev || []), ...(next || [])]).sort((a, b) =>
    String(a.companyName || "").localeCompare(String(b.companyName || ""))
  );
}

function levenshtein(a = "", b = "") {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i += 1) dp[i][0] = i;
  for (let j = 0; j <= n; j += 1) dp[0][j] = j;

  for (let i = 1; i <= m; i += 1) {
    for (let j = 1; j <= n; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }

  return dp[m][n];
}

function getCompanyMatchScore(company, query) {
  const q = normalize(query);
  if (!q) return 0;

  const name = normalize(company?.companyName || "");
  const aliases = getAliases(company?.companyName || "").map(normalize);
  const all = [name, ...aliases].filter(Boolean);

  if (all.some((item) => item === q)) return 100;
  if (all.some((item) => item.startsWith(q))) return 94;
  if (all.some((item) => item.includes(q))) return 86;

  let best = 0;

  for (const item of all) {
    const dist = levenshtein(q, item);
    const maxLen = Math.max(q.length, item.length) || 1;
    const similarity = 1 - dist / maxLen;

    if (similarity >= 0.58) {
      best = Math.max(best, Math.round(similarity * 76));
    }
  }

  return best;
}

function makeInstantRoles(companyName) {
  const label = companyName || "Company";

  return [
    {
      roleName: "Software Engineer",
      expectedPackage: "Package not specified in dataset",
      expectedExperience: "Freshers / Entry Level",
      locations: ["India"],
      skills: ["DSA", "Java", "Python", "SQL", "OOPs"]
    },
    {
      roleName: "Associate Software Engineer",
      expectedPackage: "Package not specified in dataset",
      expectedExperience: "0-2 years",
      locations: ["India"],
      skills: ["Problem Solving", "Programming", "DBMS", "OS"]
    },
    {
      roleName: "Data Analyst",
      expectedPackage: "Package not specified in dataset",
      expectedExperience: "Freshers / Entry Level",
      locations: ["India"],
      skills: ["Excel", "SQL", "Python", "Data Analysis"]
    },
    {
      roleName: `${label} Interview Preparation`,
      expectedPackage: "Package not specified in dataset",
      expectedExperience: "Role based",
      locations: ["Company specific"],
      skills: ["Aptitude", "Communication", "Projects", "Resume"]
    }
  ];
}

function saveCompanySnapshot(companyName, roles = [], company = {}) {
  try {
    sessionStorage.setItem(
      `skillyatra_company_snapshot:${companyName}`,
      JSON.stringify({
        ...company,
        companyName,
        roles
      })
    );
  } catch {}
}

export default function Companies() {
  const navigate = useNavigate();

  const [companies, setCompanies] = useState(() => {
    const cached = readCache(COMPANIES_CACHE_KEY);
    return cached?.companies?.length
      ? mergeCompanies(cached.companies, INSTANT_COMPANIES)
      : INSTANT_COMPANIES;
  });

  const [selectedCompany, setSelectedCompany] = useState("");
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState("");
  const [dropdownCompany, setDropdownCompany] = useState("");
  const [companyMenuOpen, setCompanyMenuOpen] = useState(false);
  const [searchedOnce, setSearchedOnce] = useState(false);
  const [rolesViewed, setRolesViewed] = useState(false);
  const [error, setError] = useState("");

  const cachedBase = readCache(COMPANIES_CACHE_KEY);
  const [totalCompanies, setTotalCompanies] = useState(cachedBase?.totalCompanies || 0);
  const [totalJobRows, setTotalJobRows] = useState(cachedBase?.totalJobRows || 0);

  const storeCompanies = (list, meta = {}) => {
    const merged = mergeCompanies(companies, list);

    setCompanies(merged);
    setTotalCompanies(meta.totalCompanies || meta.totalAllCompanies || merged.length || 0);
    setTotalJobRows(meta.totalJobRows || totalJobRows || 0);

    writeCache(COMPANIES_CACHE_KEY, {
      companies: merged,
      totalCompanies: meta.totalCompanies || meta.totalAllCompanies || merged.length || 0,
      totalJobRows: meta.totalJobRows || totalJobRows || 0
    });
  };

  const loadCompanies = async ({ force = false } = {}) => {
    const cached = !force ? readCache(COMPANIES_CACHE_KEY) : null;

    if (cached?.companies?.length) {
      setCompanies(mergeCompanies(cached.companies, INSTANT_COMPANIES));
      setTotalCompanies(cached.totalCompanies || cached.companies.length || 0);
      setTotalJobRows(cached.totalJobRows || 0);
    }

    try {
      setError("");

      const res = await fetch(`${API_BASE}/companies?limit=50000`, {
        method: "GET",
        cache: "no-store",
        mode: "cors"
      });

      const data = await res.json();
      const list = Array.isArray(data?.companies) ? data.companies : [];

      if (list.length) {
        storeCompanies(list, data);
      }
    } catch {
      // keep instant companies visible
    }
  };

  const searchCompaniesFromBackend = async (query) => {
    const q = String(query || "").trim();
    if (!q) return;

    const urls = [
      `${API_BASE}/companies?search=${encodeURIComponent(q)}&limit=50000`,
      `${API_BASE}/companies?q=${encodeURIComponent(q)}&limit=50000`,
      `${API_BASE}/companies?keyword=${encodeURIComponent(q)}&limit=50000`,
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
          storeCompanies(list, data);
          return;
        }
      } catch {}
    }
  };

  const rankedCompanies = useMemo(() => {
    const q = search.trim();
    if (!q) return [];

    return companies
      .map((company) => ({
        company,
        score: getCompanyMatchScore(company, q)
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return String(a.company.companyName || "").localeCompare(
          String(b.company.companyName || "")
        );
      })
      .map((item) => item.company);
  }, [companies, search]);

  const searchSuggestions = useMemo(() => rankedCompanies.slice(0, 12), [rankedCompanies]);
  const searchedCompanies = useMemo(() => rankedCompanies.slice(0, 100), [rankedCompanies]);

  const dropdownCompanies = useMemo(() => {
    return uniqueCompanies(companies).sort((a, b) =>
      String(a.companyName || "").localeCompare(String(b.companyName || ""))
    );
  }, [companies]);

  const loadRoles = async (companyName) => {
    if (!companyName) return;

    const key = roleCacheKey(companyName);
    const cached = readCache(key);
    const companyFromList = companies.find(
      (item) => normalize(item.companyName) === normalize(companyName)
    );

    setSelectedCompany(companyName);
    setRolesViewed(true);
    setSearchedOnce(true);

    if (cached?.roles?.length) {
      setRoles(cached.roles);
      saveCompanySnapshot(companyName, cached.roles, companyFromList || {});
    } else if (companyFromList?.roles?.length) {
      setRoles(companyFromList.roles);
      writeCache(key, { roles: companyFromList.roles });
      saveCompanySnapshot(companyName, companyFromList.roles, companyFromList);
    } else {
      const instantRoles = makeInstantRoles(companyName);
      setRoles(instantRoles);
      writeCache(key, { roles: instantRoles });
      saveCompanySnapshot(companyName, instantRoles, companyFromList || {});
    }

    fetch(`${API_BASE}/companies/${encodeURIComponent(companyName)}/roles`, {
      method: "GET",
      cache: "no-store",
      mode: "cors"
    })
      .then((res) => res.json())
      .then((data) => {
        const nextRoles = Array.isArray(data?.roles) ? data.roles : [];
        if (nextRoles.length) {
          setRoles(nextRoles);
          writeCache(key, { roles: nextRoles });
          saveCompanySnapshot(companyName, nextRoles, companyFromList || {});
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const handleSearch = async () => {
    setSearchedOnce(true);
    setCompanyMenuOpen(false);

    if (search.trim().length >= 2) {
      await searchCompaniesFromBackend(search);
    }

    if (searchedCompanies.length > 0) {
      const best = searchedCompanies[0];
      setSearch(best.companyName);
      setDropdownCompany(best.companyName);
      loadRoles(best.companyName);
      return;
    }

    const instantMatch = INSTANT_COMPANIES.find(
      (item) => getCompanyMatchScore(item, search) > 0
    );

    if (instantMatch) {
      setSearch(instantMatch.companyName);
      setDropdownCompany(instantMatch.companyName);
      loadRoles(instantMatch.companyName);
      return;
    }

    setSelectedCompany("");
    setRoles([]);
    setRolesViewed(false);
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
    saveCompanySnapshot(companyName, roles.length ? roles : makeInstantRoles(companyName));
    navigate(`/companies/${encodeURIComponent(companyName)}`);
  };

  const openRole = (companyName, roleIndex) => {
    if (!companyName) return;

    try {
      sessionStorage.setItem(
        `skillyatra_selected_role:${companyName}:${roleIndex + 1}`,
        JSON.stringify({
          companyName,
          role: roles[roleIndex] || makeInstantRoles(companyName)[0]
        })
      );
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

                  if (value.trim().length >= 2) {
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
                  loadCompanies({ force: false });
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

          {error && <div className="company-alert error">{error}</div>}

          {!search.trim() && !rolesViewed && (
            <div className="company-start-box">
              <h3>🔍 Search company to start</h3>
              <p>Type company name and suggestions will appear instantly.</p>
            </div>
          )}

          {search.trim() && searchedOnce && searchedCompanies.length === 0 && (
            <div className="company-start-box">
              <h3>No exact company match found for "{search}".</h3>
              <p>Try another spelling or choose from dropdown.</p>
            </div>
          )}

          {search.trim() && searchedCompanies.length > 0 && (
            <div className="company-options">
              <div className="company-options-head">
                <div>
                  <h2>Matching Companies</h2>
                  <p>Click company to load roles instantly.</p>
                </div>

                {selectedCompany && (
                  <button type="button" onClick={() => openCompany(selectedCompany)}>
                    Open company detail →
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
                        setSearch(company.companyName);
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

          {rolesViewed && roles.length === 0 && (
            <div className="empty-roles">
              <h3>No roles available right now.</h3>
              <p>Select another company or refresh the search.</p>
            </div>
          )}

          {rolesViewed && roles.length > 0 && (
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
                      <span>{role.expectedPackage || "Package not specified in dataset"}</span>
                      <span>{role.expectedExperience || "Experience not specified in dataset"}</span>
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
