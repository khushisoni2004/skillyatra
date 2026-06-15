import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Brain,
  Building2,
  CalendarCheck,
  FileText,
  Sparkles,
  Trophy
} from "lucide-react";

/* ─────────────────────────────────────────────
   Tiny hook: animate a number from 0 → target
───────────────────────────────────────────── */
function useCountUp(target, duration = 1400, suffix = "") {
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (isNaN(parseInt(target))) {
      setDisplay(target);
      return;
    }

    const end = parseInt(target);
    const step = end / (duration / 16);
    let cur = 0;

    const t = setInterval(() => {
      cur = Math.min(cur + step, end);
      setDisplay(Math.floor(cur) + suffix);

      if (cur >= end) clearInterval(t);
    }, 16);

    return () => clearInterval(t);
  }, [target, duration, suffix]);

  return display;
}

/* ─────────────────────────────────────────────
   Particle canvas (ambient dots)
───────────────────────────────────────────── */
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

    const dots = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.4,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      o: Math.random() * 0.5 + 0.15
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
        ctx.fillStyle = `rgba(139,92,246,${d.o})`;
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

export default function Home() {
  const features = [
    {
      icon: CalendarCheck,
      title: "Daily Plan",
      text: "Plan today, track weekly progress, and stay consistent for placement preparation.",
      color: "#6C63FF",
      bg: "rgba(108,99,255,0.08)"
    },
    {
      icon: Brain,
      title: "DSA + MCQ Practice",
      text: "Solve topic-wise DSA, aptitude, CS fundamentals and interview practice questions.",
      color: "#00D4AA",
      bg: "rgba(0,212,170,0.08)"
    },
    {
      icon: Building2,
      title: "Company Preparation",
      text: "Use company and role data to prepare skills, patterns, gaps and practice sets.",
      color: "#818CF8",
      bg: "rgba(129,140,248,0.08)"
    },
    {
      icon: FileText,
      title: "Resume Coach",
      text: "Analyze resume, ATS score, missing skills, project strength and role readiness.",
      color: "#34D399",
      bg: "rgba(52,211,153,0.08)"
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
    const onScroll = () => setScrolled(window.scrollY > 20);

    window.addEventListener("scroll", onScroll);

    const t = setTimeout(() => setVisible(true), 80);

    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(t);
    };
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0A0A15",
        color: "#FFFFFF",
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
            transform: translateY(32px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-14px) rotate(0.5deg);
          }
        }

        @keyframes gradShift {
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
            opacity: 0.35;
          }
          50% {
            opacity: 0.65;
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

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .hero-enter {
          opacity: 0;
          animation: fadeUp 0.75s ease forwards;
        }

        .d1 {
          animation-delay: 0.05s;
        }

        .d2 {
          animation-delay: 0.18s;
        }

        .d3 {
          animation-delay: 0.30s;
        }

        .d4 {
          animation-delay: 0.45s;
        }

        .d5 {
          animation-delay: 0.58s;
        }

        .d6 {
          animation-delay: 0.70s;
        }

        .d7 {
          animation-delay: 0.85s;
        }

        .nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          transition: background 0.3s, box-shadow 0.3s, backdrop-filter 0.3s;
        }

        .nav.scrolled {
          background: rgba(10, 10, 21, 0.82);
          backdrop-filter: blur(20px);
          box-shadow: 0 1px 0 rgba(108, 99, 255, 0.15);
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 28px;
          border-radius: 14px;
          background: linear-gradient(135deg, #6C63FF, #8B5CF6);
          color: #fff;
          font-weight: 800;
          font-size: 14px;
          border: none;
          cursor: pointer;
          text-decoration: none;
          box-shadow: 0 8px 32px rgba(108, 99, 255, 0.35);
          transition: transform 0.2s, box-shadow 0.2s;
          position: relative;
          overflow: hidden;
        }

        .btn-primary::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          transform: translateX(-100%);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(108, 99, 255, 0.5);
        }

        .btn-primary:hover::after {
          animation: shimmer 0.6s ease;
        }

        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 28px;
          border-radius: 14px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.12);
          color: #E2E8F0;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.2s, border-color 0.2s, transform 0.2s;
        }

        .btn-secondary:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(108,99,255,0.4);
          transform: translateY(-1px);
        }

        .btn-outline {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 28px;
          border-radius: 14px;
          background: rgba(108,99,255,0.08);
          border: 1px solid rgba(108,99,255,0.3);
          color: #A5B4FC;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.2s, border-color 0.2s, transform 0.2s;
        }

        .btn-outline:hover {
          background: rgba(108,99,255,0.15);
          border-color: #6C63FF;
          transform: translateY(-1px);
        }

        .feature-card {
          background: #111127;
          border: 1px solid #1E1E3A;
          border-radius: 20px;
          padding: 28px;
          transition: transform 0.25s, box-shadow 0.25s, border-color 0.25s;
          position: relative;
          overflow: hidden;
        }

        .feature-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--card-accent), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.4);
        }

        .feature-card:hover::before {
          opacity: 1;
        }

        .stat-card {
          background: #111127;
          border: 1px solid #1E1E3A;
          border-radius: 16px;
          padding: 20px 24px;
          transition: transform 0.2s, border-color 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          border-color: #6C63FF40;
        }

        .dashboard-mock {
          animation: float 5s ease-in-out infinite;
        }

        .blob {
          position: fixed;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          animation: pulseGlow 6s ease-in-out infinite;
        }

        .step-card {
          background: #111127;
          border: 1px solid #1E1E3A;
          border-radius: 16px;
          padding: 24px;
          transition: transform 0.2s, box-shadow 0.2s;
          position: relative;
        }

        .step-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(108,99,255,0.12);
        }

        .arrow-anim {
          transition: transform 0.2s;
        }

        a:hover .arrow-anim {
          transform: translateX(4px);
        }

        @media (max-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
          }

          .steps-grid {
            grid-template-columns: 1fr 1fr !important;
          }

          .features-grid {
            grid-template-columns: 1fr 1fr !important;
          }

          .stats-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 480px) {
          .features-grid {
            grid-template-columns: 1fr !important;
          }

          .steps-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div
        className="blob"
        style={{
          width: 500,
          height: 500,
          left: -150,
          top: -100,
          background: "rgba(108,99,255,0.18)",
          animationDelay: "0s"
        }}
      />

      <div
        className="blob"
        style={{
          width: 400,
          height: 400,
          right: -100,
          top: 200,
          background: "rgba(0,212,170,0.12)",
          animationDelay: "2s"
        }}
      />

      <div
        className="blob"
        style={{
          width: 350,
          height: 350,
          left: "40%",
          bottom: -100,
          background: "rgba(139,92,246,0.14)",
          animationDelay: "4s"
        }}
      />

      <nav className={`nav${scrolled ? " scrolled" : ""}`}>
        <div
          style={{
            maxWidth: 1200,
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
                width: 44,
                height: 44,
                borderRadius: 14,
                background: "linear-gradient(135deg, #6C63FF, #00D4AA)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                fontWeight: 900,
                color: "#fff",
                boxShadow: "0 4px 16px rgba(108,99,255,0.4)"
              }}
            >
              S
            </div>

            <div>
              <div style={{ fontWeight: 900, fontSize: 16, color: "#fff" }}>
                SkillYatra
              </div>
              <div style={{ fontSize: 11, color: "#6C63FF", fontWeight: 700 }}>
                Placement GPS
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <Link
              to="/login"
              style={{
                padding: "9px 22px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#E2E8F0",
                fontWeight: 700,
                fontSize: 13,
                textDecoration: "none",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              }}
            >
              Login
            </Link>

            <Link
              to="/signup"
              style={{
                padding: "9px 22px",
                borderRadius: 12,
                background: "linear-gradient(135deg,#6C63FF,#8B5CF6)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 13,
                textDecoration: "none",
                boxShadow: "0 4px 16px rgba(108,99,255,0.35)",
                transition: "transform 0.2s"
              }}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px 80px" }}>
        <section
          className="hero-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            alignItems: "center",
            gap: 56,
            paddingTop: 120
          }}
        >
          <div>
            <div
              className={visible ? "hero-enter d1" : ""}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 16px",
                borderRadius: 999,
                background: "rgba(108,99,255,0.1)",
                border: "1px solid rgba(108,99,255,0.25)",
                fontSize: 12,
                fontWeight: 700,
                color: "#A5B4FC",
                marginBottom: 28
              }}
            >
              <Sparkles size={13} color="#6C63FF" />
              AI Powered Placement Preparation Platform
            </div>

            <h2
              className={visible ? "hero-enter d2" : ""}
              style={{
                fontSize: 66,
                fontWeight: 900,
                lineHeight: 1.04,
                letterSpacing: "-1.5px",
                color: "#FFFFFF"
              }}
            >
              Your complete
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #6C63FF, #8B5CF6, #00D4AA)",
                  backgroundSize: "200% 200%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  animation: "gradShift 5s ease infinite"
                }}
              >
                Placement GPS
              </span>
            </h2>

            <p
              className={visible ? "hero-enter d3" : ""}
              style={{
                marginTop: 20,
                fontSize: 16,
                lineHeight: 1.75,
                color: "#9898B8",
                maxWidth: 480,
                fontWeight: 500
              }}
            >
              SkillYatra helps students follow daily tasks, solve DSA, practice MCQs,
              prepare company-wise, improve resume, and train for interviews from one clean dashboard.
            </p>

            <div
              className={visible ? "hero-enter d4" : ""}
              style={{
                marginTop: 32,
                display: "flex",
                flexWrap: "wrap",
                gap: 12
              }}
            >
              <Link to="/login" className="btn-primary">
                Login to Continue
                <ArrowRight size={15} className="arrow-anim" />
              </Link>

              <Link to="/signup" className="btn-secondary">
                Create Account
              </Link>

              <Link to="/dashboard" className="btn-outline">
                Open Demo Dashboard
              </Link>
            </div>

            <div
              className={visible ? "hero-enter d5" : ""}
              style={{
                marginTop: 36,
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 12,
                maxWidth: 440
              }}
            >
              {stats.map(({ value, suffix, label }) => (
                <div key={label} className="stat-card">
                  <p style={{ fontSize: 28, fontWeight: 900, color: "#fff" }}>
                    {value === "AI" ? (
                      "AI"
                    ) : (
                      <CountUpValue value={value} suffix={suffix} active={visible} />
                    )}
                  </p>

                  <p
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                      color: "#6C63FF",
                      marginTop: 4
                    }}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className={visible ? "hero-enter d3" : ""} style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                inset: -20,
                borderRadius: 40,
                background: "linear-gradient(135deg, rgba(108,99,255,0.25), rgba(0,212,170,0.15))",
                filter: "blur(32px)"
              }}
            />

            <div
              className="dashboard-mock"
              style={{
                position: "relative",
                background: "#0F0F25",
                border: "1px solid #1E1E3A",
                borderRadius: 28,
                overflow: "hidden",
                boxShadow: "0 32px 80px rgba(0,0,0,0.6)"
              }}
            >
              <div
                style={{
                  background: "linear-gradient(135deg, #1a1060 0%, #3b1fa3 50%, #1fa37a 100%)",
                  padding: "24px 24px 28px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p
                      style={{
                        fontSize: 9,
                        fontWeight: 800,
                        letterSpacing: "3px",
                        textTransform: "uppercase",
                        color: "rgba(200,190,255,0.7)"
                      }}
                    >
                      Dashboard Preview
                    </p>
                    <h3 style={{ fontSize: 26, fontWeight: 900, marginTop: 8, color: "#fff" }}>
                      Placement Ready
                    </h3>
                  </div>

                  <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 14, padding: 12 }}>
                    <Trophy size={28} color="#FCD34D" />
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 20,
                    background: "rgba(255,255,255,0.12)",
                    borderRadius: 12,
                    padding: "14px 16px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#E0DCFF" }}>
                      Readiness
                    </span>
                    <span style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>
                      72%
                    </span>
                  </div>

                  <div style={{ height: 8, background: "rgba(255,255,255,0.2)", borderRadius: 4 }}>
                    <div
                      style={{
                        height: 8,
                        borderRadius: 4,
                        background: "linear-gradient(90deg, #A5B4FC, #34D399)",
                        animation: "barFill 1.4s 0.8s ease both"
                      }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: 16 }}>
                {["DSA Tracker", "Resume Coach", "Interview AI", "Companies"].map((item, i) => (
                  <div
                    key={item}
                    style={{
                      background: "#16162A",
                      border: "1px solid #1E1E3A",
                      borderRadius: 14,
                      padding: "14px 16px",
                      animation: `fadeUp 0.4s ${0.9 + i * 0.1}s ease both`
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "#00D4AA",
                        marginBottom: 8
                      }}
                    />
                    <p style={{ fontSize: 12, fontWeight: 800, color: "#E2E8F0" }}>
                      {item}
                    </p>
                    <p style={{ fontSize: 10, color: "#00D4AA", fontWeight: 600, marginTop: 2 }}>
                      Active
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section style={{ marginTop: 88 }}>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "3px",
                textTransform: "uppercase",
                color: "#6C63FF",
                marginBottom: 12
              }}
            >
              Everything you need
            </p>
            <h3
              style={{
                fontSize: 38,
                fontWeight: 900,
                color: "#fff",
                letterSpacing: "-0.5px"
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
              gap: 16
            }}
          >
            {features.map((item, i) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="feature-card hero-enter"
                  style={{
                    "--card-accent": item.color,
                    animationDelay: `${0.1 + i * 0.12}s`
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      background: item.bg,
                      border: `1px solid ${item.color}25`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 18,
                      transition: "transform 0.3s"
                    }}
                  >
                    <Icon size={22} color={item.color} />
                  </div>

                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: 800,
                      color: "#fff",
                      marginBottom: 8
                    }}
                  >
                    {item.title}
                  </h3>

                  <p
                    style={{
                      fontSize: 13,
                      color: "#9898B8",
                      lineHeight: 1.65,
                      fontWeight: 500
                    }}
                  >
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section style={{ marginTop: 88 }}>
          <div
            style={{
              background: "linear-gradient(135deg, #111127, #1a1060, #111127)",
              border: "1px solid #1E1E3A",
              borderRadius: 24,
              padding: "40px 44px",
              marginBottom: 28,
              position: "relative",
              overflow: "hidden"
            }}
          >
            <div
              style={{
                position: "absolute",
                right: -60,
                top: -60,
                width: 240,
                height: 240,
                borderRadius: "50%",
                border: "1px solid rgba(108,99,255,0.15)"
              }}
            />

            <div
              style={{
                position: "absolute",
                right: -30,
                top: -30,
                width: 140,
                height: 140,
                borderRadius: "50%",
                border: "1px solid rgba(108,99,255,0.1)"
              }}
            />

            <p
              style={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: "3px",
                textTransform: "uppercase",
                color: "#6C63FF",
                marginBottom: 10
              }}
            >
              How it works
            </p>

            <h3
              style={{
                fontSize: 34,
                fontWeight: 900,
                color: "#fff",
                letterSpacing: "-0.5px"
              }}
            >
              One flow for complete preparation
            </h3>

            <p
              style={{
                marginTop: 8,
                color: "#9898B8",
                fontSize: 14,
                fontWeight: 500
              }}
            >
              Follow these four steps and go from clueless to placement-ready.
            </p>
          </div>

          <div
            className="steps-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 14
            }}
          >
            {steps.map((step, index) => (
              <div key={step} className="step-card">
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    background: "linear-gradient(135deg, #6C63FF, #8B5CF6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 15,
                    fontWeight: 900,
                    color: "#fff",
                    boxShadow: "0 4px 16px rgba(108,99,255,0.35)",
                    marginBottom: 16
                  }}
                >
                  {index + 1}
                </div>

                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: "#E2E8F0",
                    lineHeight: 1.4
                  }}
                >
                  {step}
                </p>

                {index < steps.length - 1 && (
                  <div
                    style={{
                      position: "absolute",
                      right: -8,
                      top: "50%",
                      width: 16,
                      height: 2,
                      background: "linear-gradient(90deg, #6C63FF, transparent)",
                      display: "none"
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginTop: 88 }}>
          <div
            style={{
              borderRadius: 28,
              background: "linear-gradient(135deg, #1a1060 0%, #3b1fa3 60%, #0f7a5c 100%)",
              padding: "60px 48px",
              textAlign: "center",
              position: "relative",
              overflow: "hidden"
            }}
          >
            <ParticleCanvas />

            <div style={{ position: "relative", zIndex: 1 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 16,
                  padding: "6px 14px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.8)"
                }}
              >
                <Sparkles size={11} />
                Free to start
              </div>

              <h3
                style={{
                  fontSize: 40,
                  fontWeight: 900,
                  color: "#fff",
                  letterSpacing: "-0.5px",
                  marginBottom: 14
                }}
              >
                Start your placement journey today
              </h3>

              <p
                style={{
                  fontSize: 15,
                  color: "rgba(255,255,255,0.65)",
                  marginBottom: 32,
                  fontWeight: 500
                }}
              >
                Join thousands of students preparing smarter, not harder.
              </p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 14,
                  flexWrap: "wrap"
                }}
              >
                <Link
                  to="/signup"
                  style={{
                    padding: "14px 32px",
                    borderRadius: 14,
                    background: "#fff",
                    color: "#3b1fa3",
                    fontWeight: 800,
                    fontSize: 14,
                    textDecoration: "none",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                    transition: "transform 0.2s",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8
                  }}
                >
                  Create Free Account <ArrowRight size={14} />
                </Link>

                <Link
                  to="/dashboard"
                  style={{
                    padding: "14px 32px",
                    borderRadius: 14,
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.25)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 14,
                    textDecoration: "none",
                    transition: "background 0.2s",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8
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

/* Count-up sub-component */
function CountUpValue({ value, suffix, active }) {
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!active) return;

    const end = parseInt(value);
    const duration = 1400;
    const step = end / (duration / 16);
    let cur = 0;

    const t = setInterval(() => {
      cur = Math.min(cur + step, end);
      setDisplay(Math.floor(cur) + suffix);

      if (cur >= end) clearInterval(t);
    }, 16);

    return () => clearInterval(t);
  }, [active, value, suffix]);

  return <>{active ? display : "0" + suffix}</>;
}