import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Brain,
  Briefcase,
  CalendarCheck,
  CheckCircle2,
  Code2,
  FileText,
  Flame,
  GraduationCap,
  Mic,
  RefreshCw,
  Sparkles,
  Trophy
} from "lucide-react";
import { Link } from "react-router-dom";
import "./skillyatra.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";

function readUser() {
  try {
    return JSON.parse(localStorage.getItem("skillyatra_user") || "{}");
  } catch {
    return {};
  }
}

async function getJSON(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(path);
  return await res.json();
}

function pickNumber(...values) {
  for (const v of values) {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

export default function Dashboard() {
  const [user, setUser] = useState(readUser());
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    readiness: 0,
    completedTasks: 0,
    pendingTasks: 0,
    dsaDone: 0,
    practiceDone: 0,
    interviewsDone: 0,
    resumeScore: 0,
    targetCompanies: 0,
    activeRoadmap: "Not selected"
  });

  const loadDashboard = async () => {
    setLoading(true);
    setUser(readUser());

    const next = {
      readiness: 0,
      completedTasks: 0,
      pendingTasks: 0,
      dsaDone: 0,
      practiceDone: 0,
      interviewsDone: 0,
      resumeScore: 0,
      targetCompanies: 0,
      activeRoadmap: "Not selected"
    };

    try {
      const dashboard = await getJSON("/api/dashboard/stats").catch(() => null);
      const progress = await getJSON("/api/progress/summary").catch(() => null);
      const readiness = await getJSON("/api/readiness").catch(() => null);
      const companies = await getJSON("/api/companies").catch(() => null);

      next.readiness = Math.round(
        pickNumber(
          readiness?.readiness,
          readiness?.readinessScore,
          readiness?.placementReadiness,
          progress?.readiness,
          progress?.overallProgress,
          dashboard?.readiness,
          dashboard?.readinessScore,
          dashboard?.stats?.readiness
        )
      );

      next.completedTasks = pickNumber(
        progress?.completedTasks,
        progress?.completed,
        dashboard?.completedTasks,
        dashboard?.stats?.completedTasks
      );

      next.pendingTasks = pickNumber(
        progress?.pendingTasks,
        progress?.pending,
        dashboard?.pendingTasks,
        dashboard?.stats?.pendingTasks
      );

      next.dsaDone = pickNumber(
        progress?.dsaDone,
        progress?.dsaCompleted,
        dashboard?.dsaDone,
        dashboard?.stats?.dsaDone
      );

      next.practiceDone = pickNumber(
        progress?.practiceDone,
        progress?.practiceCompleted,
        dashboard?.practiceDone,
        dashboard?.stats?.practiceDone
      );

      next.interviewsDone = pickNumber(
        progress?.interviewsDone,
        progress?.interviewAttempts,
        dashboard?.interviewsDone,
        dashboard?.stats?.interviewsDone
      );

      next.resumeScore = pickNumber(
        progress?.resumeScore,
        progress?.atsScore,
        dashboard?.resumeScore,
        dashboard?.stats?.resumeScore
      );

      next.targetCompanies = Array.isArray(companies)
        ? companies.length
        : Array.isArray(companies?.companies)
          ? companies.companies.length
          : pickNumber(dashboard?.companyPlans, dashboard?.stats?.companyPlans);

      next.activeRoadmap =
        progress?.activeRoadmap ||
        dashboard?.activeRoadmap ||
        dashboard?.stats?.activeRoadmap ||
        localStorage.getItem("skillyatra_active_roadmap") ||
        "Not selected";

      next.readiness = Math.max(0, Math.min(100, next.readiness));
    } catch {
      // no dummy data
    }

    try {
      const localProgress = JSON.parse(localStorage.getItem("skillyatra_progress") || "{}");
      next.readiness = next.readiness || Number(localProgress.readiness || localProgress.progress || 0);
      next.completedTasks = next.completedTasks || Number(localProgress.completedTasks || 0);
      next.pendingTasks = next.pendingTasks || Number(localProgress.pendingTasks || 0);
      next.resumeScore = next.resumeScore || Number(localProgress.resumeScore || 0);
    } catch {}

    setSummary(next);
    setLoading(false);
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const name = user.name || "Devendra";

  const focusMessage = useMemo(() => {
    if (summary.readiness >= 80) return "You are close to final interview-ready stage. Focus on mocks and company-specific revision.";
    if (summary.readiness >= 50) return "You are building good momentum. Improve weak topics, resume quality and mock interview fluency.";
    if (summary.readiness > 0) return "Start with daily DSA, aptitude basics and resume improvement to build placement readiness.";
    return "No progress recorded yet. Start Today Plan, DSA Tracker, Practice MCQs and Resume Coach to generate your live dashboard.";
  }, [summary.readiness]);

  const priorityCards = [
    {
      title: "Placement Readiness",
      value: `${summary.readiness}%`,
      text: "Calculated from your saved progress and backend records.",
      icon: Trophy,
      link: "/progress"
    },
    {
      title: "Today’s Work",
      value: `${summary.completedTasks}/${summary.completedTasks + summary.pendingTasks}`,
      text: "Completed tasks from your active study plan.",
      icon: CalendarCheck,
      link: "/today"
    },
    {
      title: "Resume Score",
      value: summary.resumeScore ? `${summary.resumeScore}%` : "Not analyzed",
      text: "Upload or analyze resume to update this value.",
      icon: FileText,
      link: "/resume"
    }
  ];

  const actionCards = [
    {
      title: "Continue DSA",
      text: `${summary.dsaDone} solved records tracked from your progress.`,
      icon: Code2,
      link: "/dsa"
    },
    {
      title: "Practice MCQs",
      text: `${summary.practiceDone} practice attempts recorded.`,
      icon: Brain,
      link: "/practice"
    },
    {
      title: "Mock Interview",
      text: `${summary.interviewsDone} interview practice attempts recorded.`,
      icon: Mic,
      link: "/interview"
    },
    {
      title: "Company Prep",
      text: `${summary.targetCompanies} companies/plans available from backend.`,
      icon: Briefcase,
      link: "/companies"
    }
  ];

  const radarItems = [
    ["DSA", summary.dsaDone > 0 ? "In Progress" : "Start Now"],
    ["Practice MCQs", summary.practiceDone > 0 ? "In Progress" : "Start Now"],
    ["Resume", summary.resumeScore > 0 ? "Analyzed" : "Analyze Now"],
    ["Interview", summary.interviewsDone > 0 ? "Practiced" : "Practice Now"]
  ];

  return (
    <div className="dash-page">
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap");

        .dash-page {
          min-height: 100vh;
          width: 100%;
          overflow-x: hidden;
          padding: 28px;
          color: #0F172A;
          font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          background:
            radial-gradient(circle at 10% 6%, rgba(14,165,233,0.18), transparent 30%),
            radial-gradient(circle at 88% 10%, rgba(125,211,252,0.28), transparent 32%),
            linear-gradient(180deg, #F8FCFF 0%, #EEF8FF 52%, #FFFFFF 100%);
          position: relative;
        }

        .dash-page::before {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          background-image:
            linear-gradient(rgba(14,165,233,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(14,165,233,0.05) 1px, transparent 1px);
          background-size: 44px 44px;
          mask-image: linear-gradient(to bottom, black, transparent 78%);
          z-index: 0;
        }

        .dash-page > * {
          position: relative;
          z-index: 1;
        }

        @keyframes dashFadeUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes dashFloat {
          0%, 100% {
            transform: perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px);
          }
          50% {
            transform: perspective(1000px) rotateX(1.6deg) rotateY(-1.6deg) translateY(-10px);
          }
        }

        @keyframes dashGlow {
          0%, 100% {
            opacity: 0.55;
            transform: scale(1);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.08);
          }
        }

        @keyframes dashShimmer {
          0% {
            transform: translateX(-120%);
          }
          100% {
            transform: translateX(220%);
          }
        }

        @keyframes dashProgress {
          from {
            width: 0%;
          }
        }

        .dash-shell {
          max-width: 1420px;
          margin: 0 auto;
        }

        .dash-bubble {
          position: fixed;
          border-radius: 999px;
          background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95), rgba(125,211,252,0.32), rgba(14,165,233,0.12));
          border: 1px solid rgba(186,230,253,0.7);
          box-shadow: 0 18px 42px rgba(14,165,233,0.12);
          pointer-events: none;
          z-index: 0;
          animation: dashGlow 7s ease-in-out infinite;
        }

        .bubble-a {
          width: 110px;
          height: 110px;
          top: 10%;
          right: 8%;
        }

        .bubble-b {
          width: 70px;
          height: 70px;
          bottom: 12%;
          left: 8%;
          animation-delay: 1.5s;
        }

        .bubble-c {
          width: 44px;
          height: 44px;
          top: 52%;
          right: 3%;
          animation-delay: 3s;
        }

        .dash-hero {
          position: relative;
          overflow: hidden;
          border-radius: 38px;
          padding: 36px;
          background:
            radial-gradient(circle at 82% 12%, rgba(255,255,255,0.34), transparent 28%),
            linear-gradient(135deg, #0284C7 0%, #0EA5E9 52%, #7DD3FC 100%);
          background-size: 200% 200%;
          color: white;
          box-shadow: 0 32px 82px rgba(14,165,233,0.24);
          animation: dashFadeUp 0.75s ease both;
        }

        .dash-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(110deg, transparent, rgba(255,255,255,0.16), transparent);
          transform: translateX(-120%);
          animation: dashShimmer 5s ease-in-out infinite;
          pointer-events: none;
        }

        .dash-hero-inner {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 32px;
          align-items: center;
        }

        .dash-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 999px;
          background: rgba(255,255,255,0.18);
          border: 1px solid rgba(255,255,255,0.28);
          color: white;
          font-size: 12px;
          font-weight: 950;
          letter-spacing: 0.3px;
          backdrop-filter: blur(18px);
        }

        .dash-title {
          margin-top: 20px;
          font-size: clamp(38px, 4.4vw, 64px);
          line-height: 1.02;
          font-weight: 950;
          letter-spacing: -2px;
          color: white;
          text-shadow: 0 18px 42px rgba(2,132,199,0.22);
        }

        .dash-desc {
          margin-top: 18px;
          max-width: 760px;
          color: rgba(255,255,255,0.88);
          font-size: 16px;
          font-weight: 720;
          line-height: 1.75;
        }

        .dash-actions {
          margin-top: 26px;
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .dash-primary-btn,
        .dash-ghost-btn {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          border-radius: 18px;
          padding: 14px 24px;
          font-size: 14px;
          font-weight: 950;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: all 0.24s ease;
        }

        .dash-primary-btn {
          background: white;
          color: #0284C7;
          box-shadow: 0 18px 40px rgba(2,132,199,0.22);
        }

        .dash-ghost-btn {
          background: rgba(255,255,255,0.14);
          color: white;
          border: 1px solid rgba(255,255,255,0.32);
          backdrop-filter: blur(18px);
        }

        .dash-primary-btn:hover,
        .dash-ghost-btn:hover {
          transform: translateY(-3px);
        }

        .roadmap-card {
          position: relative;
          border-radius: 30px;
          background: rgba(255,255,255,0.18);
          border: 1px solid rgba(255,255,255,0.30);
          padding: 26px;
          backdrop-filter: blur(20px);
          animation: dashFloat 6s ease-in-out infinite;
        }

        .roadmap-label {
          color: rgba(255,255,255,0.82);
          font-size: 13px;
          font-weight: 950;
        }

        .roadmap-title {
          margin-top: 10px;
          color: white;
          font-size: 30px;
          line-height: 1.12;
          font-weight: 950;
          word-break: break-word;
        }

        .progress-track {
          margin-top: 22px;
          height: 12px;
          border-radius: 999px;
          background: rgba(255,255,255,0.26);
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          border-radius: 999px;
          background: white;
          animation: dashProgress 1.2s ease both;
        }

        .sync-text {
          margin-top: 12px;
          color: rgba(255,255,255,0.82);
          font-size: 13px;
          font-weight: 800;
        }

        .priority-grid {
          margin-top: 28px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
        }

        .priority-card,
        .panel,
        .action-card,
        .radar-row,
        .notice-card {
          background: rgba(255,255,255,0.94);
          border: 1px solid rgba(186,230,253,0.92);
          box-shadow: 0 20px 50px rgba(2,132,199,0.08);
          backdrop-filter: blur(18px);
        }

        .priority-card {
          display: block;
          text-decoration: none;
          border-radius: 30px;
          padding: 26px;
          color: inherit;
          position: relative;
          overflow: hidden;
          transition: all 0.25s ease;
          animation: dashFadeUp 0.75s ease both;
        }

        .priority-card::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at top right, rgba(14,165,233,0.13), transparent 45%);
          pointer-events: none;
        }

        .priority-card::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 46%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(14,165,233,0.08), transparent);
          transform: translateX(-130%) skewX(-12deg);
          pointer-events: none;
        }

        .priority-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 30px 70px rgba(2,132,199,0.14);
          border-color: rgba(14,165,233,0.35);
        }

        .priority-card:hover::after {
          animation: dashShimmer 0.8s ease;
        }

        .priority-content {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 18px;
        }

        .card-label {
          font-size: 13px;
          color: #64748B;
          font-weight: 950;
        }

        .card-value {
          margin-top: 12px;
          font-size: 36px;
          color: #0F172A;
          font-weight: 950;
          letter-spacing: -1px;
        }

        .card-text {
          margin-top: 12px;
          color: #475569;
          font-size: 14px;
          font-weight: 720;
          line-height: 1.65;
        }

        .icon-box {
          width: 58px;
          height: 58px;
          border-radius: 22px;
          background: #E0F2FE;
          border: 1px solid #BAE6FD;
          color: #0284C7;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.25s ease;
        }

        .priority-card:hover .icon-box,
        .action-card:hover .icon-box {
          background: linear-gradient(135deg, #0EA5E9, #7DD3FC);
          color: white;
          box-shadow: 0 18px 36px rgba(14,165,233,0.24);
        }

        .content-grid {
          margin-top: 28px;
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 24px;
        }

        .panel {
          border-radius: 34px;
          padding: 28px;
        }

        .panel-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .section-kicker {
          font-size: 12px;
          font-weight: 950;
          letter-spacing: 2.4px;
          text-transform: uppercase;
          color: #0284C7;
        }

        .section-title {
          margin-top: 9px;
          color: #0F172A;
          font-size: 28px;
          font-weight: 950;
          letter-spacing: -0.8px;
        }

        .action-grid {
          margin-top: 24px;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .action-card {
          text-decoration: none;
          color: inherit;
          border-radius: 26px;
          padding: 20px;
          transition: all 0.25s ease;
        }

        .action-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 28px 58px rgba(2,132,199,0.12);
          border-color: rgba(14,165,233,0.34);
        }

        .action-row {
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .action-title {
          font-size: 18px;
          color: #0F172A;
          font-weight: 950;
        }

        .action-text {
          margin-top: 13px;
          color: #475569;
          font-size: 14px;
          line-height: 1.65;
          font-weight: 720;
        }

        .radar-title {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #0F172A;
          font-size: 28px;
          font-weight: 950;
        }

        .radar-list {
          margin-top: 24px;
          display: grid;
          gap: 14px;
        }

        .radar-row {
          border-radius: 22px;
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .radar-label {
          color: #0F172A;
          font-size: 14px;
          font-weight: 950;
        }

        .radar-status {
          border-radius: 999px;
          background: #E0F2FE;
          border: 1px solid #BAE6FD;
          color: #0284C7;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 950;
          white-space: nowrap;
        }

        .notice-card {
          margin-top: 20px;
          border-radius: 24px;
          padding: 18px;
          background: linear-gradient(135deg, #ECFDF5, #F0F9FF);
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .notice-card p {
          color: #047857;
          font-size: 14px;
          font-weight: 800;
          line-height: 1.6;
        }

        @media (max-width: 1100px) {
          .dash-hero-inner,
          .content-grid {
            grid-template-columns: 1fr;
          }

          .priority-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 720px) {
          .dash-page {
            padding: 18px;
          }

          .dash-hero {
            padding: 26px;
            border-radius: 30px;
          }

          .priority-grid,
          .action-grid {
            grid-template-columns: 1fr;
          }

          .dash-title {
            font-size: 34px;
            letter-spacing: -1px;
          }

          .roadmap-title {
            font-size: 24px;
          }
        }
      `}</style>

      <div className="dash-bubble bubble-a" />
      <div className="dash-bubble bubble-b" />
      <div className="dash-bubble bubble-c" />

      <div className="dash-shell">
        <section className="dash-hero">
          <div className="dash-hero-inner">
            <div>
              <div className="dash-badge">
                <Sparkles size={16} />
                Live Placement Dashboard
              </div>

              <h1 className="dash-title">
                Welcome back, {name}
              </h1>

              <p className="dash-desc">
                {focusMessage}
              </p>

              <div className="dash-actions">
                <Link to="/today" className="dash-primary-btn">
                  Continue Today Plan
                  <ArrowRight size={16} />
                </Link>

                <button onClick={loadDashboard} className="dash-ghost-btn">
                  <RefreshCw size={16} />
                  Refresh Live Data
                </button>
              </div>
            </div>

            <div className="roadmap-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                <div>
                  <p className="roadmap-label">Active Roadmap</p>
                  <h2 className="roadmap-title">{summary.activeRoadmap}</h2>
                </div>

                <div
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: 22,
                    background: "rgba(255,255,255,0.18)",
                    border: "1px solid rgba(255,255,255,0.30)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}
                >
                  <GraduationCap size={31} />
                </div>
              </div>

              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${summary.readiness}%` }} />
              </div>

              <p className="sync-text">
                {loading ? "Loading live progress..." : "Synced from your progress records."}
              </p>
            </div>
          </div>
        </section>

        <section className="priority-grid">
          {priorityCards.map((card, index) => {
            const Icon = card.icon;

            return (
              <Link
                key={card.title}
                to={card.link}
                className="priority-card"
                style={{ animationDelay: `${0.1 + index * 0.1}s` }}
              >
                <div className="priority-content">
                  <div>
                    <p className="card-label">{card.title}</p>
                    <h2 className="card-value">{card.value}</h2>
                    <p className="card-text">{card.text}</p>
                  </div>

                  <div className="icon-box">
                    <Icon size={29} strokeWidth={2.5} />
                  </div>
                </div>
              </Link>
            );
          })}
        </section>

        <section className="content-grid">
          <div className="panel">
            <div className="panel-head">
              <div>
                <p className="section-kicker">Next Best Actions</p>
                <h2 className="section-title">Continue from your real progress</h2>
              </div>

              <div className="icon-box">
                <BarChart3 size={28} strokeWidth={2.5} />
              </div>
            </div>

            <div className="action-grid">
              {actionCards.map((item) => {
                const Icon = item.icon;

                return (
                  <Link key={item.title} to={item.link} className="action-card">
                    <div className="action-row">
                      <div className="icon-box">
                        <Icon size={24} strokeWidth={2.5} />
                      </div>
                      <h3 className="action-title">{item.title}</h3>
                    </div>

                    <p className="action-text">
                      {item.text}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="panel">
            <h2 className="radar-title">
              <Flame size={30} color="#F97316" />
              Focus Radar
            </h2>

            <div className="radar-list">
              {radarItems.map(([label, status]) => (
                <div key={label} className="radar-row">
                  <p className="radar-label">{label}</p>
                  <span className="radar-status">{status}</span>
                </div>
              ))}
            </div>

            <div className="notice-card">
              <CheckCircle2 size={22} color="#059669" style={{ marginTop: 3, flexShrink: 0 }} />
              <p>
                Dashboard values update from backend/progress. No static database-count report is shown.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
