import React, { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  Brain,
  BriefcaseBusiness,
  CalendarCheck,
  FileText,
  LayoutDashboard,
  LogOut,
  Map,
  PenTool,
  Trophy,
  UserCircle
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Today Plan", path: "/today", icon: CalendarCheck },
  { label: "Roadmaps", path: "/roadmaps", icon: Map },
  { label: "DSA Tracker", path: "/dsa", icon: PenTool },
  { label: "Practice MCQs", path: "/practice", icon: Brain },
  { label: "Resources", path: "/resources", icon: BookOpen },
  { label: "Companies", path: "/companies", icon: BriefcaseBusiness },
  { label: "Resume Coach", path: "/resume", icon: FileText },
  { label: "Interview Coach", path: "/interview", icon: UserCircle },
  { label: "Progress", path: "/progress", icon: BarChart3 }
];

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("skillyatra_user") || "{}");
  } catch {
    return {};
  }
}

export default function Layout() {
  const [user, setUser] = useState(getUser());
  const [readiness, setReadiness] = useState(0);

  useEffect(() => {
    setUser(getUser());

    async function loadReadiness() {
      const urls = [
        `${API_BASE}/api/readiness`,
        `${API_BASE}/api/progress/summary`,
        `${API_BASE}/api/dashboard/stats`
      ];

      for (const url of urls) {
        try {
          const res = await fetch(url);
          if (!res.ok) continue;

          const data = await res.json();

          const score =
            data.readiness ??
            data.readinessScore ??
            data.placementReadiness ??
            data.progressPercent ??
            data.overallProgress ??
            data.stats?.readiness ??
            data.stats?.readinessScore;

          if (typeof score === "number") {
            setReadiness(Math.max(0, Math.min(100, Math.round(score))));
            return;
          }
        } catch {}
      }

      setReadiness(0);
    }

    loadReadiness();
  }, []);

  const name = user.name || "Devendra";
  const email = user.email || "dev@gmail.com";

  return (
    <div className="skill-layout">
      <aside className="skill-sidebar px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-emerald-500 text-xl font-black text-white shadow-sm">
            S
          </div>

          <div>
            <h1 className="text-xl font-black leading-tight text-slate-950">
              SkillYatra
            </h1>
            <p className="text-xs font-bold text-slate-500">
              Placement GPS
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Trophy className="h-6 w-6" />
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                Readiness
              </p>
              <h2 className="text-lg font-black leading-tight text-slate-950">
                {readiness}% Placement Ready
              </h2>
            </div>
          </div>

          <div className="mt-4 h-2 rounded-full bg-slate-200">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-indigo-600 to-emerald-500 transition-all"
              style={{ width: `${readiness}%` }}
            />
          </div>
        </div>

        <nav className="mt-8 space-y-2 pb-6">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex h-12 items-center gap-3 rounded-2xl px-4 text-sm font-black transition ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-100"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 pb-4 pt-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
              <UserCircle className="h-7 w-7" />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-black text-slate-950">
                {name}
              </p>
              <p className="truncate text-xs font-semibold text-slate-500">
                {email}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              localStorage.removeItem("skillyatra_token");
              localStorage.removeItem("skillyatra_user");
              window.location.href = "/";
            }}
            className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-sm font-black text-slate-700 hover:bg-slate-50"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      <main className="skill-main">
        <Outlet />
      </main>
    </div>
  );
}
