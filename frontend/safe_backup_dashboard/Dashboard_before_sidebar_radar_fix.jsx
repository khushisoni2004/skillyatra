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

function safePercent(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function countList(data, key) {
  if (Array.isArray(data)) return data.length;
  if (Array.isArray(data?.[key])) return data[key].length;
  if (Array.isArray(data?.data)) return data.data.length;
  return 0;
}

export default function Dashboard() {
  const [user, setUser] = useState(readUser());
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState("");
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

    const [dashboardRes, progressRes, readinessRes, companiesRes] = await Promise.allSettled([
      getJSON("/api/dashboard/stats"),
      getJSON("/api/progress/summary"),
      getJSON("/api/readiness"),
      getJSON("/api/companies")
    ]);

    const dashboard = dashboardRes.status === "fulfilled" ? dashboardRes.value : null;
    const progress = progressRes.status === "fulfilled" ? progressRes.value : null;
    const readiness = readinessRes.status === "fulfilled" ? readinessRes.value : null;
    const companies = companiesRes.status === "fulfilled" ? companiesRes.value : null;

    next.readiness = safePercent(
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
      progress?.tasksCompleted,
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
      progress?.dsaSolved,
      dashboard?.dsaDone,
      dashboard?.dsaSolved,
      dashboard?.stats?.dsaDone
    );

    next.practiceDone = pickNumber(
      progress?.practiceDone,
      progress?.practiceCompleted,
      progress?.practiceAttempts,
      dashboard?.practiceDone,
      dashboard?.practiceAttempts,
      dashboard?.stats?.practiceDone
    );

    next.interviewsDone = pickNumber(
      progress?.interviewsDone,
      progress?.interviewAttempts,
      progress?.mockInterviews,
      dashboard?.interviewsDone,
      dashboard?.interviewAttempts,
      dashboard?.stats?.interviewsDone
    );

    next.resumeScore = safePercent(
      pickNumber(
        progress?.resumeScore,
        progress?.atsScore,
        dashboard?.resumeScore,
        dashboard?.atsScore,
        dashboard?.stats?.resumeScore
      )
    );

    next.targetCompanies =
      countList(companies, "companies") ||
      pickNumber(
        dashboard?.targetCompanies,
        dashboard?.companyPlans,
        dashboard?.stats?.targetCompanies,
        dashboard?.stats?.companyPlans
      );

    next.activeRoadmap =
      progress?.activeRoadmap ||
      dashboard?.activeRoadmap ||
      dashboard?.stats?.activeRoadmap ||
      localStorage.getItem("skillyatra_active_roadmap") ||
      "Not selected";

    try {
      const localProgress = JSON.parse(localStorage.getItem("skillyatra_progress") || "{}");

      next.readiness = next.readiness || safePercent(localProgress.readiness || localProgress.progress);
      next.completedTasks = next.completedTasks || pickNumber(localProgress.completedTasks);
      next.pendingTasks = next.pendingTasks || pickNumber(localProgress.pendingTasks);
      next.dsaDone = next.dsaDone || pickNumber(localProgress.dsaDone, localProgress.dsaSolved);
      next.practiceDone = next.practiceDone || pickNumber(localProgress.practiceDone, localProgress.practiceAttempts);
      next.interviewsDone = next.interviewsDone || pickNumber(localProgress.interviewsDone, localProgress.interviewAttempts);
      next.resumeScore = next.resumeScore || safePercent(localProgress.resumeScore || localProgress.atsScore);
    } catch {}

    setSummary(next);
    setLastSync(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    setLoading(false);
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const name = user.name || "Student";
  const totalTasks = summary.completedTasks + summary.pendingTasks;

  const focusMessage = useMemo(() => {
    if (summary.readiness >= 80) {
      return "You are close to final interview-ready stage. Focus on mock interviews, company-specific revision and final resume polish.";
    }

    if (summary.readiness >= 50) {
      return "You are building good momentum. Improve weak topics, resume quality and interview fluency.";
    }

    if (summary.readiness > 0) {
      return "Start with daily DSA, aptitude basics and resume improvement to build stronger placement readiness.";
    }

    return "No progress recorded yet. Start Today Plan, DSA Tracker, Practice MCQs and Resume Coach to generate your live dashboard.";
  }, [summary.readiness]);

  const priorityCards = [
    {
      title: "Placement Readiness",
      value: `${summary.readiness}%`,
      text: "Synced from backend readiness, progress summary or saved local progress.",
      icon: Trophy,
      link: "/progress"
    },
    {
      title: "Today’s Work",
      value: totalTasks > 0 ? `${summary.completedTasks}/${totalTasks}` : "0/0",
      text: "Completed and pending tasks from your active study plan.",
      icon: CalendarCheck,
      link: "/today"
    },
    {
      title: "Resume Score",
      value: summary.resumeScore ? `${summary.resumeScore}%` : "Not analyzed",
      text: "Analyze resume to update ATS and resume quality score.",
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
      text: `${summary.targetCompanies} companies or plans available from backend.`,
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
    <div className="gpsd-page">
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap");

        .gpsd-page {
          min-height: 100vh;
          width: 100%;
          overflow-x: hidden;
          padding: 28px;
          color: #0F172A;
          font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          background:
            radial-gradient(circle at 12% 6%, rgba(14,165,233,0.13), transparent 28%),
            radial-gradient(circle at 88% 8%, rgba(125,211,252,0.22), transparent 31%),
            linear-gradient(180deg, #FFFFFF 0%, #F3FBFF 46%, #FFFFFF 100%);
          position: relative;
        }

        .gpsd-page::before {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          background-image:
            linear-gradient(rgba(14,165,233,0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(14,165,233,0.045) 1px, transparent 1px);
          background-size: 44px 44px;
          mask-image: linear-gradient(to bottom, black, transparent 78%);
          z-index: 0;
        }

        @keyframes gpsdFadeUp {
          from {
            opacity: 0;
            transform: translateY(22px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes gpsdBubble {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1);
            opacity: 0.5;
          }
          50% {
            transform: translate3d(18px, -22px, 0) scale(1.08);
            opacity: 0.85;
          }
        }

        @keyframes gpsdShine {
          0% {
            transform: translateX(-130%) skewX(-12deg);
          }
          100% {
            transform: translateX(220%) skewX(-12deg);
          }
        }

        @keyframes gpsdBar {
          from {
            width: 0%;
          }
        }

        .gpsd-bubble {
          position: fixed;
          border-radius: 999px;
          background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.96), rgba(125,211,252,0.30), rgba(14,165,233,0.10));
          border: 1px solid rgba(186,230,253,0.70);
          box-shadow: 0 18px 42px rgba(14,165,233,0.10);
          pointer-events: none;
          z-index: 0;
          animation: gpsdBubble 8s ease-in-out infinite;
        }

        .gpsd-bubble.one {
          width: 110px;
          height: 110px;
          top: 12%;
          right: 7%;
        }

        .gpsd-bubble.two {
          width: 72px;
          height: 72px;
          bottom: 13%;
          left: 7%;
          animation-delay: 1.6s;
        }

        .gpsd-bubble.three {
          width: 46px;
          height: 46px;
          top: 54%;
          right: 4%;
          animation-delay: 3.1s;
        }

        .gpsd-shell {
          position: relative;
          z-index: 2;
          max-width: 1420px;
          margin: 0 auto;
        }

        .gpsd-hero {
          position: relative;
          overflow: hidden;
          border-radius: 36px;
          padding: 34px;
          background:
            radial-gradient(circle at 82% 18%, rgba(255,255,255,0.35), transparent 28%),
            linear-gradient(135deg, #0284C7 0%, #0EA5E9 58%, #7DD3FC 100%);
          color: white;
          box-shadow: 0 30px 78px rgba(14,165,233,0.22);
          animation: gpsdFadeUp 0.7s ease both;
        }

        .gpsd-hero::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 45%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.16), transparent);
          transform: translateX(-130%) skewX(-12deg);
          animation: gpsdShine 5.5s ease-in-out infinite;
          pointer-events: none;
        }

        .gpsd-hero-grid {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 30px;
          align-items: center;
        }

        .gpsd-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 999px;
          background: rgba(255,255,255,0.16);
          border: 1px solid rgba(255,255,255,0.30);
          color: white;
          font-size: 12px;
          font-weight: 950;
          backdrop-filter: blur(18px);
        }

        .gpsd-title {
          margin-top: 20px;
          font-size: clamp(36px, 4.2vw, 62px);
          line-height: 1.02;
          font-weight: 950;
          letter-spacing: -2px;
          color: white;
          text-shadow: 0 18px 42px rgba(2,132,199,0.24);
        }

        .gpsd-desc {
          margin-top: 16px;
          max-width: 780px;
          color: rgba(255,255,255,0.90);
          font-size: 16px;
          font-weight: 720;
          line-height: 1.72;
        }

        .gpsd-actions {
          margin-top: 24px;
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .gpsd-primary,
        .gpsd-ghost {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          min-height: 48px;
          border-radius: 17px;
          padding: 13px 22px;
          font-size: 14px;
          font-weight: 950;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: all 0.24s ease;
          font-family: inherit;
        }

        .gpsd-primary {
          background: white;
          color: #0284C7;
          box-shadow: 0 18px 38px rgba(2,132,199,0.20);
        }

        .gpsd-ghost {
          background: rgba(255,255,255,0.15);
          color: white;
          border: 1px solid rgba(255,255,255,0.32);
          backdrop-filter: blur(18px);
        }

        .gpsd-primary:hover,
        .gpsd-ghost:hover {
          transform: translateY(-3px);
        }

        .gpsd-roadmap {
          border-radius: 28px;
          background: rgba(255,255,255,0.92);
          border: 1px solid rgba(255,255,255,0.72);
          color: #0F172A;
          padding: 24px;
          box-shadow: 0 24px 60px rgba(2,132,199,0.12);
        }

        .gpsd-roadmap-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }

        .gpsd-roadmap-label {
          color: #64748B;
          font-size: 13px;
          font-weight: 950;
        }

        .gpsd-roadmap-title {
          margin-top: 9px;
          font-size: 28px;
          line-height: 1.14;
          font-weight: 950;
          color: #0F172A;
          word-break: break-word;
        }

        .gpsd-roadmap-icon {
          width: 56px;
          height: 56px;
          border-radius: 22px;
          background: #E0F2FE;
          border: 1px solid #BAE6FD;
          color: #0284C7;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .gpsd-progress-track {
          margin-top: 22px;
          height: 11px;
          border-radius: 999px;
          background: #E0F2FE;
          overflow: hidden;
        }

        .gpsd-progress-fill {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, #0EA5E9, #22C55E);
          animation: gpsdBar 1.15s ease both;
        }

        .gpsd-sync {
          margin-top: 12px;
          color: #64748B;
          font-size: 13px;
          font-weight: 800;
        }

        .gpsd-priority-grid {
          margin-top: 26px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }

        .gpsd-card {
          display: block;
          text-decoration: none;
          color: inherit;
          border-radius: 30px;
          background: rgba(255,255,255,0.95);
          border: 1px solid rgba(186,230,253,0.95);
          box-shadow: 0 20px 50px rgba(2,132,199,0.08);
          backdrop-filter: blur(18px);
          padding: 24px;
          position: relative;
          overflow: hidden;
          transition: all 0.25s ease;
          animation: gpsdFadeUp 0.7s ease both;
        }

        .gpsd-card::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at top right, rgba(14,165,233,0.11), transparent 42%);
          pointer-events: none;
        }

        .gpsd-card::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 44%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(14,165,233,0.08), transparent);
          transform: translateX(-130%) skewX(-12deg);
          pointer-events: none;
        }

        .gpsd-card:hover {
          transform: translateY(-7px);
          box-shadow: 0 30px 70px rgba(2,132,199,0.14);
          border-color: rgba(14,165,233,0.36);
        }

        .gpsd-card:hover::after {
          animation: gpsdShine 0.8s ease;
        }

        .gpsd-card-inner {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 18px;
        }

        .gpsd-card-label {
          margin: 0;
          color: #64748B;
          font-size: 13px;
          font-weight: 950;
          line-height: 1.4;
        }

        .gpsd-card-value {
          margin: 11px 0 0;
          color: #0F172A;
          font-size: 35px;
          font-weight: 950;
          line-height: 1.1;
          letter-spacing: -1px;
        }

        .gpsd-card-text {
          margin: 12px 0 0;
          color: #475569;
          font-size: 14px;
          line-height: 1.62;
          font-weight: 720;
        }

        .gpsd-icon-box {
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

        .gpsd-card:hover .gpsd-icon-box,
        .gpsd-action-card:hover .gpsd-icon-box {
          background: linear-gradient(135deg, #0EA5E9, #7DD3FC);
          color: white;
          box-shadow: 0 18px 36px rgba(14,165,233,0.24);
        }

        .gpsd-content-grid {
          margin-top: 26px;
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 22px;
        }

        .gpsd-panel {
          border-radius: 32px;
          background: rgba(255,255,255,0.96);
          border: 1px solid rgba(186,230,253,0.95);
          box-shadow: 0 20px 50px rgba(2,132,199,0.08);
          padding: 26px;
          backdrop-filter: blur(18px);
        }

        .gpsd-panel-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .gpsd-kicker {
          margin: 0;
          color: #0284C7;
          font-size: 12px;
          font-weight: 950;
          letter-spacing: 2.5px;
          text-transform: uppercase;
        }

        .gpsd-section-title {
          margin: 9px 0 0;
          color: #0F172A;
          font-size: 27px;
          line-height: 1.15;
          font-weight: 950;
          letter-spacing: -0.8px;
        }

        .gpsd-action-grid {
          margin-top: 23px;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .gpsd-action-card {
          display: block;
          text-decoration: none;
          color: inherit;
          border-radius: 26px;
          background: #FFFFFF;
          border: 1px solid rgba(186,230,253,0.95);
          padding: 20px;
          transition: all 0.25s ease;
        }

        .gpsd-action-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 28px 58px rgba(2,132,199,0.12);
          border-color: rgba(14,165,233,0.36);
        }

        .gpsd-action-row {
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .gpsd-action-title {
          margin: 0;
          color: #0F172A;
          font-size: 17px;
          font-weight: 950;
          line-height: 1.25;
        }

        .gpsd-action-text {
          margin: 13px 0 0;
          color: #475569;
          font-size: 14px;
          font-weight: 720;
          line-height: 1.6;
        }

        .gpsd-radar-title {
          margin: 0;
          display: flex;
          align-items: center;
          gap: 12px;
          color: #0F172A;
          font-size: 27px;
          font-weight: 950;
          letter-spacing: -0.8px;
        }

        .gpsd-radar-list {
          margin-top: 23px;
          display: grid;
          gap: 14px;
        }

        .gpsd-radar-row {
          border-radius: 22px;
          border: 1px solid rgba(186,230,253,0.95);
          background: #FFFFFF;
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .gpsd-radar-label {
          margin: 0;
          color: #0F172A;
          font-size: 14px;
          font-weight: 950;
        }

        .gpsd-radar-status {
          border-radius: 999px;
          background: #E0F2FE;
          border: 1px solid #BAE6FD;
          color: #0284C7;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 950;
          white-space: nowrap;
        }

        .gpsd-notice {
          margin-top: 20px;
          border-radius: 24px;
          border: 1px solid #BBF7D0;
          background: linear-gradient(135deg, #ECFDF5, #F0F9FF);
          padding: 18px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .gpsd-notice p {
          margin: 0;
          color: #047857;
          font-size: 14px;
          font-weight: 800;
          line-height: 1.6;
        }

        @media (max-width: 1120px) {
          .gpsd-hero-grid,
          .gpsd-content-grid {
            grid-template-columns: 1fr;
          }

          .gpsd-priority-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 720px) {
          .gpsd-page {
            padding: 18px;
          }

          .gpsd-hero {
            border-radius: 30px;
            padding: 26px;
          }

          .gpsd-title {
            font-size: 34px;
            letter-spacing: -1px;
          }

          .gpsd-priority-grid,
          .gpsd-action-grid {
            grid-template-columns: 1fr;
          }

          .gpsd-card-value {
            font-size: 30px;
          }
        }
      `}</style>

      <div className="gpsd-bubble one" />
      <div className="gpsd-bubble two" />
      <div className="gpsd-bubble three" />

      <div className="gpsd-shell">
        <section className="gpsd-hero">
          <div className="gpsd-hero-grid">
            <div>
              <div className="gpsd-badge">
                <Sparkles size={16} />
                Live Placement Dashboard
              </div>

              <h1 className="gpsd-title">
                Welcome back, {name}
              </h1>

              <p className="gpsd-desc">
                {focusMessage}
              </p>

              <div className="gpsd-actions">
                <Link to="/today" className="gpsd-primary">
                  Continue Today Plan
                  <ArrowRight size={16} />
                </Link>

                <button type="button" onClick={loadDashboard} className="gpsd-ghost">
                  <RefreshCw size={16} />
                  {loading ? "Refreshing..." : "Refresh Live Data"}
                </button>
              </div>
            </div>

            <div className="gpsd-roadmap">
              <div className="gpsd-roadmap-top">
                <div>
                  <p className="gpsd-roadmap-label">Active Roadmap</p>
                  <h2 className="gpsd-roadmap-title">{summary.activeRoadmap}</h2>
                </div>

                <div className="gpsd-roadmap-icon">
                  <GraduationCap size={30} strokeWidth={2.5} />
                </div>
              </div>

              <div className="gpsd-progress-track">
                <div className="gpsd-progress-fill" style={{ width: `${summary.readiness}%` }} />
              </div>

              <p className="gpsd-sync">
                {loading ? "Loading live progress..." : `Live synced${lastSync ? ` at ${lastSync}` : ""}.`}
              </p>
            </div>
          </div>
        </section>

        <section className="gpsd-priority-grid">
          {priorityCards.map((card, index) => {
            const Icon = card.icon;

            return (
              <Link
                key={card.title}
                to={card.link}
                className="gpsd-card"
                style={{ animationDelay: `${0.1 + index * 0.1}s` }}
              >
                <div className="gpsd-card-inner">
                  <div>
                    <p className="gpsd-card-label">{card.title}</p>
                    <h2 className="gpsd-card-value">{card.value}</h2>
                    <p className="gpsd-card-text">{card.text}</p>
                  </div>

                  <div className="gpsd-icon-box">
                    <Icon size={29} strokeWidth={2.5} />
                  </div>
                </div>
              </Link>
            );
          })}
        </section>

        <section className="gpsd-content-grid">
          <div className="gpsd-panel">
            <div className="gpsd-panel-head">
              <div>
                <p className="gpsd-kicker">Next Best Actions</p>
                <h2 className="gpsd-section-title">Continue from your real progress</h2>
              </div>

              <div className="gpsd-icon-box">
                <BarChart3 size={28} strokeWidth={2.5} />
              </div>
            </div>

            <div className="gpsd-action-grid">
              {actionCards.map((item) => {
                const Icon = item.icon;

                return (
                  <Link key={item.title} to={item.link} className="gpsd-action-card">
                    <div className="gpsd-action-row">
                      <div className="gpsd-icon-box">
                        <Icon size={24} strokeWidth={2.5} />
                      </div>
                      <h3 className="gpsd-action-title">{item.title}</h3>
                    </div>

                    <p className="gpsd-action-text">
                      {item.text}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="gpsd-panel">
            <h2 className="gpsd-radar-title">
              <Flame size={30} color="#F97316" />
              Focus Radar
            </h2>

            <div className="gpsd-radar-list">
              {radarItems.map(([label, status]) => (
                <div key={label} className="gpsd-radar-row">
                  <p className="gpsd-radar-label">{label}</p>
                  <span className="gpsd-radar-status">{status}</span>
                </div>
              ))}
            </div>

            <div className="gpsd-notice">
              <CheckCircle2 size={22} color="#059669" style={{ marginTop: 3, flexShrink: 0 }} />
              <p>
                Dashboard values update from backend/progress/local saved records. No dummy frontend values are added.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
