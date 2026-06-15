import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Companies.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";

function cleanList(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function makeYoutubeSearch(query) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

export default function RoleDetail() {
  const navigate = useNavigate();
  const { companyName, roleId } = useParams();

  const decodedCompanyName = decodeURIComponent(companyName || "");
  const roleIndex = Math.max(Number(roleId || 1) - 1, 0);

  const [roles, setRoles] = useState([]);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRole = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `${API_BASE}/api/companies/${encodeURIComponent(decodedCompanyName)}/roles`
      );

      const data = await res.json();
      const list = Array.isArray(data.roles) ? data.roles : [];

      setRoles(list);
      setRole(list[roleIndex] || null);

      if (!list.length) {
        setError("No role data returned from backend for this company.");
      }
    } catch (err) {
      setRoles([]);
      setRole(null);
      setError("Unable to load role data. Check backend API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRole();
  }, [decodedCompanyName, roleIndex]);

  const skills = useMemo(() => cleanList(role?.skills), [role]);
  const locations = useMemo(() => cleanList(role?.locations), [role]);

  const topSkills = useMemo(() => {
    const first = skills.slice(0, 6);
    if (first.length) return first;

    return ["Role basics", "Project work", "Interview preparation", "Resume points"];
  }, [skills]);

  const roadmap = useMemo(() => {
    const roleName = role?.roleName || "this role";
    const firstSkill = skills[0] || "core fundamentals";
    const secondSkill = skills[1] || "practical implementation";
    const thirdSkill = skills[2] || "project building";
    const fourthSkill = skills[3] || "interview preparation";

    return [
      {
        title: "Understand the role",
        text: `Read the ${roleName} job description and understand daily responsibilities for ${decodedCompanyName}.`
      },
      {
        title: `Build base in ${firstSkill}`,
        text: `Start with fundamentals of ${firstSkill}. Make short notes and revise important definitions.`
      },
      {
        title: `Practice ${secondSkill}`,
        text: `Solve small examples and practical questions related to ${secondSkill}.`
      },
      {
        title: `Create one mini project`,
        text: `Use ${thirdSkill} and make one role-based mini project for resume discussion.`
      },
      {
        title: "Prepare interview answers",
        text: `Prepare HR + technical answers around ${roleName}, projects, skills and company requirements.`
      },
      {
        title: "Final revision",
        text: `Revise ${fourthSkill}, common interview questions and explain your project clearly.`
      }
    ];
  }, [role, skills, decodedCompanyName]);

  const youtubeLinks = useMemo(() => {
    const roleName = role?.roleName || "job role";
    const skillLinks = skills.slice(0, 4).map((skill) => ({
      title: `${skill} preparation`,
      subtitle: "Skill-based YouTube preparation",
      url: makeYoutubeSearch(`${skill} preparation for ${roleName}`)
    }));

    return [
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
      },
      ...skillLinks
    ].slice(0, 8);
  }, [role, skills]);

  if (loading) {
    return (
      <div className="company-role-theme-page">
        <section className="company-role-panel p-8">
          <h2>Loading role detail...</h2>
          <p>Dataset role information is loading.</p>
        </section>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="company-role-theme-page">
        <button
          onClick={() => navigate("/companies")}
          className="company-theme-btn mb-6"
        >
          ← Back to Companies
        </button>

        <section className="company-role-panel p-8">
          <h2>Role data not available</h2>
          <p>{error || "This role was not found in the company dataset."}</p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() =>
                navigate(`/companies/${encodeURIComponent(decodedCompanyName)}`)
              }
              className="company-theme-btn"
            >
              Open company detail →
            </button>

            <button onClick={loadRole} className="company-theme-btn">
              Retry loading →
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="company-role-theme-page">
      <button
        onClick={() =>
          navigate(`/companies/${encodeURIComponent(decodedCompanyName)}`)
        }
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
          <div className="company-role-section-head">
            <span>ROADMAP</span>
            <h2>Step-wise Preparation Plan</h2>
            <p>
              This plan is generated from this role name and required skills in the dataset.
            </p>
          </div>

          <div className="company-role-stack mt-5">
            {roadmap.map((step, index) => (
              <div key={`${step.title}-${index}`} className="company-step-card">
                <div className="company-step-number">{index + 1}</div>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="company-role-stack">
          <section className="company-role-panel p-6">
            <div className="company-role-section-head">
              <span>STUDY FIRST</span>
              <h2>What to Study</h2>
            </div>

            <div className="company-role-stack mt-4">
              {topSkills.slice(0, 4).map((skill, index) => (
                <div key={`${skill}-${index}`} className="company-study-row">
                  <div className="company-step-number">{index + 1}</div>
                  <h3>{skill}</h3>
                </div>
              ))}
            </div>
          </section>

          <section className="company-role-panel p-6">
            <div className="company-role-section-head">
              <span>SKILLS</span>
              <h2>Required Skills</h2>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              {skills.length ? (
                skills.map((skill, index) => (
                  <span key={`${skill}-${index}`} className="company-role-chip">
                    {skill}
                  </span>
                ))
              ) : (
                <p>Skill data not available in dataset.</p>
              )}
            </div>
          </section>

          <section className="company-role-panel p-6">
            <div className="company-role-section-head">
              <span>LOCATIONS</span>
              <h2>Job Locations</h2>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              {locations.length ? (
                locations.map((location, index) => (
                  <span
                    key={`${location}-${index}`}
                    className="company-location-chip"
                  >
                    {location}
                  </span>
                ))
              ) : (
                <p>Location data not available in dataset.</p>
              )}
            </div>
          </section>
        </div>
      </div>

      <section className="company-role-panel mt-8 p-6">
        <div className="company-role-section-head">
          <span>YOUTUBE</span>
          <h2>YouTube Preparation Links</h2>
        </div>

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
          <div className="company-role-section-head">
            <span>MORE ROLES</span>
            <h2>Other Roles in {decodedCompanyName}</h2>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {roles.map((item, index) => (
              <button
                key={`${item.roleName}-${index}`}
                onClick={() =>
                  navigate(
                    `/companies/${encodeURIComponent(decodedCompanyName)}/roles/${index + 1}`
                  )
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
