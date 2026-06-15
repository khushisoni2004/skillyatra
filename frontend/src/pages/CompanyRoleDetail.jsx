import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Companies.css";
import { BACKEND_BASE } from "../lib/config";

const API_BASE = BACKEND_BASE;
const YOUTUBE_LOGO = "https://www.google.com/s2/favicons?domain=youtube.com&sz=128";

function cleanList(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function makeYoutubeSearch(query) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

function makeInstantRole(companyName, roleName = "Software Engineer") {
  return {
    roleName,
    expectedPackage: "Package not specified in dataset",
    expectedExperience: "Experience not specified in dataset",
    locations: ["India"],
    skills: ["DSA", "Java", "Python", "SQL", "OOPs"]
  };
}

function readSelectedRole(companyName, roleNumber) {
  try {
    const selected = sessionStorage.getItem(`skillyatra_selected_role:${companyName}:${roleNumber}`);
    if (selected) {
      const parsed = JSON.parse(selected);
      if (parsed?.role) return parsed.role;
    }

    const snapshot = sessionStorage.getItem(`skillyatra_company_snapshot:${companyName}`);
    if (snapshot) {
      const parsed = JSON.parse(snapshot);
      const index = Math.max(Number(roleNumber || 1) - 1, 0);
      if (Array.isArray(parsed?.roles) && parsed.roles[index]) {
        return parsed.roles[index];
      }
    }
  } catch {}

  return makeInstantRole(companyName);
}

export default function CompanyRoleDetail() {
  const navigate = useNavigate();
  const params = useParams();

  const decodedCompanyName = decodeURIComponent(params.companyName || "");
  const roleNumber = Number(params.roleIndex || params.roleId || params.id || 1);
  const selectedIndex = Math.max(roleNumber - 1, 0);

  const [roles, setRoles] = useState([]);
  const [role, setRole] = useState(() => readSelectedRole(decodedCompanyName, roleNumber));

  useEffect(() => {
    const urls = [
      `${API_BASE}/api/companies/${encodeURIComponent(decodedCompanyName)}/roles`,
      `${API_BASE}/companies/${encodeURIComponent(decodedCompanyName)}/roles`
    ];

    urls.forEach((url) => {
      fetch(url, {
        method: "GET",
        cache: "no-store",
        mode: "cors"
      })
        .then((res) => res.json())
        .then((data) => {
          const list = Array.isArray(data?.roles) ? data.roles : [];
          if (list.length) {
            setRoles(list);

            const selected = list[selectedIndex] || list[0] || role;
            if (selected) {
              setRole(selected);
              sessionStorage.setItem(
                `skillyatra_selected_role:${decodedCompanyName}:${roleNumber}`,
                JSON.stringify({ companyName: decodedCompanyName, role: selected })
              );
            }
          }
        })
        .catch(() => {});
    });
  }, [decodedCompanyName, selectedIndex, roleNumber]);

  const skills = useMemo(() => cleanList(role?.skills), [role]);
  const locations = useMemo(() => cleanList(role?.locations), [role]);

  const roadmap = useMemo(() => {
    const roleName = role?.roleName || "this role";
    const first = skills[0] || "role fundamentals";
    const second = skills[1] || "practical skills";
    const third = skills[2] || "project work";
    const fourth = skills[3] || "interview preparation";

    return [
      {
        title: "Understand the role",
        text: `Read the ${roleName} job description and understand daily responsibilities for ${decodedCompanyName}.`
      },
      {
        title: `Build base in ${first}`,
        text: `Start with fundamentals of ${first}. Make short notes and revise important definitions.`
      },
      {
        title: `Practice ${second}`,
        text: `Solve small examples and practical questions related to ${second}.`
      },
      {
        title: "Create one mini project",
        text: `Use ${third} and make one role-based mini project for resume discussion.`
      },
      {
        title: "Prepare interview answers",
        text: `Prepare HR + technical answers around ${roleName}, projects, skills and company requirements.`
      },
      {
        title: "Final revision",
        text: `Revise ${fourth}, common interview questions and explain your project clearly.`
      }
    ];
  }, [role, skills, decodedCompanyName]);

  const youtubeLinks = useMemo(() => {
    const roleName = role?.roleName || "job role";

    const base = [
      {
        title: `${roleName} full preparation`,
        subtitle: "Complete role preparation videos",
        url: makeYoutubeSearch(`${roleName} full preparation`)
      },
      {
        title: `${roleName} interview questions`,
        subtitle: "Interview questions and answers",
        url: makeYoutubeSearch(`${roleName} interview questions`)
      },
      {
        title: `${roleName} roadmap`,
        subtitle: "Step-wise preparation roadmap",
        url: makeYoutubeSearch(`${roleName} roadmap preparation`)
      },
      {
        title: `${roleName} project ideas`,
        subtitle: "Project ideas for resume",
        url: makeYoutubeSearch(`${roleName} project ideas for resume`)
      }
    ];

    const skillLinks = skills.slice(0, 4).map((skill) => ({
      title: `${skill} preparation`,
      subtitle: "Skill-based YouTube preparation",
      url: makeYoutubeSearch(`${skill} preparation for ${roleName}`)
    }));

    return [...base, ...skillLinks].slice(0, 8);
  }, [role, skills]);

  return (
    <div className="company-role-page">
      <div className="company-role-shell">
        <button
          type="button"
          onClick={() => navigate(`/companies/${encodeURIComponent(decodedCompanyName)}`)}
          className="company-theme-btn"
        >
          ← Back to Company
        </button>

        <section className="role-detail-hero">
          <p>DATASET BASED ROLE PREPARATION</p>
          <h1>{role?.roleName || "Software Engineer"}</h1>
          <span>{decodedCompanyName}</span>
        </section>

        <section className="role-detail-stats">
          <div>
            <span>Company</span>
            <strong>{decodedCompanyName}</strong>
          </div>
          <div>
            <span>Package</span>
            <strong>{role?.expectedPackage || "Package not specified"}</strong>
          </div>
          <div>
            <span>Experience</span>
            <strong>{role?.expectedExperience || "Experience not specified"}</strong>
          </div>
          <div>
            <span>Skills</span>
            <strong>{skills.length}</strong>
          </div>
        </section>

        <section className="role-detail-card">
          <p className="role-detail-kicker">ROADMAP</p>
          <h2>Step-wise Preparation Plan</h2>
          <p className="role-detail-subtitle">
            This plan is generated from this role name and required skills in the dataset.
          </p>

          <div className="role-roadmap-grid">
            {roadmap.map((step, index) => (
              <article key={step.title} className="role-roadmap-item">
                <b>{index + 1}</b>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="role-detail-grid">
          <div className="role-detail-card">
            <p className="role-detail-kicker">STUDY FIRST</p>
            <h2>What to Study</h2>

            <div className="role-chip-list">
              {(skills.length ? skills.slice(0, 8) : ["Role basics", "Project work", "Interview preparation", "Resume points"]).map((skill, index) => (
                <span key={`${skill}-${index}`}>{index + 1}. {skill}</span>
              ))}
            </div>
          </div>

          <div className="role-detail-card">
            <p className="role-detail-kicker">LOCATIONS</p>
            <h2>Job Locations</h2>

            <div className="role-chip-list">
              {locations.length ? (
                locations.slice(0, 10).map((location, index) => (
                  <span key={`${location}-${index}`}>{location}</span>
                ))
              ) : (
                <span>Location data not available in dataset.</span>
              )}
            </div>
          </div>
        </section>

        <section className="role-detail-card">
          <p className="role-detail-kicker">SKILLS</p>
          <h2>Required Skills</h2>

          <div className="role-chip-list">
            {skills.length ? (
              skills.map((skill, index) => <span key={`${skill}-${index}`}>{skill}</span>)
            ) : (
              <span>Skill data not available in dataset.</span>
            )}
          </div>
        </section>

        <section className="role-detail-card">
          <p className="role-detail-kicker">YOUTUBE</p>
          <h2>YouTube Preparation Links</h2>

          <div className="role-video-grid">
            {youtubeLinks.map((item, index) => (
              <a key={`${item.title}-${index}`} href={item.url} target="_blank" rel="noreferrer" className="youtube-prep-link">
                <div className="youtube-prep-link-top">
                  <img src={YOUTUBE_LOGO} alt="YouTube" className="youtube-prep-logo" />
                  <b>{item.title}</b>
                </div>
                <span>{item.subtitle}</span>
              </a>
            ))}
          </div>
        </section>

        {roles.length > 1 && (
          <section className="role-detail-card">
            <p className="role-detail-kicker">MORE ROLES</p>
            <h2>Other Roles in {decodedCompanyName}</h2>

            <div className="role-chip-list">
              {roles.map((item, index) => (
                <button
                  key={`${item.roleName}-${index}`}
                  type="button"
                  onClick={() => navigate(`/companies/${encodeURIComponent(decodedCompanyName)}/roles/${index + 1}`)}
                  className="company-theme-btn"
                >
                  {item.roleName}
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
