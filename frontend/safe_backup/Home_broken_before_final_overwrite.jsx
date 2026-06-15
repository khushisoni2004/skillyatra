import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  Brain,
  Building2,
  CalendarCheck,
  CheckCircle2,
  Code2,
  FileText,
  GraduationCap,
  Layers3,
  LineChart,
  MessageSquareText,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  UsersRound,
  Mic2,
  BriefcaseBusiness,
  HelpCircle
  HelpCircle,
  BriefcaseBusiness,
  Mic2,
  Code2,
  FileText,
} from "lucide-react";

function CountUpValue({ value, suffix, active }) {
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!active) return;

    const end = Number.parseInt(value, 10);
    const duration = 1200;
    const step = end / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current = Math.min(current + step, end);
      setDisplay(Math.floor(current) + suffix);

      if (current >= end) clearInterval(timer);
    }, 16);

    return () => clearInterval(timer);
  }, [active, value, suffix]);

  return <>{active ? display : "0" + suffix}</>;
}

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    const timer = setTimeout(() => setVisible(true), 100);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timer);
    };
  }, []);

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

  const stats = [
    { value: "72", suffix: "%", label: "Ready Score" },
    { value: "100", suffix: "+", label: "Practice Sets" },
    { value: "24", suffix: "/7", label: "Study Flow" }
  ];

  const preparationBlocks = [
    {
      icon: Code2,
      title: "Coding Practice",
      text: "Practice logic building, DSA patterns, and company-style coding rounds."
    },
    {
      icon: BookOpenCheck,
      title: "Core CS Revision",
      text: "Revise DBMS, OS, CN, OOP and interview-focused computer science topics."
    },
    {
      icon: MessageSquareText,
      title: "Interview Training",
      text: "Prepare HR, technical, project explanation and communication answers."
    }
  ];

  return (
    <div className="home-page">
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap");

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html,
        body {
          overflow-x: hidden;
        }

        .home-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at 12% 8%, rgba(14, 165, 233, 0.20), transparent 30%),
            radial-gradient(circle at 88% 10%, rgba(56, 189, 248, 0.22), transparent 32%),
            linear-gradient(180deg, #F8FCFF 0%, #EEF8FF 48%, #FFFFFF 100%);
          color: #0F172A;
          font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          overflow-x: hidden;
          position: relative;
        }

        .home-page::before {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          background-image:
            linear-gradient(rgba(14, 165, 233, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(14, 165, 233, 0.05) 1px, transparent 1px);
          background-size: 42px 42px;
          mask-image: linear-gradient(to bottom, black, transparent 75%);
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(28px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes floatCard {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-12px);
          }
        }

        @keyframes skyShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes barFill {
          from {
            width: 0%;
          }
          to {
            width: 72%;
          }
        }

        @keyframes softPulse {
          0%, 100% {
            opacity: 0.55;
            transform: scale(1);
          }
          50% {
            opacity: 0.85;
            transform: scale(1.08);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(220%);
          }
        }

        .sky-blob {
          position: fixed;
          border-radius: 999px;
          filter: blur(70px);
          pointer-events: none;
          animation: softPulse 6s ease-in-out infinite;
        }

        .enter {
          opacity: 0;
          animation: fadeUp 0.75s ease forwards;
        }

        .delay-1 { animation-delay: 0.08s; }
        .delay-2 { animation-delay: 0.18s; }
        .delay-3 { animation-delay: 0.30s; }
        .delay-4 { animation-delay: 0.44s; }
        .delay-5 { animation-delay: 0.58s; }

        .home-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          transition: all 0.28s ease;
        }

        .home-nav.scrolled {
          background: rgba(255, 255, 255, 0.82);
          backdrop-filter: blur(18px);
          box-shadow:
            0 1px 0 rgba(14, 165, 233, 0.12),
            0 18px 48px rgba(2, 132, 199, 0.10);
        }

        .nav-link {
          text-decoration: none;
          font-size: 13px;
          font-weight: 900;
          border-radius: 16px;
          transition: all 0.22s ease;
          white-space: nowrap;
        }

        .nav-link:hover {
          transform: translateY(-2px);
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          padding: 15px 28px;
          border-radius: 20px;
          background: linear-gradient(135deg, #0EA5E9, #38BDF8);
          color: #FFFFFF;
          text-decoration: none;
          font-size: 14px;
          font-weight: 950;
          box-shadow: 0 18px 38px rgba(14, 165, 233, 0.28);
          transition: all 0.25s ease;
          position: relative;
          overflow: hidden;
        }

        .btn-primary::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent);
          transform: translateX(-100%);
        }

        .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 24px 48px rgba(14, 165, 233, 0.34);
        }

        .btn-primary:hover::after {
          animation: shimmer 0.75s ease;
        }

        .btn-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          padding: 15px 28px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.88);
          color: #075985;
          border: 1px solid rgba(14, 165, 233, 0.18);
          text-decoration: none;
          font-size: 14px;
          font-weight: 950;
          box-shadow: 0 16px 34px rgba(2, 132, 199, 0.08);
          backdrop-filter: blur(18px);
          transition: all 0.25s ease;
        }

        .btn-secondary:hover {
          transform: translateY(-3px);
          border-color: rgba(14, 165, 233, 0.42);
          background: #FFFFFF;
        }

        .hero-grid {
          display: grid;
          grid-template-columns: 1.08fr 0.92fr;
          align-items: center;
          gap: 58px;
          padding-top: 132px;
        }

        .hero-title {
          margin-top: 28px;
          font-size: 70px;
          line-height: 1.02;
          letter-spacing: -2.4px;
          color: #0F172A;
          font-weight: 950;
        }

        .gradient-text {
          background: linear-gradient(135deg, #0284C7, #0EA5E9, #38BDF8);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: skyShift 6s ease infinite;
        }

        .dashboard-card {
          position: relative;
          background: rgba(255,255,255,0.82);
          border: 1px solid rgba(186, 230, 253, 0.95);
          border-radius: 38px;
          padding: 18px;
          box-shadow: 0 34px 90px rgba(2, 132, 199, 0.18);
          backdrop-filter: blur(24px);
          animation: floatCard 5s ease-in-out infinite;
          overflow: hidden;
        }

        .dashboard-card::before {
          content: "";
          position: absolute;
          inset: -1px;
          background: linear-gradient(135deg, rgba(14,165,233,0.18), transparent 42%, rgba(125,211,252,0.18));
          pointer-events: none;
        }

        .feature-card {
          background: rgba(255,255,255,0.92);
          border: 1px solid rgba(186, 230, 253, 0.8);
          border-radius: 30px;
          padding: 28px;
          box-shadow: 0 20px 50px rgba(2, 132, 199, 0.08);
          backdrop-filter: blur(18px);
          transition: all 0.25s ease;
          position: relative;
          overflow: hidden;
        }

        .feature-card::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at top right, rgba(14,165,233,0.12), transparent 45%);
          pointer-events: none;
        }

        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 30px 70px rgba(2, 132, 199, 0.14);
          border-color: rgba(14, 165, 233, 0.34);
        }

        .feature-icon {
          transition: all 0.28s ease;
        }

        .feature-card:hover .feature-icon {
          transform: scale(1.12) rotate(-4deg);
        }

        .mini-card {
          background: #FFFFFF;
          border: 1px solid #E0F2FE;
          border-radius: 22px;
          padding: 18px;
          box-shadow: 0 14px 32px rgba(2, 132, 199, 0.08);
          transition: all 0.25s ease;
        }

        .mini-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 22px 42px rgba(2, 132, 199, 0.12);
        }

        .step-card {
          background: #FFFFFF;
          border: 1px solid #E0F2FE;
          border-radius: 26px;
          padding: 25px;
          box-shadow: 0 18px 42px rgba(2, 132, 199, 0.08);
          transition: all 0.25s ease;
        }

        .step-card:hover {
          transform: translateY(-5px);
          border-color: rgba(14,165,233,0.35);
          box-shadow: 0 28px 58px rgba(2,132,199,0.12);
        }

        .arrow-anim {
          transition: transform 0.2s ease;
        }

        a:hover .arrow-anim {
          transform: translateX(5px);
        }

        @media (max-width: 1100px) {
          .flow-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }

          .flow-line {
            display: none !important;
          }
        }

        @media (max-width: 980px) {
          .hero-grid {
            grid-template-columns: 1fr;
          }

          .features-grid,
          .prep-grid,
          .steps-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }

          .hero-title {
            font-size: 54px;
          }
        }

        @media (max-width: 640px) {
          .home-main,
          .nav-inner {
            padding-left: 18px !important;
            padding-right: 18px !important;
          }

          .hero-grid {
            padding-top: 112px;
          }

          .hero-title {
            font-size: 42px;
            letter-spacing: -1.3px;
          }

          .features-grid,
          .prep-grid,
          .steps-grid,
          .flow-grid,
          .stats-grid {
            grid-template-columns: 1fr !important;
          }

          .nav-actions {
            gap: 8px !important;
          }

          .nav-actions a {
            padding: 9px 13px !important;
            font-size: 12px !important;
          }
        }
      `}</style>

      <div
        className="sky-blob"
        style={{
          width: 560,
          height: 560,
          left: -190,
          top: -150,
          background: "rgba(14,165,233,0.18)",
          animationDelay: "0s"
        }}
      />
      <div
        className="sky-blob"
        style={{
          width: 470,
          height: 470,
          right: -170,
          top: 160,
          background: "rgba(56,189,248,0.20)",
          animationDelay: "2s"
        }}
      />
      <div
        className="sky-blob"
        style={{
          width: 420,
          height: 420,
          left: "42%",
          bottom: -180,
          background: "rgba(186,230,253,0.55)",
          animationDelay: "4s"
        }}
      />

      <nav className={`home-nav${scrolled ? " scrolled" : ""}`}>
        <div
          className="nav-inner"
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            padding: "18px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 24,
                background: "linear-gradient(135deg, #0EA5E9, #7DD3FC)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                fontWeight: 950,
                fontSize: 20,
                boxShadow: "0 20px 44px rgba(14,165,233,0.32)"
              }}
            >
              <GraduationCap size={34} strokeWidth={2.6} />
            </div>

            <div>
              <div style={{ fontSize: 24, fontWeight: 950, color: "#0F172A", letterSpacing: "-0.7px" }}>
                SkillYatra
              </div>
              <div style={{ fontSize: 13, fontWeight: 900, color: "#0284C7", letterSpacing: "0.4px" }}>
                Placement GPS
              </div>
            </div>
          </div>

          <div className="nav-actions" style={{ display: "flex", gap: 10 }}>
            <Link
              to="/login"
              className="nav-link"
              style={{
                padding: "13px 28px",
                background: "rgba(255,255,255,0.95)",
                border: "1px solid rgba(14,165,233,0.25)",
                color: "#075985",
                fontSize: 15,
                boxShadow: "0 14px 30px rgba(2,132,199,0.10)"
              }}
            >
              Login
            </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
