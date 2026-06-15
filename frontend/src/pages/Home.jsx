import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Brain,
  Building2,
  CalendarCheck,
  FileText,
  GraduationCap,
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

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    const timer = setTimeout(() => setVisible(true), 100);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const savedStyles = [];

    const unlockScroll = (el) => {
      if (!el) return;

      savedStyles.push({
        el,
        overflow: el.style.overflow,
        overflowY: el.style.overflowY,
        height: el.style.height,
        minHeight: el.style.minHeight
      });

      el.style.overflow = "visible";
      el.style.overflowY = "auto";
      el.style.height = "auto";
      el.style.minHeight = "100%";
    };

    unlockScroll(document.documentElement);
    unlockScroll(document.body);
    unlockScroll(document.getElementById("root"));

    return () => {
      savedStyles.forEach((item) => {
        item.el.style.overflow = item.overflow;
        item.el.style.overflowY = item.overflowY;
        item.el.style.height = item.height;
        item.el.style.minHeight = item.minHeight;
      });
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

  return (
    <div className="sy-home">
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap");

        * {
          box-sizing: border-box;
        }

        html,
        body,
        #root {
          width: 100%;
          min-height: 100%;
          height: auto !important;
          overflow-x: hidden !important;
          overflow-y: auto !important;
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
        }

        .sy-home {
          width: 100%;
          min-height: 100vh;
          height: auto !important;
          overflow-x: hidden;
          overflow-y: visible;
          color: #0F172A;
          font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          background:
            radial-gradient(circle at 10% 6%, rgba(125, 211, 252, 0.24), transparent 32%),
            radial-gradient(circle at 88% 10%, rgba(186, 230, 253, 0.34), transparent 30%),
            linear-gradient(180deg, #F7FCFF 0%, #EEF8FF 45%, #FFFFFF 100%);
          position: relative;
        }

        .sy-home::before {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          background-image:
            linear-gradient(rgba(14, 165, 233, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(14, 165, 233, 0.05) 1px, transparent 1px);
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
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes bubbleFloat {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1);
            opacity: 0.18;
          }
          50% {
            transform: translate3d(18px, -45px, 0) scale(1.1);
            opacity: 0.42;
          }
        }

        @keyframes imageFloatClean {
          0%, 100% {
            transform: perspective(1200px) rotateX(0deg) rotateY(-5deg) translateY(0) scale(1);
          }
          50% {
            transform: perspective(1200px) rotateX(3deg) rotateY(6deg) translateY(-18px) scale(1.035);
          }
        }

        @keyframes auraMove {
          0% {
            transform: translate(-50%, -50%) rotate(0deg) scale(1);
          }
          50% {
            transform: translate(-50%, -50%) rotate(180deg) scale(1.08);
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg) scale(1);
          }
        }

        @keyframes ringRotate {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }

        @keyframes particleFloat {
          0%, 100% {
            transform: translateY(0) scale(1);
            opacity: 0.45;
          }
          50% {
            transform: translateY(-20px) scale(1.18);
            opacity: 1;
          }
        }

        .bubble-layer {
          position: fixed;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
          z-index: 1;
        }

        .bubble-layer span {
          position: absolute;
          display: block;
          border-radius: 999px;
          background:
            radial-gradient(circle at 30% 25%, rgba(255,255,255,0.95), rgba(186,230,253,0.45) 45%, rgba(125,211,252,0.12) 75%);
          border: 1px solid rgba(186,230,253,0.45);
          box-shadow:
            inset 0 0 18px rgba(255,255,255,0.85),
            0 18px 45px rgba(125,211,252,0.16);
          animation: bubbleFloat 10s ease-in-out infinite;
        }

        .bubble-layer span:nth-child(1) {
          width: 90px;
          height: 90px;
          left: 5%;
          top: 18%;
        }

        .bubble-layer span:nth-child(2) {
          width: 42px;
          height: 42px;
          left: 78%;
          top: 15%;
          animation-delay: 1s;
          animation-duration: 8s;
        }

        .bubble-layer span:nth-child(3) {
          width: 70px;
          height: 70px;
          left: 88%;
          top: 55%;
          animation-delay: 2s;
          animation-duration: 11s;
        }

        .bubble-layer span:nth-child(4) {
          width: 34px;
          height: 34px;
          left: 12%;
          top: 70%;
          animation-delay: 0.7s;
          animation-duration: 8.5s;
        }

        .bubble-layer span:nth-child(5) {
          width: 120px;
          height: 120px;
          left: 46%;
          top: 8%;
          animation-delay: 3s;
          animation-duration: 12s;
        }

        .bubble-layer span:nth-child(6) {
          width: 56px;
          height: 56px;
          left: 66%;
          top: 80%;
          animation-delay: 1.8s;
          animation-duration: 9s;
        }

        .bubble-layer span:nth-child(7) {
          width: 26px;
          height: 26px;
          left: 56%;
          top: 32%;
          animation-delay: 2.8s;
          animation-duration: 7.8s;
        }

        .bubble-layer span:nth-child(8) {
          width: 46px;
          height: 46px;
          left: 28%;
          top: 84%;
          animation-delay: 1.4s;
          animation-duration: 9.8s;
        }

        .bubble-layer span:nth-child(9) {
          width: 22px;
          height: 22px;
          left: 92%;
          top: 28%;
          animation-delay: 3.2s;
          animation-duration: 7.2s;
        }

        .bubble-layer span:nth-child(10) {
          width: 80px;
          height: 80px;
          left: 35%;
          top: 48%;
          animation-delay: 2.5s;
          animation-duration: 10.8s;
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
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(18px);
          box-shadow:
            0 1px 0 rgba(125,211,252,0.18),
            0 18px 48px rgba(14,165,233,0.09);
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
          background: linear-gradient(135deg, #38BDF8, #7DD3FC);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFFFFF;
          box-shadow: 0 18px 38px rgba(56,189,248,0.28);
        }

        .brand-title {
          font-size: 29px;
          font-weight: 950;
          color: #0F172A;
          letter-spacing: -0.9px;
          line-height: 1;
        }

        .brand-subtitle {
          margin-top: 7px;
          font-size: 15px;
          font-weight: 900;
          color: #0284C7;
          letter-spacing: 0.6px;
        }

        .nav-actions {
          display: flex;
          gap: 12px;
        }

        .nav-btn {
          text-decoration: none;
          font-size: 17px;
          font-weight: 950;
          border-radius: 17px;
          padding: 14px 32px;
          white-space: nowrap;
          transition: all 0.22s ease;
        }

        .nav-btn:hover {
          transform: translateY(-2px);
        }

        .nav-login {
          background: rgba(255,255,255,0.96);
          border: 1px solid rgba(125,211,252,0.45);
          color: #075985;
          box-shadow: 0 14px 30px rgba(14,165,233,0.08);
        }

        .nav-signup {
          background: linear-gradient(135deg, #38BDF8, #7DD3FC);
          color: #FFFFFF;
          box-shadow: 0 18px 38px rgba(56,189,248,0.26);
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
          gap: 10px;
          padding: 11px 20px;
          border-radius: 999px;
          background: rgba(255,255,255,0.92);
          border: 1px solid rgba(186,230,253,0.95);
          color: #0284C7;
          font-size: 14px;
          font-weight: 950;
          box-shadow: 0 16px 36px rgba(14,165,233,0.08);
          backdrop-filter: blur(18px);
        }

        .hero-title {
          margin-top: 28px;
          font-size: 82px;
          line-height: 1.01;
          letter-spacing: -2.8px;
          color: #0F172A;
          font-weight: 950;
        }

        .gradient-text {
          background: linear-gradient(135deg, #0284C7, #38BDF8, #7DD3FC);
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
          background: linear-gradient(135deg, #38BDF8, #7DD3FC);
          color: #FFFFFF;
          box-shadow: 0 18px 38px rgba(56,189,248,0.24);
        }

        .btn-secondary {
          background: rgba(255,255,255,0.92);
          color: #075985;
          border: 1px solid rgba(125,211,252,0.40);
          box-shadow: 0 16px 34px rgba(14,165,233,0.07);
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
          background: rgba(255,255,255,0.95);
          border: 1px solid #DBF1FF;
          border-radius: 24px;
          padding: 20px;
          box-shadow: 0 16px 36px rgba(14,165,233,0.07);
          transition: all 0.25s ease;
        }

        .mini-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 26px 54px rgba(14,165,233,0.12);
        }

        .hero-visual {
          position: relative;
          min-height: 440px;
          display: flex;
          align-items: center;
          justify-content: center;
          isolation: isolate;
          padding-bottom: 86px;
        }

        .premium-aura {
          position: absolute;
          left: 50%;
          top: 45%;
          width: 540px;
          height: 540px;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          background:
            radial-gradient(circle at 35% 35%, rgba(34,197,94,0.55), transparent 30%),
            radial-gradient(circle at 72% 38%, rgba(56,189,248,0.48), transparent 34%),
            radial-gradient(circle at 48% 76%, rgba(125,211,252,0.38), transparent 35%);
          filter: blur(24px);
          opacity: 0.9;
          animation: auraMove 11s linear infinite;
          z-index: 1;
        }

        .premium-ring {
          position: absolute;
          left: 50%;
          top: 45%;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          border: 1px solid rgba(125,211,252,0.42);
          box-shadow:
            0 0 30px rgba(56,189,248,0.18),
            inset 0 0 28px rgba(34,197,94,0.10);
          z-index: 2;
        }

        .premium-ring.ring-1 {
          width: 455px;
          height: 455px;
          animation: ringRotate 18s linear infinite;
        }

        .premium-ring.ring-2 {
          width: 360px;
          height: 360px;
          border-style: dashed;
          animation: ringRotate 13s linear infinite reverse;
        }

        .premium-ring.ring-3 {
          width: 255px;
          height: 255px;
          border-color: rgba(34,197,94,0.35);
          animation: ringRotate 10s linear infinite;
        }

        .premium-particle {
          position: absolute;
          width: 12px;
          height: 12px;
          border-radius: 999px;
          background: linear-gradient(135deg, #22C55E, #7DD3FC);
          box-shadow:
            0 0 20px rgba(34,197,94,0.52),
            0 0 36px rgba(125,211,252,0.36);
          z-index: 5;
          animation: particleFloat 4s ease-in-out infinite;
        }

        .particle-1 {
          top: 82px;
          left: 72px;
        }

        .particle-2 {
          top: 132px;
          right: 50px;
          animation-delay: 0.8s;
        }

        .particle-3 {
          bottom: 150px;
          left: 38px;
          animation-delay: 1.4s;
        }

        .particle-4 {
          bottom: 120px;
          right: 84px;
          animation-delay: 2s;
        }

        .particle-5 {
          top: 44%;
          right: 18px;
          width: 9px;
          height: 9px;
          animation-delay: 2.6s;
        }

        .image-clean-wrap {
          position: relative;
          z-index: 6;
          transform-style: preserve-3d;
          perspective: 1200px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .image-orb {
          width: 235px;
          height: 235px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
          z-index: 5;
          background:
            radial-gradient(circle at 30% 25%, rgba(255,255,255,0.98), rgba(224,242,254,0.92) 55%, rgba(186,230,253,0.88) 100%);
          border: 1.5px solid rgba(186,230,253,0.95);
          box-shadow:
            0 24px 55px rgba(14,165,233,0.18),
            0 18px 36px rgba(34,197,94,0.10),
            inset 0 0 24px rgba(255,255,255,0.75);
          animation: imageFloatClean 6.2s ease-in-out infinite;
        }

        .image-orb img {
          width: 82%;
          height: 82%;
          object-fit: contain;
          display: block;
          border-radius: 50%;
          filter:
            drop-shadow(0 18px 28px rgba(14,165,233,0.14))
            drop-shadow(0 10px 20px rgba(34,197,94,0.10));
        }

        .image-caption-box {
          position: relative;
          z-index: 9;
          margin-top: 18px;
          width: min(420px, 92%);
          padding: 18px 20px;
          border-radius: 24px;
          background: rgba(255,255,255,0.92);
          border: 1px solid rgba(186,230,253,0.95);
          backdrop-filter: blur(18px);
          box-shadow:
            0 18px 42px rgba(14,165,233,0.13),
            0 12px 28px rgba(34,197,94,0.08);
          text-align: left;
        }

        .image-caption-box p {
          color: #0284C7;
          font-size: 12px;
          font-weight: 950;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin: 0 0 7px;
        }

        .image-caption-box h3 {
          color: #0F172A;
          font-size: 22px;
          font-weight: 950;
          letter-spacing: -0.45px;
          line-height: 1.18;
          margin: 0;
        }

        .feature-section,
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

        .feature-card {
          background: rgba(255,255,255,0.94);
          border: 1px solid rgba(186,230,253,0.88);
          border-radius: 30px;
          padding: 28px;
          box-shadow: 0 20px 50px rgba(14,165,233,0.08);
          backdrop-filter: blur(18px);
          transition: all 0.25s ease;
          position: relative;
          overflow: hidden;
        }

        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 30px 70px rgba(14,165,233,0.13);
          border-color: rgba(56,189,248,0.36);
        }

        .feature-icon {
          width: 56px;
          height: 56px;
          border-radius: 20px;
          background: #EAF8FF;
          border: 1px solid #CDEEFF;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 21px;
          color: #0284C7;
        }

        .last-cta-box {
          border-radius: 38px;
          background: linear-gradient(135deg, #0EA5E9 0%, #38BDF8 54%, #7DD3FC 100%);
          background-size: 200% 200%;
          animation: skyShift 9s ease infinite;
          padding: 62px 48px;
          text-align: center;
          box-shadow: 0 32px 80px rgba(56,189,248,0.22);
          position: relative;
          overflow: hidden;
        }

        @media (prefers-reduced-motion: reduce) {
          .image-clean-wrap img,
          .bubble-layer span,
          .gradient-text,
          .last-cta-box,
          .premium-aura,
          .premium-ring,
          .premium-particle {
            animation: none;
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
            font-size: 62px;
          }

          .hero-visual {
            min-height: 480px;
            margin-top: 10px;
          }

          .premium-aura {
            width: 430px;
            height: 430px;
          }

          .premium-ring.ring-1 {
            width: 380px;
            height: 380px;
          }

          .premium-ring.ring-2 {
            width: 300px;
            height: 300px;
          }

          .premium-ring.ring-3 {
            width: 220px;
            height: 220px;
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
            font-size: 46px;
            letter-spacing: -1.4px;
          }

          .features-grid,
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .nav-btn {
            padding: 11px 17px;
            font-size: 14px;
          }

          .brand-mark {
            width: 54px;
            height: 54px;
            border-radius: 20px;
          }

          .brand-title {
            font-size: 23px;
          }

          .hero-visual {
            min-height: 500px;
            padding-bottom: 50px;
          }

          .premium-aura {
            width: 330px;
            height: 330px;
          }

          .premium-ring.ring-1 {
            width: 300px;
            height: 300px;
          }

          .premium-ring.ring-2 {
            width: 235px;
            height: 235px;
          }

          .premium-ring.ring-3 {
            width: 175px;
            height: 175px;
          }

          .premium-particle {
            display: none;
          }

          .image-orb {
            width: 190px;
            height: 190px;
          }

          .image-orb img {
            width: 80%;
            height: 80%;
          }

          .image-caption-box {
            width: 94%;
            margin-top: 12px;
            padding: 15px 16px;
          }

          .image-caption-box h3 {
            font-size: 18px;
          }

          .last-cta-box {
            padding: 42px 24px;
          }
        }
      `}</style>

      <div className="bubble-layer" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>

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
                <div
                  key={label}
                  className="mini-card"
                  style={{ borderTop: "4px solid #38BDF8" }}
                >
                  <p
                    style={{
                      fontSize: 31,
                      fontWeight: 950,
                      color: "#0F172A",
                      margin: 0
                    }}
                  >
                    <CountUpValue value={value} suffix={suffix} active={visible} />
                  </p>

                  <p
                    style={{
                      marginTop: 8,
                      marginBottom: 0,
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

          <div className={`${visible ? "enter d3" : ""} hero-visual`}>
            <div className="premium-aura" />

            <div className="premium-ring ring-1" />
            <div className="premium-ring ring-2" />
            <div className="premium-ring ring-3" />

            <span className="premium-particle particle-1" />
            <span className="premium-particle particle-2" />
            <span className="premium-particle particle-3" />
            <span className="premium-particle particle-4" />
            <span className="premium-particle particle-5" />

            <div className="image-clean-wrap">
              <div className="image-orb">
                <img
                  src="/student-3d.png"
                  alt="3D student preparing for placement on laptop"
                />
              </div>

              <div className="image-caption-box">
                <p>Smart Placement Preparation</p>
                <h3>
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

                  <h3
                    style={{
                      fontSize: 18,
                      color: "#0F172A",
                      fontWeight: 950,
                      marginBottom: 10
                    }}
                  >
                    {item.title}
                  </h3>

                  <p
                    style={{
                      fontSize: 14,
                      color: "#475569",
                      lineHeight: 1.72,
                      fontWeight: 720,
                      margin: 0
                    }}
                  >
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="last-cta">
          <div className="last-cta-box">
            <h3
              style={{
                fontSize: 42,
                color: "white",
                fontWeight: 950,
                letterSpacing: "-0.9px",
                margin: 0
              }}
            >
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
                boxShadow: "0 18px 40px rgba(14,165,233,0.20)"
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
