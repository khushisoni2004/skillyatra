import { Link } from "react-router-dom";
import {
  ArrowRight,
  Brain,
  Building2,
  CalendarCheck,
  FileText,
  Sparkles,
  Target,
  Trophy
} from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: CalendarCheck,
      title: "Daily Plan",
      text: "Plan today, track weekly progress, and stay consistent for placement preparation."
    },
    {
      icon: Brain,
      title: "DSA + MCQ Practice",
      text: "Solve topic-wise DSA, aptitude, CS fundamentals and interview practice questions."
    },
    {
      icon: Building2,
      title: "Company Preparation",
      text: "Use company and role data to prepare skills, patterns, gaps and practice sets."
    },
    {
      icon: FileText,
      title: "Resume Coach",
      text: "Analyze resume, ATS score, missing skills, project strength and role readiness."
    }
  ];

  return (
    <div className="min-h-screen overflow-hidden bg-[#eef4fb] text-slate-950">
      <div className="pointer-events-none fixed -left-32 -top-32 h-96 w-96 animate-pulse rounded-full bg-indigo-300/40 blur-3xl" />
      <div className="pointer-events-none fixed -right-32 top-32 h-96 w-96 animate-pulse rounded-full bg-emerald-300/40 blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 animate-pulse rounded-full bg-blue-300/30 blur-3xl" />

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-emerald-500 text-xl font-black text-white shadow-lg">
            S
          </div>
          <div>
            <h1 className="text-xl font-black leading-tight">SkillYatra</h1>
            <p className="text-xs font-bold text-slate-500">Placement GPS</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/login" className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50">
            Login
          </Link>
          <Link to="/signup" className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700">
            Sign Up
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-8 pb-16">
        <section className="grid items-center gap-12 pt-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-4 py-2 text-sm font-black text-indigo-700 shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4" />
              AI Powered Placement Preparation Platform
            </div>

            <h2 className="mt-7 text-5xl font-black leading-[1.05] tracking-tight md:text-7xl">
              Your complete
              <span className="block bg-gradient-to-r from-indigo-700 via-blue-600 to-emerald-500 bg-clip-text text-transparent">
                Placement GPS
              </span>
            </h2>

            <p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-slate-600">
              SkillYatra helps students follow daily tasks, solve DSA, practice MCQs,
              prepare company-wise, improve resume, and train for interviews from one clean dashboard.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/login" className="group inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-7 py-4 text-sm font-black text-white shadow-xl shadow-indigo-100 hover:bg-indigo-700">
                Login to Continue
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>

              <Link to="/signup" className="rounded-2xl bg-white px-7 py-4 text-sm font-black text-slate-800 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50">
                Create Account
              </Link>

              <Link to="/dashboard" className="rounded-2xl border border-indigo-200 bg-indigo-50 px-7 py-4 text-sm font-black text-indigo-700 hover:bg-indigo-100">
                Open Demo Dashboard
              </Link>
            </div>

            <div className="mt-10 grid max-w-2xl grid-cols-3 gap-4">
              {[
                ["72%", "Ready Score"],
                ["100+", "Practice Sets"],
                ["AI", "Resume + Interview"]
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl bg-white/90 p-5 shadow-sm ring-1 ring-slate-200 backdrop-blur">
                  <p className="text-3xl font-black text-slate-950">{value}</p>
                  <p className="mt-1 text-xs font-black uppercase tracking-wide text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-indigo-500 via-blue-500 to-emerald-400 opacity-30 blur-2xl" />
            <div className="relative rounded-[2.5rem] bg-slate-950 p-5 text-white shadow-2xl">
              <div className="rounded-2xl bg-gradient-to-br from-indigo-700 via-blue-600 to-emerald-500 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-indigo-100">Dashboard Preview</p>
                    <h3 className="mt-3 text-3xl font-black">Placement Ready</h3>
                  </div>
                  <Trophy className="h-12 w-12 text-yellow-200" />
                </div>

                <div className="mt-8 rounded-2xl bg-white/15 p-5 ring-1 ring-white/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black">Readiness</span>
                    <span className="text-3xl font-black">72%</span>
                  </div>
                  <div className="mt-4 h-3 rounded-full bg-white/20">
                    <div className="h-3 w-[72%] rounded-full bg-white" />
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4">
                  {["DSA Tracker", "Resume Coach", "Interview AI", "Companies"].map((item) => (
                    <div key={item} className="rounded-2xl bg-white p-4 text-slate-900 shadow-sm">
                      <p className="text-sm font-black">{item}</p>
                      <p className="mt-1 text-xs font-bold text-slate-500">Active</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-xl">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-black">{item.title}</h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{item.text}</p>
              </div>
            );
          })}
        </section>

        <section className="mt-16 rounded-[2.5rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-indigo-600">How it works</p>
          <h3 className="mt-3 text-3xl font-black">One flow for complete preparation</h3>
          <div className="mt-8 grid gap-5 md:grid-cols-4">
            {["Set daily study tasks", "Practice DSA and MCQs", "Analyze resume gaps", "Prepare interviews"].map((step, index) => (
              <div key={step} className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-sm font-black text-white">
                  {index + 1}
                </div>
                <p className="mt-4 text-sm font-black text-slate-900">{step}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
