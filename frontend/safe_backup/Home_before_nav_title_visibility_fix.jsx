import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Brain,
  BriefcaseBusiness,
  Building2,
  CalendarCheck,
  Code2,
  FileText,
  GraduationCap,
  HelpCircle,
  Mic2,
  Sparkles
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
    const handleScroll = () => setScrolled(window.scrollY > 18);
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
      text: "Plan study tasks, maintain consistency and complete your preparation step by step."
    },
    {
      icon: Brain,
      title: "DSA + MCQ Practice",
      text: "Practice coding, aptitude, CS fundamentals and interview-based MCQs."
    },
    {
      icon: Building2,
      title: "Company Preparation",
      text: "Prepare according to company roles, hiring patterns and required skills."
    },
    {
      icon: FileText,
      title: "Resume Coach",
      text: "Improve resume quality, ATS score, project explanation and missing skills."
    }
  ];

  const stats = [
    { value: "72", suffix: "%", label: "Ready Score" },
    { value: "100", suffix: "+", label: "Practice Sets" },
    { value: "24", suffix: "/7", label: "Study Flow" }
  ];

  const flowCards = [
    {
      step: "01",
      title: "Practice Questions",
      text: "Solve aptitude, MCQ and core subject questions with a focused daily routine.",
      icon: HelpCircle
    },
    {
      step: "02",
      title: "Company Roadmap",
      text: "Prepare according to company roles, hiring pattern and skill demand.",
      icon: BriefcaseBusiness
    },
    {
      step: "03",
      title: "DSA Practice",
      text: "Track DSA topics, improve logic and prepare for coding rounds.",
      icon: Code2
    },
    {
      step: "04",
      title: "Resume Analyze",
      text: "Check resume quality, missing skills and project strength.",
      icon: FileText
    },
    {
      step: "05",
      title: "Live Interview",
      text: "Practice interview answers, confidence and final readiness.",
      icon: Mic2
    }
  ];

  return (
    <div className="sy-home">
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap");

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
        }

        .sy-home {
          min-height: 100vh;
          overflow-x: hidden;
          color: #0F172A;
          font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          background:
            radial-gradient(circle at 10% 6%, rgba(14, 165, 233, 0.22), transparent 30%),
            radial-gradient(circle at 88% 10%, rgba(125, 211, 252, 0.36), transparent 32%),
            linear-gradient(180deg, #F8FCFF 0%, #EEF8FF 48%, #FFFFFF 100%);
          position: relative;
        }

        .sy-home::before {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          background-image:
            linear-gradient(rgba(14, 165, 233, 0.055) 1px, transparent 1px),
            linear-gradient(90deg, rgba(14, 165, 233, 0.055) 1px, transparent 1px);
          background-size: 44px 44px;
          mask-image: linear-gradient(to bottom, black, transparent 78%);
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

        .enter {
          opacity: 0;
          animation: fadeUp 0.75s ease forwards;
        }

        .d1 { animation-delay: 0.08s; }
        .d2 { animation-delay: 0.18s; }
        .d3 { animation-delay: 0.30s; }
        .d4 { animation-delay: 0.44s; }
        .d5 { animation-delay: 0.58s; }

        .home-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          transition: all 0.28s ease;
        }

        .home-nav.scrolled {
          background: rgba(255,255,255,0.88);
          backdrop-filter: blur(18px);
          box-shadow:
            0 1px 0 rgba(14,165,233,0.14),
            0 18px 48px rgba(2,132,199,0.10);
        }

        .nav-inner {
          max-width: 1240px;
          margin: 0 auto;
          padding: 18px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .brand-mark {
          width: 66px;
          height: 66px;
          border-radius: 24px;
          background: linear-gradient(135deg, #0EA5E9, #7DD3FC);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFFFFF;
          box-shadow: 0 18px 38px rgba(14,165,233,0.30);
        }

        .brand-title {
          font-size: 25px;
          font-weight: 950;
          color: #0F172A;
          letter-spacing: -0.8px;
          line-height: 1;
        }

        .brand-subtitle {
          margin-top: 6px;
          font-size: 13px;
          font-weight: 900;
          color: #0284C7;
          letter-spacing: 0.5px;
        }

        .nav-actions {
          display: flex;
          gap: 12px;
        }

        .nav-btn {
          text-decoration: none;
          font-size: 15px;
          font-weight: 950;
          border-radius: 17px;
          padding: 13px 30px;
          white-space: nowrap;
          transition: all 0.22s ease;
        }

        .nav-btn:hover {
          transform: translateY(-2px);
        }

        .nav-login {
          background: rgba(255,255,255,0.96);
          border: 1px solid rgba(14,165,233,0.25);
          color: #075985;
          box-shadow: 0 14px 30px rgba(2,132,199,0.10);
        }

        .nav-signup {
          background: linear-gradient(135deg, #0EA5E9, #38BDF8);
          color: #FFFFFF;
          box-shadow: 0 18px 38px rgba(14,165,233,0.30);
        }

        .home-main {
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 32px 86px;
          position: relative;
          z-index: 2;
        }

        .hero-grid {
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          align-items: center;
          gap: 58px;
          padding-top: 142px;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 17px;
          border-radius: 999px;
          background: rgba(255,255,255,0.92);
          border: 1px solid rgba(186,230,253,0.95);
          color: #0284C7;
          font-size: 12px;
          font-weight: 950;
          box-shadow: 0 16px 36px rgba(2,132,199,0.08);
          backdrop-filter: blur(18px);
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

        .hero-desc {
          margin-top: 22px;
          max-width: 580px;
          color: #475569;
          font-size: 18px;
          line-height: 1.8;
          font-weight: 720;
        }

        .hero-actions {
          margin-top: 34px;
          display: flex;
          flex-wrap: wrap;
          gap: 13px;
        }

        .btn-primary,
        .btn-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          padding: 15px 30px;
          border-radius: 20px;
          text-decoration: none;
          font-size: 15px;
          font-weight: 950;
          transition: all 0.25s ease;
        }

        .btn-primary {
          background: linear-gradient(135deg, #0EA5E9, #38BDF8);
          color: #FFFFFF;
          box-shadow: 0 18px 38px rgba(14,165,233,0.28);
        }

        .btn-secondary {
          background: rgba(255,255,255,0.92);
          color: #075985;
          border: 1px solid rgba(14,165,233,0.22);
          box-shadow: 0 16px 34px rgba(2,132,199,0.08);
        }

        .btn-primary:hover,
        .btn-secondary:hover {
          transform: translateY(-3px);
        }

        .stats-grid {
          margin-top: 38px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          max-width: 510px;
        }

        .mini-card {
          background: #FFFFFF;
          border: 1px solid #E0F2FE;
          border-radius: 24px;
          padding: 20px;
          box-shadow: 0 16px 36px rgba(2,132,199,0.08);
          transition: all 0.25s ease;
        }

        .mini-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 26px 54px rgba(2,132,199,0.14);
        }

        .image-card {
          position: relative;
          background: rgba(255,255,255,0.92);
          border: 1px solid rgba(186,230,253,0.95);
          border-radius: 42px;
          padding: 18px;
          box-shadow: 0 34px 90px rgba(2,132,199,0.18);
          backdrop-filter: blur(24px);
          overflow: hidden;
        }

        .image-card img {
          width: 100%;
          display: block;
          border-radius: 32px;
          object-fit: cover;
          box-shadow: 0 22px 54px rgba(2,132,199,0.16);
        }

        .image-caption {
          position: absolute;
          left: 34px;
          bottom: 34px;
          right: 34px;
          background: rgba(255,255,255,0.90);
          border: 1px solid rgba(186,230,253,0.95);
          border-radius: 24px;
          padding: 18px 20px;
          backdrop-filter: blur(18px);
          box-shadow: 0 18px 42px rgba(2,132,199,0.14);
        }

        .feature-section,
        .flow-section,
        .last-cta {
          margin-top: 96px;
        }

        .section-heading {
          text-align: center;
          margin-bottom: 46px;
        }

        .section-label {
          font-size: 12px;
          font-weight: 950;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #0284C7;
          margin-bottom: 12px;
        }

        .section-title {
          font-size: 42px;
          font-weight: 950;
          color: #0F172A;
          letter-spacing: -1px;
        }

        .section-desc {
          max-width: 720px;
          margin: 14px auto 0;
          color: #475569;
          font-size: 16px;
          line-height: 1.75;
          font-weight: 720;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
        }

        .feature-card,
        .flow-card {
          background: rgba(255,255,255,0.94);
          border: 1px solid rgba(186,230,253,0.85);
          border-radius: 30px;
          padding: 28px;
          box-shadow: 0 20px 50px rgba(2,132,199,0.08);
          backdrop-filter: blur(18px);
          transition: all 0.25s ease;
          position: relative;
          overflow: hidden;
        }

        .feature-card:hover,
        .flow-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 30px 70px rgba(2,132,199,0.14);
          border-color: rgba(14,165,233,0.34);
        }

        .feature-icon,
        .flow-icon {
          width: 56px;
          height: 56px;
          border-radius: 20px;
          background: #E0F2FE;
          border: 1px solid #BAE6FD;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 21px;
          color: #0284C7;
        }

        .flow-box {
          border-radius: 36px;
          background: linear-gradient(135deg, rgba(255,255,255,0.98), rgba(240,249,255,0.98), rgba(224,242,254,0.94));
          border: 1px solid rgba(186,230,253,0.95);
          box-shadow: 0 26px 70px rgba(2,132,199,0.11);
          padding: 46px 48px;
          position: relative;
          overflow: hidden;
        }

        .flow-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
          align-items: stretch;
        }

        .flow-card {
          min-height: 225px;
          padding: 22px;
        }

        .flow-line {
          position: absolute;
          top: 53px;
          right: -16px;
          width: 16px;
          height: 3px;
          background: linear-gradient(90deg, #0EA5E9, #7DD3FC);
          z-index: 2;
        }

        .last-cta-box {
          border-radius: 38px;
          background: linear-gradient(135deg, #0284C7 0%, #0EA5E9 54%, #7DD3FC 100%);
          background-size: 200% 200%;
          animation: skyShift 9s ease infinite;
          padding: 62px 48px;
          text-align: center;
          box-shadow: 0 32px 80px rgba(14,165,233,0.24);
          position: relative;
          overflow: hidden;
        }

        @media (max-width: 1100px) {
          .flow-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .flow-line {
            display: none;
          }
        }

        @media (max-width: 980px) {
          .hero-grid {
            grid-template-columns: 1fr;
          }

          .features-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .hero-title {
            font-size: 54px;
          }
        }

        @media (max-width: 640px) {
          .home-main,
          .nav-inner {
            padding-left: 18px;
            padding-right: 18px;
          }

          .hero-grid {
            padding-top: 120px;
          }

          .hero-title {
            font-size: 42px;
            letter-spacing: -1.3px;
          }

          .features-grid,
          .flow-grid,
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .nav-btn {
            padding: 10px 15px;
            font-size: 13px;
          }

          .brand-mark {
            width: 54px;
            height: 54px;
            border-radius: 20px;
          }

          .brand-title {
            font-size: 21px;
          }

          .image-caption {
            position: static;
            margin-top: 14px;
          }

          .flow-box {
            padding: 30px 22px;
          }

          .last-cta-box {
            padding: 42px 24px;
          }
        }
      `}</style>

      <nav className={`home-nav${scrolled ? " scrolled" : ""}`}>
        <div className="nav-inner">
          <div className="brand">
            <div className="brand-mark">
              <GraduationCap size={36} strokeWidth={2.6} />
            </div>

            <div>
              <div className="brand-title">SkillYatra</div>
              <div className="brand-subtitle">Placement GPS</div>
            </div>
          </div>

          <div className="nav-actions">
            <Link to="/login" className="nav-btn nav-login">
              Login
            </Link>

            <Link to="/signup" className="nav-btn nav-signup">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      <main className="home-main">
        <section className="hero-grid">
          <div>
            <div className={visible ? "badge enter d1" : "badge"}>
              <Sparkles size={14} />
              AI Powered Placement Preparation Platform
            </div>

            <h2 className={`hero-title ${visible ? "enter d2" : ""}`}>
              SkillYatra
              <br />
              <span className="gradient-text">Placement GPS</span>
            </h2>

            <p className={`hero-desc ${visible ? "enter d3" : ""}`}>
              SkillYatra helps students follow daily tasks, solve DSA, practice MCQs,
              prepare company-wise, improve resume, and train for interviews from one clean dashboard.
            </p>

            <div className={`hero-actions ${visible ? "enter d4" : ""}`}>
              <Link to="/login" className="btn-primary">
                Login to Continue
                <ArrowRight size={16} />
              </Link>

              <Link to="/signup" className="btn-secondary">
                Create Account
              </Link>
            </div>

            <div className={`stats-grid ${visible ? "enter d5" : ""}`}>
              {stats.map(({ value, suffix, label }) => (
                <div key={label} className="mini-card" style={{ borderTop: "4px solid #0EA5E9" }}>
                  <p style={{ fontSize: 31, fontWeight: 950, color: "#0F172A" }}>
                    <CountUpValue value={value} suffix={suffix} active={visible} />
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

          <div className={visible ? "enter d3" : ""} style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                inset: -22,
                borderRadius: 46,
                background: "linear-gradient(135deg, rgba(14,165,233,0.22), rgba(125,211,252,0.36))",
                filter: "blur(38px)"
              }}
            />

            <div className="image-card">
              <img
                src="/student-3d.png"
                alt="3D student preparing for placement on laptop"
              />

              <div className="image-caption">
                <p
                  style={{
                    color: "#0284C7",
                    fontSize: 12,
                    fontWeight: 950,
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    marginBottom: 6
                  }}
                >
                  Smart Placement Preparation
                </p>

                <h3
                  style={{
                    color: "#0F172A",
                    fontSize: 24,
                    fontWeight: 950,
                    letterSpacing: "-0.5px",
                    lineHeight: 1.15,
                    margin: 0
                  }}
                >
                  Learn, practice, analyze and get interview-ready in one place
                </h3>
              </div>
            </div>
          </div>
        </section>

        <section className="feature-section">
          <div className="section-heading">
            <p className="section-label">Everything you need</p>
            <h3 className="section-title">One platform, complete preparation</h3>
            <p className="section-desc">
              A clean preparation system for daily learning, practice, resume improvement,
              interview preparation and company-wise readiness.
            </p>
          </div>

          <div className="features-grid">
            {features.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="feature-card">
                  <div className="feature-icon">
                    <Icon size={25} strokeWidth={2.5} />
                  </div>

                  <h3 style={{ fontSize: 18, color: "#0F172A", fontWeight: 950, marginBottom: 10 }}>
                    {item.title}
                  </h3>

                  <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.72, fontWeight: 720 }}>
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="flow-section">
          <div className="flow-box">
            <p className="section-label">Preparation Flow</p>
            <h3 className="section-title">Everything connected in one placement journey</h3>
            <p className="section-desc" style={{ marginLeft: 0, marginRight: 0, marginBottom: 34 }}>
              Start with practice questions, follow company preparation, improve DSA,
              analyze your resume, and get interview-ready through one clean SkillYatra flow.
            </p>

            <div className="flow-grid">
              {flowCards.map((item, index) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="flow-card">
                    {index < 4 && <div className="flow-line" />}

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 18
                      }}
                    >
                      <div className="flow-icon">
                        <Icon size={25} strokeWidth={2.5} />
                      </div>

                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 950,
                          color: "#0284C7",
                          background: "#E0F2FE",
                          border: "1px solid #BAE6FD",
                          borderRadius: 999,
                          padding: "6px 10px"
                        }}
                      >
                        {item.step}
                      </span>
                    </div>

                    <h4
                      style={{
                        color: "#0F172A",
                        fontSize: 17,
                        fontWeight: 950,
                        letterSpacing: "-0.3px",
                        marginBottom: 9,
                        lineHeight: 1.2
                      }}
                    >
                      {item.title}
                    </h4>

                    <p style={{ color: "#475569", fontSize: 13.5, lineHeight: 1.65, fontWeight: 720 }}>
                      {item.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="last-cta">
          <div className="last-cta-box">
            <h3 style={{ fontSize: 42, color: "white", fontWeight: 950, letterSpacing: "-0.9px" }}>
              Start your placement journey today
            </h3>

            <p
              style={{
                margin: "14px auto 32px",
                maxWidth: 640,
                color: "rgba(255,255,255,0.88)",
                fontSize: 16,
                lineHeight: 1.75,
                fontWeight: 720
              }}
            >
              Prepare smarter with a focused dashboard made for placement readiness.
            </p>

            <Link
              to="/login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "15px 32px",
                borderRadius: 18,
                background: "#FFFFFF",
                color: "#0284C7",
                fontSize: 15,
                fontWeight: 950,
                textDecoration: "none",
                boxShadow: "0 18px 40px rgba(2,132,199,0.22)"
              }}
            >
              Login to Continue
              <ArrowRight size={15} />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
