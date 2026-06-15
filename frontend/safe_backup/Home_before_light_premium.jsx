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
    <div className="home-premium min-h-screen overflow-hidden bg-[#0F0F1A] text-white">
      <style>{`
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes floatPreview {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-14px); }
        }

        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes glowPulse {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 0.75; transform: scale(1.08); }
        }

        @keyframes progressGrow {
          from { width: 0%; }
          to { width: 72%; }
        }

        .home-premium {
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .home-animate {
          opacity: 0;
          animation: heroFadeUp 0.8s ease forwards;
        }

        .home-feature-1 { animation-delay: 0.10s; }
        .home-feature-2 { animation-delay: 0.25s; }
        .home-feature-3 { animation-delay: 0.40s; }
        .home-feature-4 { animation-delay: 0.55s; }

        .home-preview-float {
          animation: floatPreview 4s ease-in-out infinite;
        }

        .home-gradient-bg {
          background-size: 220% 220%;
          animation: gradientShift 9s ease infinite;
        }

        .home-glow {
          animation: glowPulse 5s ease-in-out infinite;
        }

        .home-progress-fill {
          animation: progressGrow 1.2s ease forwards;
        }
      `}</style>

      <div className="pointer-events-none fixed -left-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-[#6C63FF]/30 blur-3xl home-glow" />
      <div className="pointer-events-none fixed -right-40 top-24 h-[32rem] w-[32rem] rounded-full bg-[#00D4AA]/20 blur-3xl home-glow" />
      <div className="pointer-events-none fixed bottom-[-10rem] left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-blue-500/15 blur-3xl home-glow" />

      <header className="relative z-20 border-b border-white/10 bg-[#0F0F1A]/80 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6C63FF] to-[#00D4AA] text-xl font-black text-white shadow-2xl shadow-[#6C63FF]/25">
              S
            </div>
            <div>
              <h1 className="text-xl font-black leading-tight tracking-tight text-white">
                SkillYatra
              </h1>
              <p className="text-xs font-bold text-[#9898B8]">Placement GPS</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/10"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="rounded-2xl bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] px-5 py-3 text-sm font-black text-white shadow-xl shadow-[#6C63FF]/25 transition hover:-translate-y-0.5 hover:shadow-[#6C63FF]/40"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-5 pb-16 sm:px-8">
        <section className="grid items-center gap-12 pt-14 lg:grid-cols-[1.02fr_0.98fr] lg:pt-20">
          <div className="home-animate">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#6C63FF]/30 bg-[#6C63FF]/10 px-4 py-2 text-sm font-black text-[#C8C4FF] shadow-lg shadow-[#6C63FF]/10 backdrop-blur">
              <Sparkles className="h-4 w-4 text-[#00D4AA]" />
              AI Powered Placement Preparation Platform
            </div>

            <h2 className="mt-7 text-5xl font-black leading-[1.02] tracking-[-0.06em] text-white md:text-7xl">
              Your complete
              <span className="block bg-gradient-to-r from-[#8B5CF6] via-[#6C63FF] to-[#00D4AA] bg-clip-text text-transparent">
                Placement GPS
              </span>
            </h2>

            <p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-[#B8B8D1]">
              SkillYatra helps students follow daily tasks, solve DSA, practice MCQs,
              prepare company-wise, improve resume, and train for interviews from one clean dashboard.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/login"
                className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] px-7 py-4 text-sm font-black text-white shadow-2xl shadow-[#6C63FF]/25 transition hover:-translate-y-1 hover:shadow-[#6C63FF]/40"
              >
                Login to Continue
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>

              <Link
                to="/signup"
                className="rounded-2xl border border-white/10 bg-white/5 px-7 py-4 text-sm font-black text-white backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/10"
              >
                Create Account
              </Link>

              <Link
                to="/dashboard"
                className="rounded-2xl border border-[#6C63FF]/40 bg-[#6C63FF]/10 px-7 py-4 text-sm font-black text-[#C8C4FF] transition hover:-translate-y-1 hover:bg-[#6C63FF]/20"
              >
                Open Demo Dashboard
              </Link>
            </div>

            <div className="mt-10 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                ["72%", "Ready Score"],
                ["100+", "Practice Sets"],
                ["AI", "Resume + Interview"]
              ].map(([value, label], index) => (
                <div
                  key={label}
                  className="home-animate rounded-3xl border border-[#2A2A45] bg-[#1E1E35]/80 p-5 shadow-xl shadow-black/20 backdrop-blur-xl"
                  style={{ animationDelay: `${0.25 + index * 0.12}s` }}
                >
                  <p className="text-3xl font-black text-white">{value}</p>
                  <p className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-[#9898B8]">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative home-animate home-preview-float" style={{ animationDelay: "0.2s" }}>
            <div className="absolute -inset-5 rounded-[2.7rem] bg-gradient-to-br from-[#6C63FF] via-blue-500 to-[#00D4AA] opacity-35 blur-2xl" />
            <div className="relative rounded-[2.7rem] border border-white/10 bg-[#070712] p-5 text-white shadow-2xl shadow-black/50">
              <div className="home-gradient-bg rounded-[2rem] bg-gradient-to-br from-[#1a1a3e] via-[#6C63FF] to-[#00D4AA] p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.35em] text-white/70">
                      Dashboard Preview
                    </p>
                    <h3 className="mt-3 text-3xl font-black text-white">
                      Placement Ready
                    </h3>
                  </div>
                  <div className="rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-xl">
                    <Trophy className="h-10 w-10 text-yellow-200" />
                  </div>
                </div>

                <div className="mt-8 rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-white">Readiness</span>
                    <span className="text-3xl font-black text-white">72%</span>
                  </div>
                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/20">
                    <div className="home-progress-fill h-3 rounded-full bg-gradient-to-r from-white to-[#00D4AA]" />
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {["DSA Tracker", "Resume Coach", "Interview AI", "Companies"].map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/15 bg-white/90 p-4 text-slate-950 shadow-xl backdrop-blur-xl transition hover:-translate-y-1"
                    >
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
          {features.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className={`home-animate home-feature-${index + 1} group rounded-3xl border border-[#2A2A45] bg-[#1E1E35]/90 p-6 shadow-xl shadow-black/20 backdrop-blur-xl transition hover:-translate-y-2 hover:border-[#6C63FF]/50 hover:shadow-2xl hover:shadow-[#6C63FF]/10`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#6C63FF]/30 bg-[#6C63FF]/15 text-[#8B5CF6] transition duration-300 group-hover:scale-115 group-hover:bg-[#6C63FF]/25">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-black text-white">{item.title}</h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-[#9898B8]">
                  {item.text}
                </p>
              </div>
            );
          })}
        </section>

        <section className="mt-16 rounded-[2.2rem] border border-[#2A2A45] bg-[#1A1A2E]/90 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[#00D4AA]">
            How it works
          </p>
          <h3 className="mt-3 text-3xl font-black tracking-tight text-white">
            One flow for complete preparation
          </h3>

          <div className="mt-8 grid gap-5 md:grid-cols-4">
            {["Set daily study tasks", "Practice DSA and MCQs", "Analyze resume gaps", "Prepare interviews"].map((step, index) => (
              <div
                key={step}
                className="rounded-3xl border border-[#2A2A45] bg-[#0F0F1A]/70 p-5 transition hover:-translate-y-1 hover:border-[#6C63FF]/40"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#00D4AA] text-sm font-black text-white shadow-lg shadow-[#6C63FF]/20">
                  {index + 1}
                </div>
                <p className="mt-4 text-sm font-black text-white">{step}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-[2.2rem] border border-[#6C63FF]/20 bg-gradient-to-br from-[#1E1E35] to-[#13131F] p-8 text-center shadow-2xl shadow-black/20">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6C63FF]/15 text-[#00D4AA]">
            <Target className="h-7 w-7" />
          </div>
          <h3 className="mt-5 text-3xl font-black tracking-tight text-white">
            Start your placement preparation today
          </h3>
          <p className="mx-auto mt-3 max-w-2xl text-sm font-semibold leading-7 text-[#9898B8]">
            Follow your plan, practice consistently, track progress, and prepare for companies with one focused dashboard.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-4">
            <Link
              to="/signup"
              className="rounded-2xl bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] px-7 py-4 text-sm font-black text-white shadow-xl shadow-[#6C63FF]/25 transition hover:-translate-y-1"
            >
              Create Account
            </Link>
            <Link
              to="/login"
              className="rounded-2xl border border-[#6C63FF]/40 bg-[#6C63FF]/10 px-7 py-4 text-sm font-black text-[#C8C4FF] transition hover:-translate-y-1 hover:bg-[#6C63FF]/20"
            >
              Login to Continue
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
