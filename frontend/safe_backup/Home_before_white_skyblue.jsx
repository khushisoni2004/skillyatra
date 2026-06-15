import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
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

function ParticleCanvas() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let raf;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    const dots = Array.from({ length: 42 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.7 + 0.5,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      o: Math.random() * 0.35 + 0.12
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      dots.forEach((d) => {
        d.x += d.vx;
        d.y += d.vy;

        if (d.x < 0 || d.x > canvas.width) d.vx *= -1;
        if (d.y < 0 || d.y > canvas.height) d.vy *= -1;

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,102,241,${d.o})`;
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none"
      }}
    />
  );
}

function CountUpValue({ value, suffix, active }) {
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!active) return;

    const end = parseInt(value);
    const duration = 1300;
    const step = end / (duration / 16);
    let cur = 0;

    const timer = setInterval(() => {
      cur = Math.min(cur + step, end);
      setDisplay(Math.floor(cur) + suffix);
      if (cur >= end) clearInterval(timer);
    }, 16);

    return () => clearInterval(timer);
  }, [active, value, suffix]);

  return <>{active ? display : "0" + suffix}</>;
}

export default function Home() {
  const features = [
    {
      icon: CalendarCheck,
      title: "Daily Plan",
      text: "Plan today, track weekly progress, and stay consistent for placement preparation.",
      color: "#6366F1",
      bg: "rgba(99,102,241,0.10)"
    },
    {
      icon: Brain,
      title: "DSA + MCQ Practice",
      text: "Solve topic-wise DSA, aptitude, CS fundamentals and interview practice questions.",
      color: "#14B8A6",
      bg: "rgba(20,184,166,0.12)"
    },
    {
      icon: Building2,
      title: "Company Preparation",
      text: "Use company and role data to prepare skills, patterns, gaps and practice sets.",
      color: "#2563EB",
      bg: "rgba(37,99,235,0.10)"
    },
    {
      icon: FileText,
      title: "Resume Coach",
      text: "Analyze resume, ATS score, missing skills, project strength and role readiness.",
      color: "#F97316",
      bg: "rgba(249,115,22,0.12)"
    }
  ];

  const stats = [
    { value: "72", suffix: "%", label: "Ready Score" },
    { value: "100", suffix: "+", label: "Practice Sets" },
    { value: "AI", suffix: "", label: "Resume + Interview" }
  ];

  const steps = [
    "Set daily study tasks",
    "Practice DSA and MCQs",
    "Analyze resume gaps",
    "Prepare interviews"
  ];

  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    window.addEventListener("scroll", onScroll);

    const timer = setTimeout(() => setVisible(true), 90);

    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F6F8FF",
        color: "#0F172A",
        fontFamily: "'Inter', sans-serif",
        overflowX: "hidden"
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-14px);
          }
        }

        @keyframes gradientShift {
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

        @keyframes pulseGlow {
          0%, 100% {
            opacity: 0.45;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.08);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
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

        .home-enter {
          opacity: 0;
          animation: fadeUp 0.75s ease forwards;
        }

        .delay-1 { animation-delay: 0.08s; }
        .delay-2 { animation-delay: 0.20s; }
        .delay-3 { animation-delay: 0.34s; }
        .delay-4 { animation-delay: 0.48s; }
        .delay-5 { animation-delay: 0.62s; }

        .premium-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          transition: all 0.3s ease;
        }

        .premium-nav.scrolled {
          background: rgba(255,255,255,0.82);
          backdrop-filter: blur(18px);
          box-shadow: 0 1px 0 rgba(148,163,184,0.25), 0 18px 50px rgba(15,23,42,0.08);
        }

        .blob {
          position: fixed;
          border-radius: 999px;
          filter: blur(80px);
          pointer-events: none;
          animation: pulseGlow 6s ease-in-out infinite;
        }

        .primary-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 15px 28px;
          border-radius: 18px;
          background: linear-gradient(135deg, #4F46E5, #7C3AED);
          color: white;
          font-size: 14px;
          font-weight: 900;
          text-decoration: none;
          box-shadow: 0 18px 36px rgba(79,70,229,0.24);
          transition: all 0.25s ease;
          position: relative;
          overflow: hidden;
        }

        .primary-btn::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent);
          transform: translateX(-100%);
        }

        .primary-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 24px 46px rgba(79,70,229,0.32);
        }

        .primary-btn:hover::after {
          animation: shimmer 0.7s ease;
        }

        .secondary-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 15px 28px;
          border-radius: 18px;
          background: rgba(255,255,255,0.86);
          border: 1px solid rgba(203,213,225,0.9);
          color: #0F172A;
          font-size: 14px;
          font-weight: 900;
          text-decoration: none;
          box-shadow: 0 14px 32px rgba(15,23,42,0.07);
          transition: all 0.25s ease;
        }

        .secondary-btn:hover {
          transform: translateY(-3px);
          border-color: #6366F1;
          color: #4F46E5;
        }

        .outline-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 15px 28px;
          border-radius: 18px;
          background: rgba(238,242,255,0.9);
          border: 1px solid rgba(99,102,241,0.22);
          color: #4F46E5;
          font-size: 14px;
          font-weight: 900;
          text-decoration: none;
          transition: all 0.25s ease;
        }

        .outline-btn:hover {
          transform: translateY(-3px);
          background: #EEF2FF;
          border-color: #6366F1;
        }

        .dashboard-float {
          animation: float 5s ease-in-out infinite;
        }

        .premium-card {
          background: rgba(255,255,255,0.88);
          border: 1px solid rgba(226,232,240,0.95);
          border-radius: 28px;
          box-shadow: 0 20px 50px rgba(15,23,42,0.08);
          backdrop-filter: blur(18px);
          transition: all 0.25s ease;
          position: relative;
          overflow: hidden;
        }

        .premium-card::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at top right, var(--card-glow), transparent 45%);
          opacity: 0.95;
          pointer-events: none;
        }

        .premium-card:hover {
          transform: translateY(-7px);
          box-shadow: 0 28px 70px rgba(15,23,42,0.13);
          border-color: rgba(99,102,241,0.32);
        }

        .premium-card-content {
          position: relative;
          z-index: 1;
        }

        .icon-box {
          transition: all 0.3s ease;
        }

        .premium-card:hover .icon-box {
          transform: scale(1.12) rotate(-3deg);
        }

        .arrow-anim {
          transition: transform 0.2s ease;
        }

        a:hover .arrow-anim {
          transform: translateX(5px);
        }

        @media (max-width: 900px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
          }

          .features-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }

          .steps-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        @media (max-width: 640px) {
          .features-grid,
          .steps-grid,
          .stats-grid {
            grid-template-columns: 1fr !important;
          }

          .hero-title {
            font-size: 44px !important;
          }

          .home-main {
            padding-left: 18px !important;
            padding-right: 18px !important;
          }

          .nav-inner {
            padding-left: 18px !important;
            padding-right: 18px !important;
          }

          .nav-actions {
            gap: 8px !important;
          }

          .nav-actions a {
            padding: 9px 14px !important;
            font-size: 12px !important;
          }
        }
      `}</style>

      <div
        className="blob"
        style={{
          width: 520,
          height: 520,
          left: -180,
          top: -140,
          background: "rgba(99,102,241,0.20)",
          animationDelay: "0s"
        }}
      />

      <div
        className="blob"
        style={{
          width: 460,
          height: 460,
          right: -170,
          top: 160,
          background: "rgba(20,184,166,0.18)",
          animationDelay: "2s"
        }}
      />

      <div
        className="blob"
        style={{
          width: 420,
          height: 420,
          left: "42%",
          bottom: -180,
          background: "rgba(59,130,246,0.14)",
          animationDelay: "4s"
        }}
      />

      <nav className={`premium-nav${scrolled ? " scrolled" : ""}`}>
        <div
          className="nav-inner"
          style={{
            maxWidth: 1220,
            margin: "0 auto",
            padding: "18px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 16,
                background: "linear-gradient(135deg, #4F46E5, #14B8A6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 950,
                fontSize: 19,
                boxShadow: "0 16px 34px rgba(79,70,229,0.24)"
              }}
            >
              S
            </div>

            <div>
              <div style={{ fontSize: 17, fontWeight: 950, color: "#0F172A" }}>
                SkillYatra
              </div>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#6366F1" }}>
                Placement GPS
              </div>
            </div>
          </div>

          <div className="nav-actions" style={{ display: "flex", gap: 10 }}>
            <Link
              to="/login"
              style={{
                padding: "10px 22px",
                borderRadius: 14,
                background: "rgba(255,255,255,0.88)",
                border: "1px solid rgba(203,213,225,0.9)",
                color: "#0F172A",
                fontSize: 13,
                fontWeight: 900,
                textDecoration: "none",
                boxShadow: "0 12px 26px rgba(15,23,42,0.06)"
              }}
            >
              Login
            </Link>

            <Link
              to="/signup"
              style={{
                padding: "10px 22px",
                borderRadius: 14,
                background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
                color: "white",
                fontSize: 13,
                fontWeight: 900,
                textDecoration: "none",
                boxShadow: "0 16px 34px rgba(79,70,229,0.24)"
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
          maxWidth: 1220,
          margin: "0 auto",
          padding: "0 32px 80px"
        }}
      >
        <section
          className="hero-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1.08fr 0.92fr",
            alignItems: "center",
            gap: 58,
            paddingTop: 130
          }}
        >
          <div>
            <div
              className={visible ? "home-enter delay-1" : ""}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "9px 16px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.82)",
                border: "1px solid rgba(99,102,241,0.16)",
                color: "#4F46E5",
                fontSize: 12,
                fontWeight: 900,
                boxShadow: "0 16px 36px rgba(15,23,42,0.07)",
                backdropFilter: "blur(18px)"
              }}
            >
              <Sparkles size={14} />
              AI Powered Placement Preparation Platform
            </div>

            <h2
              className={`hero-title ${visible ? "home-enter delay-2" : ""}`}
              style={{
                marginTop: 28,
                fontSize: 68,
                lineHeight: 1.02,
                letterSpacing: "-2px",
                color: "#0F172A",
                fontWeight: 950
              }}
            >
              Your complete
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #4F46E5, #2563EB, #14B8A6)",
                  backgroundSize: "200% 200%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  animation: "gradientShift 6s ease infinite"
                }}
              >
                Placement GPS
              </span>
            </h2>

            <p
              className={visible ? "home-enter delay-3" : ""}
              style={{
                marginTop: 22,
                maxWidth: 540,
                color: "#64748B",
                fontSize: 17,
                lineHeight: 1.8,
                fontWeight: 650
              }}
            >
              SkillYatra helps students follow daily tasks, solve DSA, practice MCQs,
              prepare company-wise, improve resume, and train for interviews from one clean dashboard.
            </p>

            <div
              className={visible ? "home-enter delay-4" : ""}
              style={{
                marginTop: 34,
                display: "flex",
                flexWrap: "wrap",
                gap: 13
              }}
            >
              <Link to="/login" className="primary-btn">
                Login to Continue
                <ArrowRight size={16} className="arrow-anim" />
              </Link>

              <Link to="/signup" className="secondary-btn">
                Create Account
              </Link>

              <Link to="/dashboard" className="outline-btn">
                Open Demo Dashboard
              </Link>
            </div>

            <div
              className={`stats-grid ${visible ? "home-enter delay-5" : ""}`}
              style={{
                marginTop: 38,
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 14,
                maxWidth: 480
              }}
            >
              {stats.map(({ value, suffix, label }, index) => (
                <div
                  key={label}
                  style={{
                    background: "rgba(255,255,255,0.86)",
                    border: "1px solid rgba(226,232,240,0.95)",
                    borderRadius: 22,
                    padding: "22px 20px",
                    boxShadow: "0 18px 42px rgba(15,23,42,0.07)",
                    backdropFilter: "blur(18px)",
                    borderTop: `4px solid ${["#4F46E5", "#14B8A6", "#F97316"][index]}`
                  }}
                >
                  <p style={{ fontSize: 30, fontWeight: 950, color: "#0F172A" }}>
                    {value === "AI" ? (
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
                      fontWeight: 900,
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

          <div className={visible ? "home-enter delay-3" : ""} style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                inset: -20,
                borderRadius: 44,
                background: "linear-gradient(135deg, rgba(79,70,229,0.24), rgba(20,184,166,0.18))",
                filter: "blur(34px)"
              }}
            />

            <div
              className="dashboard-float"
              style={{
                position: "relative",
                background: "rgba(255,255,255,0.78)",
                border: "1px solid rgba(226,232,240,0.95)",
                borderRadius: 36,
                padding: 18,
                boxShadow: "0 30px 80px rgba(15,23,42,0.15)",
                backdropFilter: "blur(22px)",
                overflow: "hidden"
              }}
            >
              <div
                style={{
                  borderRadius: 28,
                  padding: 26,
                  background:
                    "linear-gradient(135deg, #4F46E5 0%, #2563EB 55%, #14B8A6 100%)",
                  backgroundSize: "200% 200%",
                  animation: "gradientShift 9s ease infinite",
                  color: "white"
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                  <div>
                    <p
                      style={{
                        fontSize: 10,
                        fontWeight: 900,
                        letterSpacing: "3px",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.72)"
                      }}
                    >
                      Dashboard Preview
                    </p>
                    <h3 style={{ marginTop: 10, fontSize: 30, fontWeight: 950, color: "white" }}>
                      Placement Ready
                    </h3>
                  </div>

                  <div
                    style={{
                      background: "rgba(255,255,255,0.18)",
                      border: "1px solid rgba(255,255,255,0.25)",
                      borderRadius: 18,
                      padding: 13,
                      backdropFilter: "blur(16px)"
                    }}
                  >
                    <Trophy size={32} color="#FDE68A" />
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 24,
                    background: "rgba(255,255,255,0.16)",
                    border: "1px solid rgba(255,255,255,0.20)",
                    borderRadius: 20,
                    padding: 18,
                    backdropFilter: "blur(16px)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, fontWeight: 850, color: "white" }}>
                      Readiness
                    </span>
                    <span style={{ fontSize: 28, fontWeight: 950, color: "white" }}>
                      72%
                    </span>
                  </div>

                  <div
                    style={{
                      marginTop: 14,
                      height: 10,
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.24)",
                      overflow: "hidden"
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        borderRadius: 999,
                        background: "linear-gradient(90deg, #FFFFFF, #A7F3D0)",
                        animation: "barFill 1.5s 0.7s ease both"
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
                  <div
                    key={item}
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid #E2E8F0",
                      borderRadius: 20,
                      padding: "16px 17px",
                      boxShadow: "0 12px 28px rgba(15,23,42,0.06)",
                      animation: `fadeUp 0.45s ${0.7 + index * 0.12}s ease both`
                    }}
                  >
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 999,
                        background: index % 2 === 0 ? "#14B8A6" : "#6366F1",
                        marginBottom: 9
                      }}
                    />
                    <p style={{ color: "#0F172A", fontSize: 13, fontWeight: 900 }}>
                      {item}
                    </p>
                    <p style={{ marginTop: 3, color: "#14B8A6", fontSize: 11, fontWeight: 800 }}>
                      Active
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section style={{ marginTop: 92 }}>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 950,
                letterSpacing: "3px",
                textTransform: "uppercase",
                color: "#4F46E5",
                marginBottom: 12
              }}
            >
              Everything you need
            </p>

            <h3
              style={{
                fontSize: 40,
                fontWeight: 950,
                color: "#0F172A",
                letterSpacing: "-0.9px"
              }}
            >
              One platform, complete preparation
            </h3>
          </div>

          <div
            className="features-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 18
            }}
          >
            {features.map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className={`premium-card home-enter delay-${Math.min(index + 1, 5)}`}
                  style={{
                    "--card-glow": item.bg,
                    padding: 28
                  }}
                >
                  <div className="premium-card-content">
                    <div
                      className="icon-box"
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 18,
                        background: item.bg,
                        border: `1px solid ${item.color}24`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 20
                      }}
                    >
                      <Icon size={23} color={item.color} />
                    </div>

                    <h3
                      style={{
                        fontSize: 16,
                        color: "#0F172A",
                        fontWeight: 950,
                        marginBottom: 9
                      }}
                    >
                      {item.title}
                    </h3>

                    <p
                      style={{
                        fontSize: 13.5,
                        color: "#64748B",
                        lineHeight: 1.65,
                        fontWeight: 650
                      }}
                    >
                      {item.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section style={{ marginTop: 92 }}>
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              borderRadius: 32,
              padding: "42px 46px",
              marginBottom: 28,
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.94), rgba(238,242,255,0.92), rgba(224,242,254,0.84))",
              border: "1px solid rgba(226,232,240,0.95)",
              boxShadow: "0 22px 56px rgba(15,23,42,0.08)"
            }}
          >
            <ParticleCanvas />

            <div style={{ position: "relative", zIndex: 1 }}>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 950,
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  color: "#4F46E5",
                  marginBottom: 11
                }}
              >
                How it works
              </p>

              <h3
                style={{
                  fontSize: 36,
                  color: "#0F172A",
                  fontWeight: 950,
                  letterSpacing: "-0.8px"
                }}
              >
                One flow for complete preparation
              </h3>

              <p
                style={{
                  marginTop: 10,
                  color: "#64748B",
                  fontSize: 15,
                  fontWeight: 650
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
              <div
                key={step}
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: 24,
                  padding: 24,
                  boxShadow: "0 18px 42px rgba(15,23,42,0.07)",
                  transition: "all 0.25s ease"
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 15,
                    background: "linear-gradient(135deg, #4F46E5, #14B8A6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: 15,
                    fontWeight: 950,
                    boxShadow: "0 14px 28px rgba(79,70,229,0.22)",
                    marginBottom: 17
                  }}
                >
                  {index + 1}
                </div>

                <p
                  style={{
                    color: "#0F172A",
                    fontSize: 14,
                    fontWeight: 950,
                    lineHeight: 1.45
                  }}
                >
                  {step}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginTop: 92 }}>
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              borderRadius: 36,
              background:
                "linear-gradient(135deg, #4F46E5 0%, #2563EB 52%, #14B8A6 100%)",
              backgroundSize: "200% 200%",
              animation: "gradientShift 9s ease infinite",
              padding: "62px 48px",
              textAlign: "center",
              boxShadow: "0 30px 80px rgba(79,70,229,0.22)"
            }}
          >
            <ParticleCanvas />

            <div style={{ position: "relative", zIndex: 1 }}>
              <div
                style={{
                  margin: "0 auto 18px",
                  width: 58,
                  height: 58,
                  borderRadius: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(255,255,255,0.18)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  backdropFilter: "blur(18px)"
                }}
              >
                <Target size={28} color="#FFFFFF" />
              </div>

              <h3
                style={{
                  fontSize: 42,
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
                  maxWidth: 620,
                  color: "rgba(255,255,255,0.78)",
                  fontSize: 15,
                  lineHeight: 1.7,
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
                    background: "white",
                    color: "#4F46E5",
                    fontSize: 14,
                    fontWeight: 950,
                    textDecoration: "none",
                    boxShadow: "0 18px 40px rgba(15,23,42,0.20)"
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
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.28)",
                    color: "white",
                    fontSize: 14,
                    fontWeight: 900,
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
