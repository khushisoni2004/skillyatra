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
  Mic,
  RefreshCw,
  Sparkles,
  Target,
  Trophy
} from "lucide-react";
import { Link } from "react-router-dom";

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

  return (
    <div className="min-h-screen bg-slate-100 px-8 py-8">
      <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-900 to-blue-600 p-8 text-white shadow-xl">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-black">
              <Sparkles className="h-4 w-4" />
              Live Placement Dashboard
            </div>

            <h1 className="mt-5 text-5xl font-black leading-tight">
              Welcome back, {name}
            </h1>

            <p className="mt-4 max-w-3xl text-base font-semibold leading-7 text-indigo-100">
              {focusMessage}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/today"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-indigo-700 shadow-lg hover:bg-indigo-50"
              >
                Continue Today Plan
                <ArrowRight className="h-4 w-4" />
              </Link>

              <button
                onClick={loadDashboard}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-black text-white hover:bg-white/20"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Live Data
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-white/10 p-6 ring-1 ring-white/20">
            <p className="text-sm font-black text-indigo-100">Active Roadmap</p>
            <h2 className="mt-2 text-3xl font-black">{summary.activeRoadmap}</h2>

            <div className="mt-5 h-3 rounded-full bg-white/20">
              <div
                className="h-3 rounded-full bg-white transition-all"
                style={{ width: `${summary.readiness}%` }}
              />
            </div>

            <p className="mt-3 text-sm font-bold text-indigo-100">
              {loading ? "Loading live progress..." : "Synced from your progress records."}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-3">
        {priorityCards.map((card) => {
          const Icon = card.icon;

          return (
            <Link
              key={card.title}
              to={card.link}
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-black text-slate-500">{card.title}</p>
                  <h2 className="mt-3 text-3xl font-black text-slate-950">{card.value}</h2>
                  <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
                    {card.text}
                  </p>
                </div>

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <Icon className="h-7 w-7" />
                </div>
              </div>
            </Link>
          );
        })}
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600">
                Next Best Actions
              </p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">
                Continue from your real progress
              </h2>
            </div>

            <BarChart3 className="h-7 w-7 text-indigo-600" />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {actionCards.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.title}
                  to={item.link}
                  className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200 transition hover:bg-indigo-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
                      <Icon className="h-5 w-5" />
                    </div>

                    <h3 className="text-lg font-black text-slate-950">{item.title}</h3>
                  </div>

                  <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
                    {item.text}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center gap-3">
            <Flame className="h-7 w-7 text-orange-500" />
            <h2 className="text-2xl font-black text-slate-950">Focus Radar</h2>
          </div>

          <div className="mt-6 space-y-4">
            {[
              ["DSA", summary.dsaDone > 0 ? "In Progress" : "Start Now"],
              ["Practice MCQs", summary.practiceDone > 0 ? "In Progress" : "Start Now"],
              ["Resume", summary.resumeScore > 0 ? "Analyzed" : "Analyze Now"],
              ["Interview", summary.interviewsDone > 0 ? "Practiced" : "Practice Now"]
            ].map(([label, status]) => (
              <div key={label} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-black text-slate-800">{label}</p>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700">
                  {status}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl bg-emerald-50 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-1 h-5 w-5 text-emerald-600" />
              <p className="text-sm font-bold leading-6 text-emerald-800">
                Dashboard values update from backend/progress. No static database-count report is shown.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
