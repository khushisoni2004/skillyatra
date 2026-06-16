import TodayPlanFinal from "./TodayPlanFinal";
import React, { useEffect, useMemo, useRef, useState } from "react";
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

import { BACKEND_BASE } from "../lib/config";
const API_BASE = BACKEND_BASE;

const DASHBOARD_CACHE_KEY = "skillyatra_dashboard_summary_cache_v2";
const DASHBOARD_CACHE_TIME = 1000 * 60 * 20;

function readDashboardCache() {
  try {
    const raw = sessionStorage.getItem(DASHBOARD_CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed?.time || !parsed?.summary) return null;

    if (Date.now() - parsed.time > DASHBOARD_CACHE_TIME) {
      sessionStorage.removeItem(DASHBOARD_CACHE_KEY);
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function writeDashboardCache(summary) {
  try {
    sessionStorage.setItem(
      DASHBOARD_CACHE_KEY,
      JSON.stringify({
        time: Date.now(),
        summary
      })
    );
  } catch {}
}

function readUser() {
  try {
    return JSON.parse(localStorage.getItem("skillyatra_user") || "{}");
  } catch {
    return {};
  }
}

async function getJSON(path, timeoutMs = 5500) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const separator = path.includes("?") ? "&" : "?";

    const res = await fetch(
      `${API_BASE}${path}${separator}_t=${Date.now()}`,
      {
        cache: "no-store",
        signal: controller.signal,
        headers: {
          "Cache-Control": "no-cache"
        }
      }
    );

    if (!res.ok) throw new Error(path);
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
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

const DEFAULT_DASHBOARD_SUMMARY = {
  readiness: 0,
  completedTasks: 0,
  pendingTasks: 0,
  dsaDone: 0,
  practiceDone: 0,
  interviewsDone: 0,
  resumeScore: 0,
  targetCompanies: 0,
  streakDays: 0,
  activeRoadmap: "Not selected"
};

function getInitialDashboardSummary() {
  const cached = readDashboardCache();
  if (cached?.summary) return cached.summary;
  return DEFAULT_DASHBOARD_SUMMARY;
}

export default function Dashboard() {
  const [user, setUser] = useState(readUser());
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState(() => (readDashboardCache()?.summary ? "cached" : ""));
  const [summary, setSummary] = useState(getInitialDashboardSummary);
  const [refreshing, setRefreshing] = useState(false);
  const refreshRunningRef = useRef(false);
  const refreshTimerRef = useRef(null);

  const loadDashboard = async ({ manual = false } = {}) => {
    // Show existing real data immediately.
    setLoading(false);
    setUser(readUser());

    const cachedDashboard = readDashboardCache();

    if (cachedDashboard?.summary) {
      setSummary(cachedDashboard.summary);
      setLastSync(manual ? "refreshing" : "cached");
    }

    if (refreshRunningRef.current) {
      if (manual) {
        setRefreshing(true);

        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = setTimeout(() => {
          setRefreshing(false);
        }, 450);
      }

      return;
    }

    refreshRunningRef.current = true;

    if (manual) {
      setRefreshing(true);

      // Instant visual confirmation; no loading screen.
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = setTimeout(() => {
        setRefreshing(false);
      }, 450);
    }


    if (cachedDashboard?.summary) {
      setSummary(cachedDashboard.summary);
      setLastSync("cached");
    }

    const next = { ...DEFAULT_DASHBOARD_SUMMARY };

    const [dashboardRes, progressRes, readinessRes, companiesRes] = await Promise.allSettled([
      getJSON("/api/dashboard/stats"),
      getJSON("/api/progress/summary"),
      getJSON("/api/readiness"),
      getJSON("/api/companies?limit=1")
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
      pickNumber(companies?.totalCompanies, companies?.totalAllCompanies) ||
      countList(companies, "companies") ||
      pickNumber(
        dashboard?.targetCompanies,
        dashboard?.companyPlans,
        dashboard?.stats?.targetCompanies,
        dashboard?.stats?.companyPlans
      );

    next.streakDays = pickNumber(
      progress?.streakDays,
      progress?.currentStreak,
      progress?.dailyStreak,
      dashboard?.streakDays,
      dashboard?.currentStreak,
      dashboard?.dailyStreak,
      dashboard?.stats?.streakDays,
      dashboard?.stats?.currentStreak
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
      next.streakDays = next.streakDays || pickNumber(localProgress.streakDays, localProgress.currentStreak, localProgress.dailyStreak);
    } catch {}

    setSummary(next);
    writeDashboardCache(next);
    setLastSync(
      new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      })
    );

    setLoading(false);
    setRefreshing(false);
    refreshRunningRef.current = false;
  };

  useEffect(() => {
    loadDashboard({ manual: false });

    const syncOnFocus = () => {
      loadDashboard({ manual: false });
    };

    window.addEventListener("focus", syncOnFocus);

    return () => {
      window.removeEventListener("focus", syncOnFocus);
      clearTimeout(refreshTimerRef.current);
    };
  }, []);

  const name = user.name || "Student";

  const todayLabel = new Date().toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

  const focusMessage = useMemo(() => {
    if (summary.readiness >= 80) return "";
    if (summary.readiness >= 50) return "You are building good momentum. Improve weak topics, resume quality and interview fluency.";
    if (summary.readiness > 0) return "Start with daily DSA, aptitude basics and resume improvement to build stronger placement readiness.";
    return "No progress recorded yet. Start Today Plan, DSA Tracker, Practice MCQs and Resume Coach to generate your live dashboard.";
  }, [summary.readiness]);

  const priorityCards = [
    {
      title: "Placement Readiness",
      value: `${summary.readiness}%`,
      icon: Trophy,
      link: "/progress"
    },
    {
      title: "Real-Time Streak",
      value: `${summary.streakDays || 0} Days`,
      icon: CalendarCheck,
      link: "/today"
    },
    {
      title: "Resume Score",
      value: summary.resumeScore ? `${summary.resumeScore}%` : "Not analyzed",
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
    { label: "DSA", status: summary.dsaDone > 0 ? "In Progress" : "Start Now", link: "/dsa" },
    { label: "Practice MCQs", status: summary.practiceDone > 0 ? "In Progress" : "Start Now", link: "/practice" },
    { label: "Resume", status: summary.resumeScore > 0 ? "Analyzed" : "Analyze Now", link: "/resume" },
    { label: "Interview", status: summary.interviewsDone > 0 ? "Practiced" : "Practice Now", link: "/interview" }
  ];

  return (
    <div className="finaldash-page">
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap");

        .finaldash-page {
          min-height: 100vh;
          width: 100%;
          padding: 34px 42px;
          font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          color: #0F172A;
          background:
            radial-gradient(circle at 16% 4%, rgba(14,165,233,0.12), transparent 30%),
            radial-gradient(circle at 88% 10%, rgba(125,211,252,0.22), transparent 32%),
            linear-gradient(180deg, #FFFFFF 0%, #F5FCFF 48%, #FFFFFF 100%);
          position: relative;
          overflow-x: hidden;
        }

        .finaldash-page::before {
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

        .finaldash-bubble {
          position: fixed;
          border-radius: 999px;
          background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.96), rgba(125,211,252,0.30), rgba(14,165,233,0.10));
          border: 1px solid rgba(186,230,253,0.70);
          box-shadow: 0 18px 42px rgba(14,165,233,0.10);
          pointer-events: none;
          z-index: 0;
          animation: dashBubble 8s ease-in-out infinite;
        }

        .finaldash-bubble.one {
          width: 110px;
          height: 110px;
          top: 12%;
          right: 7%;
        }

        .finaldash-bubble.two {
          width: 62px;
          height: 62px;
          top: 60%;
          right: 4%;
          animation-delay: 2s;
        }

        @keyframes dashBubble {
          0%, 100% {
            transform: translate3d(0,0,0) scale(1);
            opacity: 0.55;
          }
          50% {
            transform: translate3d(18px,-22px,0) scale(1.08);
            opacity: 0.85;
          }
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(22px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .finaldash-shell {
          position: relative;
          z-index: 2;
          max-width: 1420px;
          margin: 0 auto;
        }

        .finaldash-hero {
          border-radius: 34px;
          padding: 34px 38px;
          background:
            radial-gradient(circle at 82% 16%, rgba(255,255,255,0.32), transparent 28%),
            linear-gradient(135deg, #0284C7 0%, #0EA5E9 56%, #7DD3FC 100%);
          border: 1px solid rgba(186,230,253,0.70);
          box-shadow: 0 34px 90px rgba(14,165,233,0.22);
          color: white;
          animation: fadeUp 0.65s ease both;
        }

        .finaldash-hero-grid {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          align-items: center;
          gap: 30px;
        }

        .finaldash-badge {
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

        .finaldash-title {
          margin-top: 20px;
          font-size: clamp(36px, 4.2vw, 62px);
          line-height: 1.02;
          font-weight: 950;
          letter-spacing: -2px;
          color: white;
        }

        .finaldash-desc {
          margin-top: 16px;
          max-width: 780px;
          color: rgba(255,255,255,0.90);
          font-size: 16px;
          font-weight: 720;
          line-height: 1.72;
        }

        .finaldash-actions {
          margin-top: 24px;
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .finaldash-primary,
        .finaldash-ghost {
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

        .finaldash-primary {
          background: white;
          color: #0284C7;
          box-shadow: 0 18px 38px rgba(2,132,199,0.20);
        }

        .finaldash-ghost {
          background: rgba(255,255,255,0.15);
          color: white;
          border: 1px solid rgba(255,255,255,0.32);
          backdrop-filter: blur(18px);
        }

        .finaldash-primary:hover,
        .finaldash-ghost:hover {
          transform: translateY(-3px);
        }

        .finaldash-roadmap {
          border-radius: 28px;
          background: rgba(255,255,255,0.92);
          border: 1px solid rgba(255,255,255,0.72);
          color: #0F172A;
          padding: 24px;
          box-shadow: 0 24px 60px rgba(2,132,199,0.12);
        }

        .finaldash-roadmap-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }

        .finaldash-roadmap-label {
          color: #64748B;
          font-size: 13px;
          font-weight: 950;
        }

        .finaldash-roadmap-title {
          margin-top: 9px;
          font-size: 28px;
          line-height: 1.14;
          font-weight: 950;
          color: #0F172A;
        }

        .finaldash-roadmap-icon,
        .finaldash-icon {
          width: 64px;
          height: 64px;
          min-width: 64px;
          border-radius: 23px;
          background: #EAF7FF;
          border: 2px solid #B7E3FF;
          color: #0284C7;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .finaldash-track {
          margin-top: 22px;
          height: 11px;
          border-radius: 999px;
          background: #E0F2FE;
          overflow: hidden;
        }

        .finaldash-fill {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, #0EA5E9, #22C55E);
        }

        .finaldash-sync {
          margin-top: 12px;
          color: #64748B;
          font-size: 13px;
          font-weight: 800;
        }

        .finaldash-stats {
          margin-top: 26px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 24px;
        }

        .finaldash-stat {
          min-height: 146px;
          padding: 28px 30px;
          border-radius: 30px;
          background: #FFFFFF;
          border: 2px solid #B7E3FF;
          box-shadow: 0 18px 42px rgba(14,165,233,0.08);
          text-decoration: none;
          color: inherit;
          display: grid;
          grid-template-columns: minmax(0, 1fr) 70px;
          gap: 22px;
          align-items: start;
          overflow: hidden;
          transition: all 0.24s ease;
        }

        .finaldash-stat:hover {
          transform: translateY(-6px);
          box-shadow: 0 28px 60px rgba(14,165,233,0.14);
          border-color: #7DD3FC;
        }

        .finaldash-stat-title {
          margin: 0 0 12px 0;
          color: #64748B;
          font-size: 15px;
          line-height: 1.25;
          font-weight: 950;
        }

        .finaldash-stat-value {
          margin: 0;
          color: #0F172A;
          font-size: 34px;
          line-height: 1.05;
          letter-spacing: -0.9px;
          font-weight: 950;
        }

        .finaldash-content {
          margin-top: 26px;
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 22px;
        }

        .finaldash-panel {
          border-radius: 32px;
          background: rgba(255,255,255,0.96);
          border: 1px solid rgba(186,230,253,0.95);
          box-shadow: 0 20px 50px rgba(2,132,199,0.08);
          padding: 26px;
          backdrop-filter: blur(18px);
        }

        .finaldash-panel-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .finaldash-kicker {
          margin: 0;
          color: #0284C7;
          font-size: 12px;
          font-weight: 950;
          letter-spacing: 2.5px;
          text-transform: uppercase;
        }

        .finaldash-section-title {
          margin: 9px 0 0;
          color: #0F172A;
          font-size: 27px;
          line-height: 1.15;
          font-weight: 950;
          letter-spacing: -0.8px;
        }

        .finaldash-action-grid {
          margin-top: 23px;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .finaldash-action-card {
          display: block;
          text-decoration: none;
          color: inherit;
          border-radius: 26px;
          background: #FFFFFF;
          border: 1px solid rgba(186,230,253,0.95);
          padding: 20px;
          transition: all 0.25s ease;
        }

        .finaldash-action-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 28px 58px rgba(2,132,199,0.12);
          border-color: rgba(14,165,233,0.36);
        }

        .finaldash-action-row {
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .finaldash-action-title {
          margin: 0;
          color: #0F172A;
          font-size: 17px;
          font-weight: 950;
          line-height: 1.25;
        }

        .finaldash-action-text {
          margin: 13px 0 0;
          color: #475569;
          font-size: 14px;
          font-weight: 720;
          line-height: 1.6;
        }

        .finaldash-radar-title {
          margin: 0;
          display: flex;
          align-items: center;
          gap: 12px;
          color: #0F172A;
          font-size: 27px;
          font-weight: 950;
          letter-spacing: -0.8px;
        }

        .finaldash-radar-list {
          margin-top: 23px;
          display: grid;
          gap: 14px;
        }

        .finaldash-radar-row {
          border-radius: 22px;
          border: 1px solid rgba(186,230,253,0.95);
          background: #FFFFFF;
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          text-decoration: none;
          color: inherit;
          transition: all 0.24s ease;
        }

        .finaldash-radar-row:hover {
          transform: translateY(-5px);
          border-color: rgba(14,165,233,0.45);
          box-shadow: 0 24px 52px rgba(2,132,199,0.14);
        }

        .finaldash-radar-label {
          margin: 0;
          color: #0F172A;
          font-size: 14px;
          font-weight: 950;
        }

        .finaldash-radar-status {
          border-radius: 999px;
          background: #E0F2FE;
          border: 1px solid #BAE6FD;
          color: #0284C7;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 950;
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        @media (max-width: 1120px) {
          .finaldash-hero-grid,
          .finaldash-content {
            grid-template-columns: 1fr;
          }

          .finaldash-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="finaldash-bubble one" />
      <div className="finaldash-bubble two" />

      <div className="finaldash-shell">
        <section className="finaldash-hero">
          <div className="finaldash-hero-grid">
            <div>
              <div className="finaldash-badge">
                <Sparkles size={16} />
                Live Placement Dashboard
              </div>

              <h1 className="finaldash-title">
                Welcome back, {name}
              </h1>

              <p className="finaldash-desc">
                {focusMessage}
              </p>

              <div className="finaldash-actions">
                <Link to="/today" className="finaldash-primary">
                  Continue Today Plan
                  <ArrowRight size={16} />
                </Link>

                <button
                  type="button"
                  onClick={() => loadDashboard({ manual: true })}
                  className="finaldash-ghost"
                  aria-label="Refresh dashboard data"
                >
                  <RefreshCw
                    size={16}
                    className={refreshing ? "animate-spin" : ""}
                  />
                  {refreshing ? "Refreshed" : "Refresh Live Data"}
                </button>
              </div>
            </div>

            <div className="finaldash-roadmap">
              <div className="finaldash-roadmap-top">
                <div>
                  <p className="finaldash-roadmap-label">Active Roadmap</p>
                  <h2 className="finaldash-roadmap-title">{summary.activeRoadmap}</h2>
                </div>

                <div className="finaldash-roadmap-icon">
                  <GraduationCap size={30} strokeWidth={2.5} />
                </div>
              </div>

              <div className="finaldash-track">
                <div className="finaldash-fill" style={{ width: `${summary.readiness}%` }} />
              </div>

              <p className="finaldash-sync">
                {lastSync === "refreshing"
                  ? "Showing saved live data. Updating silently..."
                  : `Live synced${
                      lastSync && lastSync !== "cached"
                        ? ` at ${lastSync}`
                        : ""
                    }.`}
              </p>
            </div>
          </div>
        </section>

        <section className="finaldash-stats">
          {priorityCards.map((card) => {
            const Icon = card.icon;

            return (
              <Link key={card.title} to={card.link} className="finaldash-stat">
                <div>
                  <p className="finaldash-stat-title">{card.title}</p>
                  <h2 className="finaldash-stat-value">{card.value}</h2>
                </div>

                <div className="finaldash-icon">
                  <Icon size={30} strokeWidth={2.5} />
                </div>
              </Link>
            );
          })}
        </section>

        <section className="finaldash-content">
          <div className="finaldash-panel">
            <div className="finaldash-panel-head">
              <div>
                <p className="finaldash-kicker">Next Best Actions</p>
                <h2 className="finaldash-section-title">Continue from your real progress</h2>
              </div>

              <div className="finaldash-icon">
                <BarChart3 size={28} strokeWidth={2.5} />
              </div>
            </div>

            <div className="finaldash-action-grid">
              {actionCards.map((item) => {
                const Icon = item.icon;

                return (
                  <Link key={item.title} to={item.link} className="finaldash-action-card">
                    <div className="finaldash-action-row">
                      <div className="finaldash-icon">
                        <Icon size={24} strokeWidth={2.5} />
                      </div>
                      <h3 className="finaldash-action-title">{item.title}</h3>
                    </div>

                    <p className="finaldash-action-text">
                      {item.text}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="finaldash-panel">
            <h2 className="finaldash-radar-title">
              <Flame size={30} color="#F97316" />
              Focus Radar
            </h2>

            <div className="finaldash-radar-list">
              {radarItems.map((item) => (
                <Link key={item.label} to={item.link} className="finaldash-radar-row">
                  <p className="finaldash-radar-label">{item.label}</p>
                  <span className="finaldash-radar-status">
                    {item.status}
                    <ArrowRight size={13} />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
