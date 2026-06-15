import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Companies.css";
import { BACKEND_BASE } from "../lib/config";

const API_BASE = BACKEND_BASE;

function makeInstantRoles(companyName) {
  const name = String(companyName || "Company").trim();

  return [
    {
      roleName: "Software Engineer",
      expectedPackage: "Dataset syncing",
      expectedExperience: "Freshers / Entry Level",
      locations: ["India", "Remote / Hybrid"],
      skills: ["DSA", "Java", "Python", "SQL", "React"]
    },
    {
      roleName: "Associate Software Engineer",
      expectedPackage: "Dataset syncing",
      expectedExperience: "0-2 years",
      locations: ["India"],
      skills: ["Programming", "Problem Solving", "OOPs", "Database"]
    },
    {
      roleName: "Data Analyst",
      expectedPackage: "Dataset syncing",
      expectedExperience: "Freshers / Entry Level",
      locations: ["India"],
      skills: ["Excel", "SQL", "Python", "Data Analysis"]
    },
    {
      roleName: `${name} Interview Preparation`,
      expectedPackage: "Dataset syncing",
      expectedExperience: "Role based",
      locations: ["Company specific"],
      skills: ["Aptitude", "Communication", "Resume Projects", "HR Questions"]
    }
  ];
}

function readCompanySnapshot(companyName) {
  try {
    const raw = sessionStorage.getItem(`skillyatra_company_snapshot:${companyName}`);
    if (raw) return JSON.parse(raw);

    const cacheKeys = [
      "skillyatra_companies_cache_v5",
      "skillyatra_companies_cache_v2"
    ];

    for (const key of cacheKeys) {
      const cached = sessionStorage.getItem(key);
      if (!cached) continue;

      const parsed = JSON.parse(cached);
      const list = parsed?.data?.companies || parsed?.companies || [];

      const found = Array.isArray(list)
        ? list.find((item) => String(item.companyName || "").toLowerCase() === String(companyName || "").toLowerCase())
        : null;

      if (found) return found;
    }
  } catch {}

  return null;
}

function saveCompanySnapshot(companyName, company) {
  try {
    sessionStorage.setItem(
      `skillyatra_company_snapshot:${companyName}`,
      JSON.stringify(company)
    );
  } catch {}
}

export default function CompanyDetail() {
  const navigate = useNavigate();
  const params = useParams();

  const companyName = decodeURIComponent(params.companyName || params.name || "");
  const instantCompany =
    readCompanySnapshot(companyName) || {
      companyName,
      totalJobCount: 0,
      roles: makeInstantRoles(companyName)
    };

  const [company, setCompany] = useState(instantCompany);
  const [roles, setRoles] = useState(
    Array.isArray(instantCompany?.roles) && instantCompany.roles.length
      ? instantCompany.roles
      : makeInstantRoles(companyName)
  );

  useEffect(() => {
    saveCompanySnapshot(companyName, {
      ...company,
      companyName,
      roles
    });

    const urls = [
      `${API_BASE}/api/companies/${encodeURIComponent(companyName)}/roles`,
      `${API_BASE}/companies/${encodeURIComponent(companyName)}/roles`
    ];

    urls.forEach((url) => {
      fetch(url, {
        method: "GET",
        cache: "no-store",
        mode: "cors"
      })
        .then((res) => res.json())
        .then((data) => {
          const nextRoles = Array.isArray(data?.roles) ? data.roles : [];

          if (nextRoles.length) {
            const nextCompany = {
              ...(data.company || company || {}),
              companyName,
              totalJobCount: nextRoles.length,
              roles: nextRoles
            };

            setCompany(nextCompany);
            setRoles(nextRoles);
            saveCompanySnapshot(companyName, nextCompany);
          }
        })
        .catch(() => {});
    });
  }, [companyName]);

  const topSkills = useMemo(() => {
    const all = roles.flatMap((role) => Array.isArray(role.skills) ? role.skills : []);
    return [...new Set(all)].slice(0, 18);
  }, [roles]);

  const openRole = (index) => {
    try {
      sessionStorage.setItem(
        `skillyatra_selected_role:${companyName}:${index + 1}`,
        JSON.stringify({ companyName, role: roles[index] })
      );
    } catch {}

    navigate(`/companies/${encodeURIComponent(companyName)}/roles/${index + 1}`);
  };

  return (
    <div className="company-role-page">
      <div className="company-role-shell">
        <button type="button" onClick={() => navigate("/companies")} className="company-theme-btn">
          ← Back to Companies
        </button>

        <section className="role-detail-hero">
          <p>COMPANY WISE PREPARATION</p>
          <h1>{companyName}</h1>
          <span>{roles.length} roles ready</span>
        </section>

        <section className="role-detail-stats">
          <div>
            <span>Company</span>
            <strong>{companyName}</strong>
          </div>
          <div>
            <span>Roles</span>
            <strong>{roles.length}</strong>
          </div>
          <div>
            <span>Dataset Jobs</span>
            <strong>{company?.totalJobCount || roles.length}</strong>
          </div>
          <div>
            <span>Status</span>
            <strong>Ready</strong>
          </div>
        </section>

        <section className="role-detail-card">
          <p className="role-detail-kicker">JOB ROLES</p>
          <h2>{companyName} Roles</h2>
          <p className="role-detail-subtitle">
            Select a role to open the role-wise preparation roadmap, required skills, and YouTube preparation links.
          </p>

          <div className="roles-grid">
            {roles.map((role, index) => {
              const skills = Array.isArray(role.skills) ? role.skills : [];
              const locations = Array.isArray(role.locations) ? role.locations : [];

              return (
                <article key={`${role.roleName}-${index}`} className="role-item">
                  <h3>{role.roleName || `Role ${index + 1}`}</h3>

                  <p className="role-location">
                    {locations.slice(0, 4).join(", ") || "Location not specified"}
                  </p>

                  <div className="role-meta">
                    <span>{role.expectedPackage || "Package not specified"}</span>
                    <span>{role.expectedExperience || "Experience not specified"}</span>
                  </div>

                  <h4>Required Skills</h4>

                  <div className="skill-wrap">
                    {skills.length ? (
                      skills.slice(0, 8).map((skill, i) => <span key={`${skill}-${i}`}>{skill}</span>)
                    ) : (
                      <span>Skill data not available</span>
                    )}
                  </div>

                  <button type="button" onClick={() => openRole(index)}>
                    Open role detail →
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        <section className="role-detail-card">
          <p className="role-detail-kicker">TOP SKILLS</p>
          <h2>Common Skills to Prepare</h2>

          <div className="role-chip-list">
            {(topSkills.length ? topSkills : ["DSA", "Aptitude", "Projects", "Communication"]).map((skill, index) => (
              <span key={`${skill}-${index}`}>{skill}</span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
