import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Companies.css";

import { BACKEND_BASE } from "../lib/config";
const API_BASE = BACKEND_BASE;

export default function CompanyRoleDetail() {
  const navigate = useNavigate();
  const params = useParams();

  const decodedCompanyName = decodeURIComponent(params.companyName || "");
  const roleNumber = Number(params.roleIndex || params.roleId || params.id || 1);
  const selectedIndex = Math.max(roleNumber - 1, 0);

  const [roles, setRoles] = useState([]);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadRole = async () => {
    try {
      setLoading(false);

      const res = await fetch(
        `${API_BASE}/api/companies/${encodeURIComponent(decodedCompanyName)}/roles`
      );

      const data = await res.json();
      const list = Array.isArray(data.roles) ? data.roles : [];

      setRoles(list);
      setRole(list[selectedIndex] || list[0] || null);
    } catch (err) {
      setRoles([]);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRole();
  }, [decodedCompanyName, selectedIndex]);

  const skills = useMemo(() => {
    return Array.isArray(role?.skills) ? role.skills.filter(Boolean) : [];
  }, [role]);

  const locations = useMemo(() => {
    return Array.isArray(role?.locations) ? role.locations.filter(Boolean) : [];
  }, [role]);

  const studyTopics = useMemo(() => {
    const base = skills.slice(0, 4);
    if (base.length >= 4) return base;

    return [
      ...base,
      "role fundamentals",
      "project preparation",
      "interview questions",
      "resume points"
    ].slice(0, 4);
  }, [skills]);

  const prepSteps = useMemo(() => {
    const firstSkills = skills.slice(0, 4).join(", ") || "required skills";

    return [
      `Understand ${role?.roleName || "this role"} work and responsibilities.`,
      `Prepare first: ${firstSkills}.`,
      "Make short notes and practice examples for every skill.",
      "Prepare role-based interview answers and one strong project explanation."
    ];
  }, [role, skills]);

  const youtubeLinks = useMemo(() => {
    const roleName = role?.roleName || "job role";

    const base = [
      {
        title: `${roleName} complete preparation`,
        subtitle: "Role-wise preparation videos",
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(
          `${roleName} complete preparation`
        )}`
      },
      {
        title: `${roleName} interview questions`,
        subtitle: "Role interview questions videos",
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(
          `${roleName} interview questions`
        )}`
      }
    ];

    const skillBased = skills.slice(0, 4).map((skill) => ({
      title: `${skill} preparation`,
      subtitle: "Dataset skill-based YouTube search",
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(
        `${skill} preparation for ${roleName}`
      )}`
    }));

    return [...base, ...skillBased];
  }, [role, skills]);

  

  if (!role) {
    return (
      <div className="company-role-theme-page">
        <button onClick={() => navigate("/companies")} className="company-theme-btn mb-6">
          ← Back to Companies
        </button>

        <section className="company-role-panel p-8">
          <h2>Role data not available</h2>
          <p>Backend did not return roles for this company.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="company-role-theme-page">
      <button
        onClick={() => navigate(`/companies/${encodeURIComponent(decodedCompanyName)}`)}
        className="company-theme-btn mb-6"
      >
        ← Back to Company
      </button>

      <section className="company-role-hero">
        <p className="company-role-kicker">DATASET BASED ROLE PREPARATION</p>
        <h1>{role.roleName}</h1>

        <div className="company-role-summary-grid">
          <div className="company-role-summary-card">
            <p>Company</p>
            <h3>{decodedCompanyName}</h3>
          </div>

          <div className="company-role-summary-card">
            <p>Package</p>
            <h3>{role.expectedPackage || "Package not specified"}</h3>
          </div>

          <div className="company-role-summary-card">
            <p>Experience</p>
            <h3>{role.expectedExperience || "Experience not specified"}</h3>
          </div>

          <div className="company-role-summary-card">
            <p>Skills</p>
            <h3>{skills.length}</h3>
          </div>
        </div>
      </section>

      <div className="company-role-main-grid">
        <section className="company-role-panel p-6">
          <h2>Easy Preparation Plan</h2>

          <div className="company-role-stack mt-5">
            {prepSteps.map((step, index) => (
              <div key={index} className="company-step-card">
                <div className="company-step-number">{index + 1}</div>
                <h3>{step}</h3>
              </div>
            ))}
          </div>
        </section>

        <div className="company-role-stack">
          <section className="company-role-panel p-6">
            <h2>What to Study for This Role</h2>

            <div className="company-role-stack mt-4">
              {studyTopics.map((topic, index) => (
                <div key={`${topic}-${index}`} className="company-step-card">
                  <div className="company-step-number">{index + 1}</div>
                  <h3>{topic}</h3>
                </div>
              ))}
            </div>
          </section>

          <section className="company-role-panel p-6">
            <h2>Required Skills</h2>

            <div className="mt-4 flex flex-wrap gap-3">
              {skills.length ? (
                skills.map((skill, index) => (
                  <span key={`${skill}-${index}`} className="company-role-chip">
                    {skill}
                  </span>
                ))
              ) : (
                <p>Skill data not available.</p>
              )}
            </div>
          </section>

          <section className="company-role-panel p-6">
            <h2>Locations</h2>

            <div className="mt-4 flex flex-wrap gap-3">
              {locations.length ? (
                locations.map((location, index) => (
                  <span key={`${location}-${index}`} className="company-location-chip">
                    {location}
                  </span>
                ))
              ) : (
                <p>Location data not available.</p>
              )}
            </div>
          </section>
        </div>
      </div>

      <section className="company-role-panel mt-8 p-6">
        <h2>YouTube Preparation Links</h2>

        <div className="company-link-grid mt-5">
          {youtubeLinks.map((item, index) => (
            <a
              key={`${item.title}-${index}`}
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="company-link-card"
            >
              <div className="company-link-icon">▶</div>
              <div>
                <h4>{item.title}</h4>
                <p>{item.subtitle}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {roles.length > 1 && (
        <section className="company-role-panel mt-8 p-6">
          <h2>Other Roles in This Company</h2>

          <div className="mt-5 flex flex-wrap gap-3">
            {roles.map((item, index) => (
              <button
                key={`${item.roleName}-${index}`}
                onClick={() =>
                  navigate(`/companies/${encodeURIComponent(decodedCompanyName)}/roles/${index + 1}`)
                }
                className="company-theme-btn"
              >
                {item.roleName}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
