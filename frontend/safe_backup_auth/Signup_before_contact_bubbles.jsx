import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Lock,
  Mail,
  Sparkles,
  User
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("Devendra");
  const [email, setEmail] = useState("dev@gmail.com");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);

  const saveAndEnter = (user = {}) => {
    localStorage.setItem(
      "skillyatra_user",
      JSON.stringify({
        name: user.name || name || "Devendra",
        email: user.email || email || "dev@gmail.com"
      })
    );

    navigate("/dashboard", { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        if (data.token) localStorage.setItem("skillyatra_token", data.token);
        saveAndEnter(data.user);
        return;
      }

      saveAndEnter({ name, email });
    } catch {
      saveAndEnter({ name, email });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sy-auth-page">
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap");

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
        }

        .sy-auth-page {
          min-height: 100vh;
          padding: 36px 24px;
          font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          color: #0F172A;
          background:
            radial-gradient(circle at 12% 8%, rgba(14,165,233,0.22), transparent 30%),
            radial-gradient(circle at 88% 10%, rgba(125,211,252,0.34), transparent 32%),
            linear-gradient(180deg, #F8FCFF 0%, #EEF8FF 52%, #FFFFFF 100%);
          overflow-x: hidden;
          position: relative;
        }

        .sy-auth-page::before {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          background-image:
            linear-gradient(rgba(14,165,233,0.055) 1px, transparent 1px),
            linear-gradient(90deg, rgba(14,165,233,0.055) 1px, transparent 1px);
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

        @keyframes float3d {
          0%, 100% {
            transform: perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px);
          }
          50% {
            transform: perspective(1000px) rotateX(2deg) rotateY(-2deg) translateY(-12px);
          }
        }

        @keyframes glowMove {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 0.85;
            transform: scale(1.08);
          }
        }

        .auth-shell {
          position: relative;
          z-index: 2;
          min-height: calc(100vh - 72px);
          max-width: 1180px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 0.95fr 1.05fr;
          align-items: center;
          gap: 34px;
        }

        .brand-bar {
          position: absolute;
          top: 24px;
          left: 32px;
          display: flex;
          align-items: center;
          gap: 14px;
          text-decoration: none;
          z-index: 5;
        }

        .brand-mark {
          width: 58px;
          height: 58px;
          border-radius: 22px;
          background: linear-gradient(135deg, #0EA5E9, #7DD3FC);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 18px 38px rgba(14,165,233,0.28);
        }

        .brand-title {
          font-size: 25px;
          font-weight: 950;
          letter-spacing: -0.8px;
          color: #0F172A;
          line-height: 1;
        }

        .brand-subtitle {
          margin-top: 6px;
          font-size: 13px;
          font-weight: 900;
          color: #0284C7;
        }

        .visual-card {
          position: relative;
          min-height: 620px;
          border-radius: 42px;
          padding: 48px;
          background: rgba(255,255,255,0.78);
          border: 1px solid rgba(186,230,253,0.95);
          box-shadow: 0 34px 90px rgba(2,132,199,0.16);
          backdrop-filter: blur(24px);
          overflow: hidden;
          animation: fadeUp 0.8s ease both;
        }

        .visual-card::before {
          content: "";
          position: absolute;
          width: 360px;
          height: 360px;
          border-radius: 999px;
          right: -120px;
          top: -120px;
          background: rgba(14,165,233,0.16);
          animation: glowMove 6s ease-in-out infinite;
        }

        .visual-card::after {
          content: "";
          position: absolute;
          width: 280px;
          height: 280px;
          border-radius: 999px;
          left: -120px;
          bottom: -120px;
          background: rgba(125,211,252,0.28);
          animation: glowMove 7s ease-in-out infinite reverse;
        }

        .visual-inner {
          position: relative;
          z-index: 1;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 999px;
          background: #E0F2FE;
          border: 1px solid #BAE6FD;
          color: #0284C7;
          font-size: 12px;
          font-weight: 950;
          letter-spacing: 0.3px;
        }

        .visual-title {
          margin-top: 28px;
          font-size: 58px;
          line-height: 1.02;
          letter-spacing: -2.3px;
          font-weight: 950;
          color: #0F172A;
        }

        .gradient-text {
          background: linear-gradient(135deg, #0284C7, #0EA5E9, #38BDF8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .visual-desc {
          margin-top: 20px;
          max-width: 540px;
          color: #475569;
          font-size: 17px;
          line-height: 1.75;
          font-weight: 720;
        }

        .floating-board {
          margin-top: 42px;
          border-radius: 34px;
          background: linear-gradient(135deg, #0284C7, #0EA5E9, #7DD3FC);
          padding: 24px;
          color: white;
          box-shadow: 0 30px 72px rgba(14,165,233,0.24);
          animation: float3d 6s ease-in-out infinite;
        }

        .board-grid {
          margin-top: 22px;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }

        .board-item {
          border-radius: 22px;
          padding: 18px;
          background: rgba(255,255,255,0.18);
          border: 1px solid rgba(255,255,255,0.28);
          backdrop-filter: blur(18px);
        }

        .form-card {
          position: relative;
          border-radius: 38px;
          background: rgba(255,255,255,0.94);
          border: 1px solid rgba(186,230,253,0.95);
          box-shadow: 0 34px 90px rgba(2,132,199,0.14);
          padding: 42px;
          backdrop-filter: blur(24px);
          animation: fadeUp 0.85s 0.1s ease both;
        }

        .form-logo {
          margin: 0 auto;
          width: 76px;
          height: 76px;
          border-radius: 28px;
          background: linear-gradient(135deg, #0EA5E9, #7DD3FC);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 22px 46px rgba(14,165,233,0.28);
        }

        .form-title {
          margin-top: 24px;
          text-align: center;
          font-size: 34px;
          line-height: 1.1;
          font-weight: 950;
          letter-spacing: -1px;
          color: #0F172A;
        }

        .form-subtitle {
          margin-top: 10px;
          text-align: center;
          color: #475569;
          font-size: 14px;
          font-weight: 720;
          line-height: 1.6;
        }

        .form-area {
          margin-top: 32px;
          display: grid;
          gap: 18px;
        }

        .field-label {
          display: block;
          margin-bottom: 9px;
          color: #0F172A;
          font-size: 14px;
          font-weight: 950;
        }

        .input-box {
          height: 54px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-radius: 18px;
          border: 1px solid #BAE6FD;
          background: #FFFFFF;
          padding: 0 16px;
          box-shadow: 0 12px 28px rgba(2,132,199,0.05);
          transition: all 0.22s ease;
        }

        .input-box:focus-within {
          border-color: #0EA5E9;
          box-shadow: 0 0 0 5px rgba(14,165,233,0.13);
        }

        .input-box input {
          flex: 1;
          height: 100%;
          border: none;
          outline: none;
          background: transparent;
          color: #0F172A;
          font-size: 15px;
          font-weight: 800;
          font-family: inherit;
        }

        .submit-btn {
          margin-top: 4px;
          width: 100%;
          height: 56px;
          border: none;
          border-radius: 18px;
          background: linear-gradient(135deg, #0EA5E9, #38BDF8);
          color: white;
          font-size: 15px;
          font-weight: 950;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          box-shadow: 0 20px 42px rgba(14,165,233,0.28);
          transition: all 0.24s ease;
        }

        .submit-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 28px 56px rgba(14,165,233,0.36);
        }

        .submit-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
        }

        .switch-text {
          margin-top: 24px;
          text-align: center;
          color: #64748B;
          font-size: 14px;
          font-weight: 720;
        }

        .switch-text a,
        .back-link {
          color: #0284C7;
          font-weight: 950;
          text-decoration: none;
        }

        .back-link {
          display: block;
          margin-top: 16px;
          text-align: center;
          font-size: 14px;
        }

        @media (max-width: 980px) {
          .auth-shell {
            grid-template-columns: 1fr;
            padding-top: 92px;
          }

          .visual-card {
            display: none;
          }

          .brand-bar {
            left: 24px;
          }
        }

        @media (max-width: 560px) {
          .sy-auth-page {
            padding: 22px 14px;
          }

          .form-card {
            padding: 30px 22px;
            border-radius: 30px;
          }

          .form-title {
            font-size: 29px;
          }

          .brand-title {
            font-size: 22px;
          }
        }
      `}</style>

      <Link to="/" className="brand-bar">
        <div className="brand-mark">
          <GraduationCap size={32} strokeWidth={2.6} />
        </div>
        <div>
          <div className="brand-title">SkillYatra</div>
          <div className="brand-subtitle">Placement GPS</div>
        </div>
      </Link>

      <div className="auth-shell">
        <section className="form-card">
          <div className="form-logo">
            <GraduationCap size={38} strokeWidth={2.6} />
          </div>

          <h2 className="form-title">Create Account</h2>

          <p className="form-subtitle">
            Start your placement preparation journey.
          </p>

          <form onSubmit={handleSubmit} className="form-area">
            <label>
              <span className="field-label">Full Name</span>
              <div className="input-box">
                <User size={20} color="#0284C7" />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  required
                />
              </div>
            </label>

            <label>
              <span className="field-label">Email</span>
              <div className="input-box">
                <Mail size={20} color="#0284C7" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  required
                />
              </div>
            </label>

            <label>
              <span className="field-label">Password</span>
              <div className="input-box">
                <Lock size={20} color="#0284C7" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                />
              </div>
            </label>

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? "Creating..." : "Sign Up"}
              <ArrowRight size={17} />
            </button>
          </form>

          <p className="switch-text">
            Already have an account?{" "}
            <Link to="/login">
              Login
            </Link>
          </p>

          <Link to="/" className="back-link">
            Back to Home
          </Link>
        </section>

        <section className="visual-card">
          <div className="visual-inner">
            <div className="badge">
              <Sparkles size={15} />
              New Journey
            </div>

            <h1 className="visual-title">
              Build your
              <br />
              <span className="gradient-text">placement profile.</span>
            </h1>

            <p className="visual-desc">
              Save your progress, track skill gaps, practice role-wise,
              and prepare confidently for placements.
            </p>

            <div className="floating-board">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 950, letterSpacing: "2px", opacity: 0.88 }}>
                    PROFILE BUILDER
                  </p>
                  <h3 style={{ marginTop: 8, fontSize: 28, fontWeight: 950 }}>
                    Career Ready
                  </h3>
                </div>
                <CheckCircle2 size={34} />
              </div>

              <div className="board-grid">
                {["Daily Planner", "DSA Tracker", "Mock Interview", "Resume Coach"].map((item) => (
                  <div key={item} className="board-item">
                    <p style={{ fontSize: 14, fontWeight: 950 }}>{item}</p>
                    <p style={{ marginTop: 5, fontSize: 12, fontWeight: 800, opacity: 0.82 }}>
                      Included
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
