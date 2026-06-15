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
  UsersRound
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

  const steps = [
    "Set daily study tasks",
    "Practice DSA and MCQs",
    "Analyze resume gaps",
    "Prepare interviews"
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
          <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 18,
                background: "linear-gradient(135deg, #0EA5E9, #7DD3FC)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                fontWeight: 950,
                fontSize: 20,
                boxShadow: "0 16px 34px rgba(14,165,233,0.28)"
              }}
            >
              S
            </div>

            <div>
              <div style={{ fontSize: 18, fontWeight: 950, color: "#0F172A" }}>
                SkillYatra
              </div>
              <div style={{ fontSize: 11, fontWeight: 850, color: "#0284C7" }}>
                Placement GPS
              </div>
            </div>
          </div>

          <div className="nav-actions" style={{ display: "flex", gap: 10 }}>
            <Link
              to="/login"
              className="nav-link"
              style={{
                padding: "10px 22px",
                background: "rgba(255,255,255,0.88)",
                border: "1px solid rgba(186,230,253,0.95)",
                color: "#075985",
                boxShadow: "0 12px 26px rgba(2,132,199,0.08)"
              }}
            >
              Login
            </Link>

            <Link
              to="/signup"
              className="nav-link"
              style={{
                padding: "10px 22px",
                background: "linear-gradient(135deg, #0EA5E9, #38BDF8)",
                color: "white",
                boxShadow: "0 16px 34px rgba(14,165,233,0.26)"
              }}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      <main
        className="home-main"
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "0 32px 84px",
          position: "relative",
          zIndex: 2
        }}
      >
        <section className="hero-grid">
          <div>
            <div
              className={visible ? "enter delay-1" : ""}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "9px 17px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.88)",
                border: "1px solid rgba(186,230,253,0.9)",
                color: "#0284C7",
                fontSize: 12,
                fontWeight: 950,
                boxShadow: "0 16px 36px rgba(2,132,199,0.08)",
                backdropFilter: "blur(18px)"
              }}
            >
              <Sparkles size={14} />
              AI Powered Placement Preparation Platform
            </div>

            <h2 className={`hero-title ${visible ? "enter delay-2" : ""}`}>
              Your complete
              <br />
              <span className="gradient-text">Placement GPS</span>
            </h2>

            <p
              className={visible ? "enter delay-3" : ""}
              style={{
                marginTop: 22,
                maxWidth: 560,
                color: "#475569",
                fontSize: 17,
                lineHeight: 1.8,
                fontWeight: 650
              }}
            >
              SkillYatra helps students follow daily tasks, solve DSA, practice MCQs,
              prepare company-wise, improve resume, and train for interviews from one clean dashboard.
            </p>

            <div
              className={visible ? "enter delay-4" : ""}
              style={{
                marginTop: 34,
                display: "flex",
                flexWrap: "wrap",
                gap: 13
              }}
            >
              <Link to="/login" className="btn-primary">
                Login to Continue
                <ArrowRight size={16} className="arrow-anim" />
              </Link>

              <Link to="/signup" className="btn-secondary">
                Create Account
              </Link>

              <Link to="/dashboard" className="btn-secondary">
                Open Demo Dashboard
              </Link>
            </div>

            <div
              className={`stats-grid ${visible ? "enter delay-5" : ""}`}
              style={{
                marginTop: 38,
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 14,
                maxWidth: 500
              }}
            >
              {stats.map(({ value, suffix, label }) => (
                <div
                  key={label}
                  className="mini-card"
                  style={{ borderTop: "4px solid #0EA5E9" }}
                >
                  <p style={{ fontSize: 31, fontWeight: 950, color: "#0F172A" }}>
                    {value === "24" ? (
                      <CountUpValue value={value} suffix={suffix} active={visible} />
                    ) : value === "AI" ? (
                      "AI"
                    ) : (
                      <CountUpValue value={value} suffix={suffix} active={visible} />
                    )}
                  </p>

                  <p
                    style={{
                      marginTop: 5,
                      color: "#64748B",
                      fontSize: 10,
                      fontWeight: 950,
                      textTransform: "uppercase",
                      letterSpacing: "1.6px"
                    }}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className={visible ? "enter delay-3" : ""} style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                inset: -20,
                borderRadius: 46,
                background: "linear-gradient(135deg, rgba(14,165,233,0.24), rgba(125,211,252,0.34))",
                filter: "blur(34px)"
              }}
            />

            <div className="dashboard-card">
              <div style={{ position: "relative", zIndex: 1 }}>
                <div
                  style={{
                    borderRadius: 30,
                    padding: 28,
                    background:
                      "linear-gradient(135deg, #0284C7 0%, #0EA5E9 55%, #7DD3FC 100%)",
                    backgroundSize: "200% 200%",
                    animation: "skyShift 8s ease infinite",
                    color: "white"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                    <div>
                      <p
                        style={{
                          fontSize: 10,
                          fontWeight: 950,
                          letterSpacing: "3px",
                          textTransform: "uppercase",
                          color: "rgba(255,255,255,0.78)"
                        }}
                      >
                        Dashboard Preview
                      </p>
                      <h3 style={{ marginTop: 10, fontSize: 31, fontWeight: 950, color: "white" }}>
                        Placement Ready
                      </h3>
                    </div>

                    <div
                      style={{
                        background: "rgba(255,255,255,0.18)",
                        border: "1px solid rgba(255,255,255,0.25)",
                        borderRadius: 19,
                        padding: 13,
                        backdropFilter: "blur(16px)"
                      }}
                    >
                      <Trophy size={32} color="#FFFFFF" />
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: 24,
                      background: "rgba(255,255,255,0.18)",
                      border: "1px solid rgba(255,255,255,0.24)",
                      borderRadius: 22,
                      padding: 19,
                      backdropFilter: "blur(16px)"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13, fontWeight: 900, color: "white" }}>
                        Readiness
                      </span>
                      <span style={{ fontSize: 29, fontWeight: 950, color: "white" }}>
                        72%
                      </span>
                    </div>

                    <div
                      style={{
                        marginTop: 14,
                        height: 10,
                        borderRadius: 999,
                        background: "rgba(255,255,255,0.30)",
                        overflow: "hidden"
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          borderRadius: 999,
                          background: "#FFFFFF",
                          animation: "barFill 1.4s 0.7s ease both"
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                    marginTop: 14
                  }}
                >
                  {["DSA Tracker", "Resume Coach", "Interview AI", "Companies"].map((item, index) => (
                    <div key={item} className="mini-card">
                      <div
                        style={{
                          width: 11,
                          height: 11,
                          borderRadius: 999,
                          background: index % 2 === 0 ? "#0EA5E9" : "#38BDF8",
                          marginBottom: 9
                        }}
                      />
                      <p style={{ color: "#0F172A", fontSize: 13, fontWeight: 950 }}>
                        {item}
                      </p>
                      <p style={{ marginTop: 3, color: "#0284C7", fontSize: 11, fontWeight: 850 }}>
                        Active
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={{ marginTop: 96 }}>
          <div style={{ textAlign: "center", marginBottom: 46 }}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 950,
                letterSpacing: "3px",
                textTransform: "uppercase",
                color: "#0284C7",
                marginBottom: 12
              }}
            >
              Everything you need
            </p>

            <h3
              style={{
                fontSize: 42,
                fontWeight: 950,
                color: "#0F172A",
                letterSpacing: "-1px"
              }}
            >
              One platform, complete preparation
            </h3>

            <p
              style={{
                maxWidth: 650,
                margin: "14px auto 0",
                color: "#64748B",
                fontSize: 15,
                lineHeight: 1.7,
                fontWeight: 650
              }}
            >
              A clean preparation system for daily learning, practice, resume improvement,
              interview preparation and company-wise readiness.
            </p>
          </div>

          <div
            className="features-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 18
            }}
          >
            {features.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="feature-card">
                  <div style={{ position: "relative", zIndex: 1 }}>
                    <div
                      className="feature-icon"
                      style={{
                        width: 54,
                        height: 54,
                        borderRadius: 19,
                        background: "#E0F2FE",
                        border: "1px solid #BAE6FD",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 21
                      }}
                    >
                      <Icon size={24} color="#0284C7" />
                    </div>

                    <h3 style={{ fontSize: 17, color: "#0F172A", fontWeight: 950, marginBottom: 10 }}>
                      {item.title}
                    </h3>

                    <p style={{ fontSize: 13.5, color: "#64748B", lineHeight: 1.7, fontWeight: 650 }}>
                      {item.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section style={{ marginTop: 96 }}>
          <div
            className="prep-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 18
            }}
          >
            {preparationBlocks.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="feature-card">
                  <div style={{ position: "relative", zIndex: 1 }}>
                    <div
                      className="feature-icon"
                      style={{
                        width: 54,
                        height: 54,
                        borderRadius: 19,
                        background: "#F0F9FF",
                        border: "1px solid #BAE6FD",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 21
                      }}
                    >
                      <Icon size={24} color="#0EA5E9" />
                    </div>

                    <h3 style={{ fontSize: 17, color: "#0F172A", fontWeight: 950, marginBottom: 10 }}>
                      {item.title}
                    </h3>

                    <p style={{ fontSize: 13.5, color: "#64748B", lineHeight: 1.7, fontWeight: 650 }}>
                      {item.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section style={{ marginTop: 96 }}>
          <div
            style={{
              borderRadius: 34,
              padding: "44px 48px",
              marginBottom: 28,
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(240,249,255,0.96), rgba(224,242,254,0.88))",
              border: "1px solid rgba(186,230,253,0.95)",
              boxShadow: "0 24px 62px rgba(2,132,199,0.09)",
              position: "relative",
              overflow: "hidden"
            }}
          >
            <div
              style={{
                position: "absolute",
                right: -70,
                top: -70,
                width: 220,
                height: 220,
                borderRadius: 999,
                background: "rgba(14,165,233,0.12)"
              }}
            />
            <div
              style={{
                position: "absolute",
                right: 30,
                bottom: -90,
                width: 180,
                height: 180,
                borderRadius: 999,
                background: "rgba(125,211,252,0.20)"
              }}
            />

            <div style={{ position: "relative", zIndex: 1 }}>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 950,
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  color: "#0284C7",
                  marginBottom: 11
                }}
              >
                How it works
              </p>

              <h3
                style={{
                  fontSize: 38,
                  color: "#0F172A",
                  fontWeight: 950,
                  letterSpacing: "-0.9px"
                }}
              >
                One flow for complete preparation
              </h3>

              <p
                style={{
                  marginTop: 10,
                  color: "#64748B",
                  fontSize: 15,
                  fontWeight: 650,
                  lineHeight: 1.7
                }}
              >
                Follow these four steps and go from clueless to placement-ready.
              </p>
            </div>
          </div>

          <div
            className="steps-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 16
            }}
          >
            {steps.map((step, index) => (
              <div key={step} className="step-card">
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 16,
                    background: "linear-gradient(135deg, #0EA5E9, #7DD3FC)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: 16,
                    fontWeight: 950,
                    boxShadow: "0 14px 30px rgba(14,165,233,0.24)",
                    marginBottom: 18
                  }}
                >
                  {index + 1}
                </div>

                <p style={{ color: "#0F172A", fontSize: 14, fontWeight: 950, lineHeight: 1.45 }}>
                  {step}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginTop: 96 }}>
          <div
            style={{
              borderRadius: 38,
              background: "linear-gradient(135deg, #0284C7 0%, #0EA5E9 54%, #7DD3FC 100%)",
              backgroundSize: "200% 200%",
              animation: "skyShift 9s ease infinite",
              padding: "62px 48px",
              textAlign: "center",
              boxShadow: "0 32px 80px rgba(14,165,233,0.24)",
              position: "relative",
              overflow: "hidden"
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.22), transparent 26%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.16), transparent 30%)"
              }}
            />

            <div style={{ position: "relative", zIndex: 1 }}>
              <div
                style={{
                  margin: "0 auto 18px",
                  width: 60,
                  height: 60,
                  borderRadius: 22,
                  background: "rgba(255,255,255,0.18)",
                  border: "1px solid rgba(255,255,255,0.30)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backdropFilter: "blur(18px)"
                }}
              >
                <Target size={29} color="#FFFFFF" />
              </div>

              <h3
                style={{
                  fontSize: 43,
                  color: "white",
                  fontWeight: 950,
                  letterSpacing: "-0.9px"
                }}
              >
                Start your placement journey today
              </h3>

              <p
                style={{
                  margin: "14px auto 32px",
                  maxWidth: 640,
                  color: "rgba(255,255,255,0.84)",
                  fontSize: 15,
                  lineHeight: 1.75,
                  fontWeight: 650
                }}
              >
                Join thousands of students preparing smarter, not harder.
              </p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  gap: 14
                }}
              >
                <Link
                  to="/signup"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "15px 32px",
                    borderRadius: 18,
                    background: "#FFFFFF",
                    color: "#0284C7",
                    fontSize: 14,
                    fontWeight: 950,
                    textDecoration: "none",
                    boxShadow: "0 18px 40px rgba(2,132,199,0.22)"
                  }}
                >
                  Create Free Account
                  <ArrowRight size={15} />
                </Link>

                <Link
                  to="/dashboard"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "15px 32px",
                    borderRadius: 18,
                    background: "rgba(255,255,255,0.14)",
                    border: "1px solid rgba(255,255,255,0.34)",
                    color: "white",
                    fontSize: 14,
                    fontWeight: 950,
                    textDecoration: "none",
                    backdropFilter: "blur(18px)"
                  }}
                >
                  Open Demo Dashboard
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
